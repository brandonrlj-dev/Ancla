'use server'

import { createServiceClient } from '@/lib/supabase/service'

// ── Encryption ────────────────────────────────────────────────────────────────

async function encryptContact(plaintext: string): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'ancla-fallback-key'),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: new TextEncoder().encode('ancla-contact-v1'), iterations: 10_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt'],
  )
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plaintext))
  const toB64 = (arr: Uint8Array) => btoa(String.fromCharCode(...arr))
  return `${toB64(iv)}:${toB64(new Uint8Array(ciphertext))}`
}

// ── Embedding ─────────────────────────────────────────────────────────────────

function buildAgressorText(plataforma: string, patterns: string[], identificador?: string): string {
  const parts = [`plataforma: ${plataforma}`, `tacticas: ${patterns.join(', ')}`]
  if (identificador) parts.push(`identificador: ${identificador}`)
  return parts.join('. ')
}

async function getEmbedding(text: string): Promise<string> {
  const key   = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY
  const model = process.env.GEMINI_EMBEDDING_MODEL ?? 'text-embedding-004'
  if (!key) throw new Error('Gemini API key not configured')
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: { parts: [{ text }] }, outputDimensionality: 768 }),
    },
  )
  if (!res.ok) throw new Error(`Gemini embedding ${res.status}: ${await res.text()}`)
  const json = await res.json() as { embedding: { values: number[] } }
  return `[${json.embedding.values.join(',')}]`
}

// ── Derivations ───────────────────────────────────────────────────────────────

function deriveUrgency(patterns: string[]): string {
  if (patterns.includes('amenaza_difusion')) return 'critica'
  if (patterns.length >= 2) return 'alta'
  if (patterns.length === 1) return 'media'
  return 'baja'
}

function deriveRiesgo(patterns: string[]): string {
  if (patterns.includes('amenaza_difusion')) return 'critico'
  if (patterns.length >= 2) return 'alto'
  return 'medio'
}

// ── Aggressor analysis ────────────────────────────────────────────────────────

type Supabase = ReturnType<typeof createServiceClient>

interface MatchRow {
  perfil_id: string
  similitud: number
  num_reportes: number
  nivel_riesgo: string
}

// Match found: insert vinculación as a suggestion without touching num_victimas.
// If there's no open alerta for the perfil, create a new one tied to the same profile.
// Score >= 0.95: escalate alerta urgency so the police notices immediately.
// Also accumulates municipio in the aggressor profile's zonas_activas.
async function handleMatch(
  best: MatchRow,
  reporteId: string,
  plataforma: string,
  patterns: string[],
  municipio: string | undefined,
  supabase: Supabase,
): Promise<void> {
  const { data: alerta } = await supabase
    .from('alertas')
    .select('id, nivel_urgencia')
    .eq('perfil_id', best.perfil_id)
    .in('estado', ['nueva', 'en_investigacion'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let alertaId: string

  if (alerta) {
    alertaId = alerta.id as string

    // High confidence: escalate urgency — police must review this immediately
    if (best.similitud >= 0.95 && alerta.nivel_urgencia !== 'critica') {
      await supabase
        .from('alertas')
        .update({ nivel_urgencia: 'critica', updated_at: new Date().toISOString() })
        .eq('id', alertaId)
    }
  } else {
    // Matched perfil has no open case — open a new one for the same aggressor
    const { data: newAlerta, error } = await supabase
      .from('alertas')
      .insert({
        nivel_urgencia:  deriveUrgency(patterns),
        num_victimas:    1,
        perfil_id:       best.perfil_id,
        plataformas:     [plataforma],
        zona_geografica: municipio ?? null,
        estado:          'nueva',
      })
      .select('id')
      .single()

    if (error || !newAlerta) return
    alertaId = newAlerta.id as string
  }

  // Add municipio to the aggressor's known zones (no duplicates via array_append logic)
  if (municipio) {
    await supabase.rpc('agregar_zona_agresor', {
      p_perfil_id: best.perfil_id,
      p_zona:      municipio,
    })
  }

  // Insert as suggestion — police must confirm before num_victimas is updated
  await supabase.from('vinculaciones').insert({
    alerta_id:       alertaId,
    reporte_id:      reporteId,
    similitud_score: best.similitud,
  })
  // unique constraint (alerta_id, reporte_id) handles concurrent duplicates silently
}

// No match: create a new aggressor profile and a confirmed alerta linked to this report.
async function createNewProfile(
  embeddingStr: string,
  reporteId: string,
  plataforma: string,
  patterns: string[],
  municipio: string | undefined,
  supabase: Supabase,
): Promise<void> {
  const { data: perfil, error: perfilErr } = await supabase
    .from('perfiles_agresores')
    .insert({
      patron_vector:  embeddingStr,
      plataformas:    [plataforma],
      tacticas:       patterns,
      nivel_riesgo:   deriveRiesgo(patterns),
      zonas_activas:  municipio ? [municipio] : [],
    })
    .select('id')
    .single()

  if (perfilErr || !perfil) return

  const { data: alerta, error: alertaErr } = await supabase
    .from('alertas')
    .insert({
      nivel_urgencia:  deriveUrgency(patterns),
      num_victimas:    1,
      perfil_id:       perfil.id,
      plataformas:     [plataforma],
      zona_geografica: municipio ?? null,
      estado:          'nueva',
    })
    .select('id')
    .single()

  if (alertaErr || !alerta) return

  // Link the report to its confirmed alerta (new profile = not a suggestion)
  await supabase
    .from('reportes_directos')
    .update({ alerta_id: alerta.id, updated_at: new Date().toISOString() })
    .eq('id', reporteId)
}

async function analyzeAndLink(
  reporteId: string,
  plataforma: string,
  patterns: string[],
  identificador: string | undefined,
  municipio: string | undefined,
  supabase: Supabase,
): Promise<void> {
  if (patterns.length === 0) return

  const urgency = deriveUrgency(patterns)

  try {
    const embeddingStr = await getEmbedding(buildAgressorText(plataforma, patterns, identificador))

    // Vector search via HNSW index; already filtered by platform threshold from config_plataformas
    const { data: matches, error: rpcErr } = await supabase.rpc('buscar_perfil_similar', {
      p_embedding:  embeddingStr,
      p_plataforma: plataforma,
    })

    if (rpcErr) throw rpcErr

    if (matches && (matches as MatchRow[]).length > 0) {
      await handleMatch((matches as MatchRow[])[0], reporteId, plataforma, patterns, municipio, supabase)
    } else {
      await createNewProfile(embeddingStr, reporteId, plataforma, patterns, municipio, supabase)
    }
    return
  } catch (err) {
    // Embedding or vector search failed — fall back to a basic alerta with no profile link
    console.error('[analyzeAndLink] embedding/vector error, falling back:', err)
  }

  await supabase.from('alertas').insert({
    nivel_urgencia:  urgency,
    num_victimas:    1,
    perfil_id:       null,
    plataformas:     [plataforma],
    zona_geografica: municipio ?? null,
    estado:          'nueva',
  })
}

// ── Public API ────────────────────────────────────────────────────────────────

function deriveReportType(patterns: string[]): string {
  if (patterns.includes('amenaza_difusion') || patterns.includes('solicitud_imagen')) return 'sextorsion'
  if (patterns.some((p) => ['gradualidad_sexual', 'love_bombing', 'secretismo'].includes(p))) return 'grooming'
  return 'acoso'
}

export interface SubmitReportParams {
  folio: string
  hashSha256: string
  patterns: string[]
  plataforma: string
  identificador?: string
  municipio?: string
  tipoReporte: 'privado' | 'legal'
  contacto?: string
  contactoFamiliar?: string
  nombreFamiliar?: string
  sessionToken: string
}

export interface SubmitReportResult {
  reporteId: string
  folio: string
}

export async function submitReport(params: SubmitReportParams): Promise<SubmitReportResult> {
  const supabase = createServiceClient()
  const tipo = deriveReportType(params.patterns)

  let contactoCifrado: string | null = null
  if (params.tipoReporte === 'privado' && params.contacto?.trim()) {
    contactoCifrado = await encryptContact(params.contacto.trim())
  }

  let contactoFamiliarCifrado: string | null = null
  if (params.tipoReporte === 'legal' && params.contactoFamiliar?.trim()) {
    const payload = JSON.stringify({
      nombre:   params.nombreFamiliar?.trim() ?? null,
      contacto: params.contactoFamiliar.trim(),
    })
    contactoFamiliarCifrado = await encryptContact(payload)
  }

  const adultoAlTanto = params.tipoReporte === 'legal' ? true : null

  const perfilAgresor = {
    plataformas:      [params.plataforma],
    identificadores:  params.identificador ? [params.identificador] : [],
    telefono:         null,
    pais_estimado:    'MX',
    tacticas:         params.patterns,
    descripcion_libre: null,
  }

  const { data, error } = await supabase
    .from('reportes_directos')
    .insert({
      folio:                     params.folio,
      hash_sha256:               params.hashSha256,
      plataforma:                params.plataforma,
      tipo,
      tipo_reporte:              params.tipoReporte,
      patrones:                  params.patterns,
      perfil_agresor:            perfilAgresor,
      contacto_cifrado:          contactoCifrado,
      contacto_familiar_cifrado: contactoFamiliarCifrado,
      adulto_al_tanto:           adultoAlTanto,
      estado:                    'nuevo',
    })
    .select('id, folio')
    .single()

  if (error) throw new Error(`[submitReport] ${error.message}`)

  // Analysis runs after report is safely stored — any failure is silent
  try {
    await analyzeAndLink(data.id, params.plataforma, params.patterns, params.identificador, params.municipio, supabase)
  } catch {
    // intentionally silent
  }

  return { reporteId: data.id, folio: data.folio }
}
