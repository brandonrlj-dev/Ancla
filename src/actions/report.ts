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

let _cachedEmbedModel: string | null = null

async function resolveEmbedModel(key: string): Promise<string> {
  if (process.env.GEMINI_EMBEDDING_MODEL) return process.env.GEMINI_EMBEDDING_MODEL
  if (_cachedEmbedModel) return _cachedEmbedModel

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
  )
  if (!res.ok) throw new Error(`Gemini ListModels ${res.status}`)
  const json = await res.json() as { models?: { name: string; supportedGenerationMethods?: string[] }[] }
  const model = (json.models ?? []).find((m) => m.supportedGenerationMethods?.includes('embedContent'))
  if (!model) throw new Error('No Gemini embedding model available for this API key')
  console.log('[getEmbedding] using model:', model.name)
  _cachedEmbedModel = model.name
  return model.name
}

async function getEmbedding(text: string): Promise<string> {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY
  if (!key) throw new Error('Gemini API key not configured')
  const model = await resolveEmbedModel(key)
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${model}:embedContent?key=${key}`,
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

interface SimilarRow { perfil_id: string; similitud: number }

async function analyzeAndLink(
  reporteId: string,
  plataforma: string,
  patterns: string[],
  identificador: string | undefined,
  municipio: string | undefined,
  supabase: Supabase,
): Promise<void> {
  if (patterns.length === 0) return

  try {
    const embeddingStr = await getEmbedding(buildAgressorText(plataforma, patterns, identificador))

    // 1. Always create a new profile for this report
    const { data: perfil, error: perfilErr } = await supabase
      .from('perfiles_agresores')
      .insert({
        patron_vector:   embeddingStr,
        plataformas:     [plataforma],
        tacticas:        patterns,
        nivel_riesgo:    deriveRiesgo(patterns),
        zonas_activas:   municipio     ? [municipio]     : [],
        identificadores: identificador ? [identificador] : [],
      })
      .select('id')
      .single()

    if (perfilErr || !perfil) {
      console.error('[analyzeAndLink] perfil insert failed:', perfilErr)
      return
    }

    // 2. Always create a new alert linked to the profile
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

    if (alertaErr || !alerta) {
      console.error('[analyzeAndLink] alerta insert failed:', alertaErr)
      return
    }

    // 3. Link report to alert
    await supabase
      .from('reportes_directos')
      .update({ alerta_id: alerta.id, updated_at: new Date().toISOString() })
      .eq('id', reporteId)

    // 4. Find similar profiles using the platform threshold — police decides what to do
    const { data: similares } = await supabase.rpc('buscar_perfil_similar', {
      p_embedding:  embeddingStr,
      p_plataforma: plataforma,
    })

    for (const sim of (similares ?? []) as SimilarRow[]) {
      if (sim.perfil_id === perfil.id) continue  // skip self (just inserted)
      const [a, b] = [perfil.id, sim.perfil_id].sort()
      await supabase.from('vinculaciones_perfiles').upsert(
        { perfil_a_id: a, perfil_b_id: b, similitud_score: sim.similitud, confirmada: false, descartada: false },
        { onConflict: 'perfil_a_id,perfil_b_id' },
      )
    }

  } catch (err) {
    console.error('[analyzeAndLink] error, falling back to profileless alert:', err)
    // Fallback: at least create an alert so police sees the report flagged
    await supabase.from('alertas').insert({
      nivel_urgencia:  deriveUrgency(patterns),
      num_victimas:    1,
      perfil_id:       null,
      plataformas:     [plataforma],
      zona_geografica: municipio ?? null,
      estado:          'nueva',
    })
  }
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
