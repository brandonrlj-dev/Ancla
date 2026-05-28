#!/usr/bin/env node
// Seed script for ANCLA demo — Nayarit data v3
// Run: npm run seed
// Requires .env.local with NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_GENERATIVE_AI_API_KEY

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// ── Load .env.local ───────────────────────────────────────────────────────────

function loadEnv() {
  try {
    const raw = readFileSync('.env.local', 'utf8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const idx = trimmed.indexOf('=')
      if (idx === -1) continue
      const key = trimmed.slice(0, idx).trim()
      const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    console.error('Could not read .env.local — run from project root.')
    process.exit(1)
  }
}

loadEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY
const GEMINI_KEY   = process.env.GOOGLE_GENERATIVE_AI_API_KEY

if (!SUPABASE_URL || !SERVICE_KEY || !GEMINI_KEY) {
  console.error('Missing: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_GENERATIVE_AI_API_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function ok(label)        { console.log(`  ✓ ${label}`) }
function fail(label, err) { console.error(`  ✗ ${label}: ${err?.message ?? err}`); throw err }

function deriveUrgency(tacticas) {
  if (tacticas.includes('amenaza_difusion')) return 'critica'
  if (tacticas.includes('solicitud_imagen') && tacticas.length >= 2) return 'critica'
  if (tacticas.length >= 2) return 'alta'
  if (tacticas.length === 1) return 'media'
  return 'baja'
}

function deriveRiesgo(tacticas) {
  if (tacticas.includes('amenaza_difusion')) return 'critico'
  if (tacticas.length >= 2) return 'alto'
  return 'medio'
}

// ── Embedding ─────────────────────────────────────────────────────────────────

let EMBED_MODEL = null

async function resolveEmbedModel() {
  if (EMBED_MODEL) return EMBED_MODEL
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_KEY}`)
  if (!res.ok) throw new Error(`ListModels ${res.status}`)
  const json = await res.json()
  const model = (json.models ?? []).find(m => m.supportedGenerationMethods?.includes('embedContent'))
  if (!model) { console.error('  ✗ Sin modelo de embedding para esta API key'); process.exit(1) }
  EMBED_MODEL = model.name
  console.log(`  Modelo de embedding: ${EMBED_MODEL}`)
  return EMBED_MODEL
}

async function embed(text) {
  const model = await resolveEmbedModel()
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${model}:embedContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: { parts: [{ text }] }, outputDimensionality: 768 }),
    },
  )
  if (!res.ok) throw new Error(`Embedding ${res.status}: ${await res.text()}`)
  const json = await res.json()
  return `[${json.embedding.values.join(',')}]`
}

// ── Step 0: Cleanup ───────────────────────────────────────────────────────────

console.log('\n🗑️  Limpiando registros anteriores...')

const NEVER = '00000000-0000-0000-0000-000000000000'
for (const table of ['vinculaciones_perfiles', 'vinculaciones', 'reportes_directos', 'alertas', 'perfiles_agresores']) {
  const { error } = await supabase.from(table).delete().neq('id', NEVER)
  if (error) console.warn(`  ⚠ ${table}: ${error.message}`)
  else ok(table)
}

// ── Step 1: Agent accounts ────────────────────────────────────────────────────

console.log('\n👮 Verificando cuentas de agentes...')

const AGENTS = [
  { email: 'agente1@policia-nayarit.gob.mx', password: 'AnclaDemo2025!', nombre: 'Lic. Ramírez' },
  { email: 'agente2@policia-nayarit.gob.mx', password: 'AnclaDemo2025!', nombre: 'Lic. Torres'  },
]

for (const agent of AGENTS) {
  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 200 })
  const existing = list?.users?.find(u => u.email === agent.email)
  if (existing) { ok(`${agent.email} (ya existe)`); continue }
  const { error } = await supabase.auth.admin.createUser({
    email: agent.email, password: agent.password,
    user_metadata: { rol: 'policia', nombre: agent.nombre },
    email_confirm: true,
  })
  if (error) fail(agent.email, error)
  else ok(agent.email)
}

// ── Scenario definitions ──────────────────────────────────────────────────────
//
// Regla: 1 perfil = 1 plataforma (igual que el flujo real de analyzeAndLink).
// Si 2 reportes comparten plataforma + identificador → van al mismo perfil (num_reportes acumula).
// Si el policía sospecha que 2 perfiles distintos son la misma persona (distinta plataforma
// o distinto usuario) → se refleja en vinculaciones_perfiles (step 3), no en el perfil mismo.
//
// Escenarios de demostración:
//
//   [A] @kevin_mx99 en Instagram — 2 reportes (mismo usuario, misma plataforma)
//   [B] 3311234567  en WhatsApp  — 1 reporte  (posiblemente el mismo que [A], plataforma distinta)
//   [C] @kevsports_oficial en Instagram — 2 reportes (tácticas similares a [A], ¿el mismo?)
//   [D] xXDarkXx1234 en Roblox   — 1 reporte
//   [E] darkgamer#8821 en Discord — 1 reporte (posiblemente el mismo que [D], plataforma distinta)
//   [F] ProGamer_Mx99 en Roblox   — 1 reporte (tácticas similares a [D])
//   [G] @tiktok_acoso8912 en TikTok — 2 reportes
//   [H] @acoso.ig8912 en Instagram  — 1 reporte (posiblemente el mismo que [G])
//   [I] 3111987654 en WhatsApp — 1 reporte (sextorsión crítica)

const SCENARIOS = [
  // ── [A] @kevin_mx99 / Instagram ─────────────────────────────────────────────
  {
    label: '@kevin_mx99 / Instagram',
    perfil: {
      plataformas:     ['Instagram'],
      tacticas:        ['love_bombing', 'solicitud_imagen', 'amenaza_difusion', 'secretismo'],
      zonas_activas:   ['Tepic, Nayarit'],
      identificadores: ['@kevin_mx99'],
    },
    alerta: { plataformas: ['Instagram'], zona_geografica: 'Tepic, Nayarit', num_victimas: 2, estado: 'en_investigacion' },
    reportes: [
      {
        folio: 'A-DE7A91', hash_sha256: 'sha256:de7a91b2c3d4e5f6a7b8c9d0e1f2a3b4',
        plataforma: 'Instagram', tipo: 'sextorsion', tipo_reporte: 'legal',
        patrones: ['love_bombing', 'solicitud_imagen', 'amenaza_difusion'],
        perfil_agresor: { plataformas: ['Instagram'], identificadores: ['@kevin_mx99'], telefono: null, pais_estimado: 'MX', tacticas: ['love_bombing', 'solicitud_imagen', 'amenaza_difusion'], descripcion_libre: 'Se presentó como estudiante de preparatoria' },
        adulto_al_tanto: true, estado: 'procesado',
      },
      {
        folio: 'A-8B3C1E', hash_sha256: 'sha256:8b3c1ea2b3c4d5e6f7a8b9c0d1e2f3a4',
        plataforma: 'Instagram', tipo: 'sextorsion', tipo_reporte: 'privado',
        patrones: ['love_bombing', 'solicitud_imagen'],
        perfil_agresor: { plataformas: ['Instagram'], identificadores: ['@kevin_mx99'], telefono: null, pais_estimado: 'MX', tacticas: ['love_bombing', 'solicitud_imagen'], descripcion_libre: null },
        adulto_al_tanto: null, estado: 'nuevo',
      },
    ],
  },

  // ── [B] 3311234567 / WhatsApp ────────────────────────────────────────────────
  {
    label: '3311234567 / WhatsApp',
    perfil: {
      plataformas:     ['WhatsApp'],
      tacticas:        ['solicitud_imagen', 'amenaza_difusion', 'secretismo'],
      zonas_activas:   ['Tepic, Nayarit'],
      identificadores: ['3311234567'],
    },
    alerta: { plataformas: ['WhatsApp'], zona_geografica: 'Tepic, Nayarit', num_victimas: 1, estado: 'nueva' },
    reportes: [
      {
        folio: 'A-4F2B3C', hash_sha256: 'sha256:4f2b3ca9b8c7d6e5f4a3b2c1d0e9f8a7',
        plataforma: 'WhatsApp', tipo: 'sextorsion', tipo_reporte: 'privado',
        patrones: ['solicitud_imagen', 'amenaza_difusion', 'secretismo'],
        perfil_agresor: { plataformas: ['WhatsApp'], identificadores: ['3311234567'], telefono: null, pais_estimado: 'MX', tacticas: ['solicitud_imagen', 'amenaza_difusion'], descripcion_libre: null },
        adulto_al_tanto: null, estado: 'en_revision',
      },
    ],
  },

  // ── [C] @kevsports_oficial / Instagram ──────────────────────────────────────
  {
    label: '@kevsports_oficial / Instagram',
    perfil: {
      plataformas:     ['Instagram'],
      tacticas:        ['solicitud_imagen', 'amenaza_difusion', 'presion'],
      zonas_activas:   ['Tepic, Nayarit'],
      identificadores: ['@kevsports_oficial'],
    },
    alerta: { plataformas: ['Instagram'], zona_geografica: 'Tepic, Nayarit', num_victimas: 2, estado: 'nueva' },
    reportes: [
      {
        folio: 'A-9C4D2F', hash_sha256: 'sha256:9c4d2fa1b2c3d4e5f6a7b8c9d0e1f2a3',
        plataforma: 'Instagram', tipo: 'sextorsion', tipo_reporte: 'legal',
        patrones: ['solicitud_imagen', 'amenaza_difusion', 'presion'],
        perfil_agresor: { plataformas: ['Instagram'], identificadores: ['@kevsports_oficial'], telefono: null, pais_estimado: 'MX', tacticas: ['solicitud_imagen', 'amenaza_difusion', 'presion'], descripcion_libre: 'Dice ser fotógrafo de modelos' },
        adulto_al_tanto: true, estado: 'nuevo',
      },
      {
        folio: 'A-5E7F9A', hash_sha256: 'sha256:5e7f9ab1c2d3e4f5a6b7c8d9e0f1a2b3',
        plataforma: 'Instagram', tipo: 'sextorsion', tipo_reporte: 'privado',
        patrones: ['solicitud_imagen', 'secretismo'],
        perfil_agresor: { plataformas: ['Instagram'], identificadores: ['@kevsports_oficial'], telefono: null, pais_estimado: 'MX', tacticas: ['solicitud_imagen', 'secretismo'], descripcion_libre: null },
        adulto_al_tanto: null, estado: 'nuevo',
      },
    ],
  },

  // ── [D] xXDarkXx1234 / Roblox ───────────────────────────────────────────────
  {
    label: 'xXDarkXx1234 / Roblox',
    perfil: {
      plataformas:     ['Roblox'],
      tacticas:        ['love_bombing', 'aislamiento', 'secretismo'],
      zonas_activas:   ['Bahía de Banderas, Nayarit'],
      identificadores: ['xXDarkXx1234'],
    },
    alerta: { plataformas: ['Roblox'], zona_geografica: 'Bahía de Banderas, Nayarit', num_victimas: 1, estado: 'en_investigacion' },
    reportes: [
      {
        folio: 'A-7C8E2D', hash_sha256: 'sha256:7c8e2d1a0b9f8e7d6c5b4a3f2e1d0c9b',
        plataforma: 'Roblox', tipo: 'grooming', tipo_reporte: 'legal',
        patrones: ['love_bombing', 'aislamiento', 'secretismo'],
        perfil_agresor: { plataformas: ['Roblox'], identificadores: ['xXDarkXx1234'], telefono: null, pais_estimado: 'MX', tacticas: ['love_bombing', 'aislamiento', 'secretismo'], descripcion_libre: 'Afirmaba tener 14 años' },
        adulto_al_tanto: true, estado: 'procesado',
      },
    ],
  },

  // ── [E] darkgamer#8821 / Discord ─────────────────────────────────────────────
  {
    label: 'darkgamer#8821 / Discord',
    perfil: {
      plataformas:     ['Discord'],
      tacticas:        ['love_bombing', 'secretismo', 'aislamiento'],
      zonas_activas:   ['Bahía de Banderas, Nayarit'],
      identificadores: ['darkgamer#8821'],
    },
    alerta: { plataformas: ['Discord'], zona_geografica: 'Bahía de Banderas, Nayarit', num_victimas: 1, estado: 'nueva' },
    reportes: [
      {
        folio: 'A-2F4A8C', hash_sha256: 'sha256:2f4a8c1b2c3d4e5f6a7b8c9d0e1f2a3b',
        plataforma: 'Discord', tipo: 'grooming', tipo_reporte: 'privado',
        patrones: ['love_bombing', 'secretismo', 'aislamiento'],
        perfil_agresor: { plataformas: ['Discord'], identificadores: ['darkgamer#8821'], telefono: null, pais_estimado: 'MX', tacticas: ['love_bombing', 'secretismo'], descripcion_libre: 'Voz de adulto en llamadas de Discord' },
        adulto_al_tanto: null, estado: 'nuevo',
      },
    ],
  },

  // ── [F] ProGamer_Mx99 / Roblox ───────────────────────────────────────────────
  {
    label: 'ProGamer_Mx99 / Roblox',
    perfil: {
      plataformas:     ['Roblox'],
      tacticas:        ['love_bombing', 'aislamiento', 'secretismo'],
      zonas_activas:   ['Xalisco, Nayarit'],
      identificadores: ['ProGamer_Mx99'],
    },
    alerta: { plataformas: ['Roblox'], zona_geografica: 'Xalisco, Nayarit', num_victimas: 1, estado: 'nueva' },
    reportes: [
      {
        folio: 'A-3B6D0E', hash_sha256: 'sha256:3b6d0ea1b2c3d4e5f6a7b8c9d0e1f2a3',
        plataforma: 'Roblox', tipo: 'grooming', tipo_reporte: 'legal',
        patrones: ['love_bombing', 'aislamiento', 'secretismo'],
        perfil_agresor: { plataformas: ['Roblox'], identificadores: ['ProGamer_Mx99'], telefono: null, pais_estimado: 'MX', tacticas: ['love_bombing', 'aislamiento'], descripcion_libre: 'Ofrece items gratis para iniciar contacto' },
        adulto_al_tanto: true, estado: 'nuevo',
      },
    ],
  },

  // ── [G] @tiktok_acoso8912 / TikTok ───────────────────────────────────────────
  {
    label: '@tiktok_acoso8912 / TikTok',
    perfil: {
      plataformas:     ['TikTok'],
      tacticas:        ['presion', 'aislamiento'],
      zonas_activas:   ['Compostela, Nayarit'],
      identificadores: ['@tiktok_acoso8912'],
    },
    alerta: { plataformas: ['TikTok'], zona_geografica: 'Compostela, Nayarit', num_victimas: 2, estado: 'nueva' },
    reportes: [
      {
        folio: 'A-1A9F5B', hash_sha256: 'sha256:1a9f5bc2d3e4f5a6b7c8d9e0f1a2b3c4',
        plataforma: 'TikTok', tipo: 'acoso', tipo_reporte: 'privado',
        patrones: ['presion', 'aislamiento'],
        perfil_agresor: { plataformas: ['TikTok'], identificadores: ['@tiktok_acoso8912'], telefono: null, pais_estimado: 'MX', tacticas: ['presion', 'aislamiento'], descripcion_libre: null },
        adulto_al_tanto: null, estado: 'nuevo',
      },
      {
        folio: 'A-9E1C7B', hash_sha256: 'sha256:9e1c7b2a3b4c5d6e7f8a9b0c1d2e3f4a',
        plataforma: 'TikTok', tipo: 'acoso', tipo_reporte: 'privado',
        patrones: ['presion', 'aislamiento'],
        perfil_agresor: { plataformas: ['TikTok'], identificadores: ['@tiktok_acoso8912'], telefono: null, pais_estimado: 'MX', tacticas: ['presion', 'aislamiento'], descripcion_libre: null },
        adulto_al_tanto: null, estado: 'nuevo',
      },
    ],
  },

  // ── [H] @acoso.ig8912 / Instagram ────────────────────────────────────────────
  {
    label: '@acoso.ig8912 / Instagram',
    perfil: {
      plataformas:     ['Instagram'],
      tacticas:        ['presion', 'aislamiento'],
      zonas_activas:   ['Compostela, Nayarit'],
      identificadores: ['@acoso.ig8912'],
    },
    alerta: { plataformas: ['Instagram'], zona_geografica: 'Compostela, Nayarit', num_victimas: 1, estado: 'nueva' },
    reportes: [
      {
        folio: 'A-6D3A0F', hash_sha256: 'sha256:6d3a0fb1c2d3e4f5a6b7c8d9e0f1a2b3',
        plataforma: 'Instagram', tipo: 'acoso', tipo_reporte: 'legal',
        patrones: ['presion', 'aislamiento'],
        perfil_agresor: { plataformas: ['Instagram'], identificadores: ['@acoso.ig8912'], telefono: null, pais_estimado: 'MX', tacticas: ['presion'], descripcion_libre: 'Cuenta secundaria sospechosa' },
        adulto_al_tanto: true, estado: 'nuevo',
      },
    ],
  },

  // ── [I] 3111987654 / WhatsApp ────────────────────────────────────────────────
  {
    label: '3111987654 / WhatsApp',
    perfil: {
      plataformas:     ['WhatsApp'],
      tacticas:        ['amenaza_difusion', 'presion', 'solicitud_imagen'],
      zonas_activas:   ['Tepic, Nayarit'],
      identificadores: ['3111987654'],
    },
    alerta: { plataformas: ['WhatsApp'], zona_geografica: 'Tepic, Nayarit', num_victimas: 1, estado: 'nueva' },
    reportes: [
      {
        folio: 'A-C2E4F7', hash_sha256: 'sha256:c2e4f7a1b2c3d4e5f6a7b8c9d0e1f2a3',
        plataforma: 'WhatsApp', tipo: 'sextorsion', tipo_reporte: 'legal',
        patrones: ['amenaza_difusion', 'presion', 'solicitud_imagen'],
        perfil_agresor: { plataformas: ['WhatsApp'], identificadores: ['3111987654'], telefono: '+52 311 198 7654', pais_estimado: 'MX', tacticas: ['amenaza_difusion', 'presion', 'solicitud_imagen'], descripcion_libre: 'Número con lada Tepic (311)' },
        adulto_al_tanto: true, estado: 'nuevo',
      },
    ],
  },
]

// ── Step 2: Perfiles, alertas y reportes ──────────────────────────────────────

console.log('\n🎯 Creando perfiles, alertas y reportes...')

const createdPerfiles = []

for (const scenario of SCENARIOS) {
  const { label, perfil, alerta, reportes } = scenario

  process.stdout.write(`  Embedding ${label}… `)
  const embText = `plataforma: ${perfil.plataformas[0]}. tacticas: ${perfil.tacticas.join(', ')}. identificador: ${perfil.identificadores[0]}`
  const vector = await embed(embText)
  process.stdout.write('✓\n')

  const { data: perfilData, error: perfilErr } = await supabase
    .from('perfiles_agresores')
    .insert({
      patron_vector:   vector,
      plataformas:     perfil.plataformas,
      tacticas:        perfil.tacticas,
      nivel_riesgo:    deriveRiesgo(perfil.tacticas),
      zonas_activas:   perfil.zonas_activas,
      identificadores: perfil.identificadores,
      num_reportes:    reportes.length,
    })
    .select('id')
    .single()

  if (perfilErr || !perfilData) { fail(`perfil ${label}`, perfilErr); continue }
  ok(`perfil ${label} → ${perfilData.id.slice(0, 8)}`)

  const { data: alertaData, error: alertaErr } = await supabase
    .from('alertas')
    .insert({
      nivel_urgencia:  deriveUrgency(perfil.tacticas),
      num_victimas:    alerta.num_victimas,
      perfil_id:       perfilData.id,
      plataformas:     alerta.plataformas,
      zona_geografica: alerta.zona_geografica,
      estado:          alerta.estado,
    })
    .select('id')
    .single()

  if (alertaErr || !alertaData) { fail(`alerta ${label}`, alertaErr); continue }
  ok(`alerta → ${alertaData.id.slice(0, 8)}`)

  for (const r of reportes) {
    const { error: rErr } = await supabase.from('reportes_directos').insert({ ...r, alerta_id: alertaData.id })
    if (rErr) fail(`reporte ${r.folio}`, rErr)
    else ok(`reporte ${r.folio}`)
  }

  createdPerfiles.push({ id: perfilData.id, label })
}

// ── Step 3: Vinculaciones entre perfiles ──────────────────────────────────────
//
// Estas vinculaciones representan lo que el vector de similitud detectaría
// automáticamente al crearse cada perfil en el flujo real.
// El policía las ve en "Perfiles similares" y decide si confirmar o descartar.
//
//   [A] @kevin_mx99/Instagram   ↔ [B] 3311234567/WhatsApp    — posible mismo, distinta plataforma
//   [A] @kevin_mx99/Instagram   ↔ [C] @kevsports/Instagram   — tácticas muy similares, misma plataforma
//   [D] xXDarkXx/Roblox         ↔ [E] darkgamer/Discord      — posible mismo, distinta plataforma
//   [D] xXDarkXx/Roblox         ↔ [F] ProGamer/Roblox        — tácticas idénticas, misma plataforma
//   [G] tiktok_acoso/TikTok     ↔ [H] acoso.ig/Instagram     — posible mismo, distinta plataforma

console.log('\n🔗 Creando vinculaciones entre perfiles...')

const idx = (label) => createdPerfiles.findIndex(p => p.label === label)

const VINCS = [
  { a: '@kevin_mx99 / Instagram',    b: '3311234567 / WhatsApp',        score: 0.84 },
  { a: '@kevin_mx99 / Instagram',    b: '@kevsports_oficial / Instagram', score: 0.88 },
  { a: 'xXDarkXx1234 / Roblox',     b: 'darkgamer#8821 / Discord',      score: 0.83 },
  { a: 'xXDarkXx1234 / Roblox',     b: 'ProGamer_Mx99 / Roblox',        score: 0.79 },
  { a: '@tiktok_acoso8912 / TikTok', b: '@acoso.ig8912 / Instagram',     score: 0.76 },
]

for (const v of VINCS) {
  const idxA = idx(v.a), idxB = idx(v.b)
  if (idxA === -1 || idxB === -1) { console.warn(`  ⚠ No encontrado: ${v.a} o ${v.b}`); continue }
  const [a, b] = [createdPerfiles[idxA].id, createdPerfiles[idxB].id].sort()
  const { error } = await supabase.from('vinculaciones_perfiles').insert({
    perfil_a_id: a, perfil_b_id: b, similitud_score: v.score,
    confirmada: false, descartada: false,
  })
  if (error) fail(`vinculacion ${v.a} ↔ ${v.b}`, error)
  else ok(`${v.a} ↔ ${v.b} (${v.score})`)
}

// ── Summary ───────────────────────────────────────────────────────────────────

console.log('\n✅ Seed completado\n')
console.log('Cuentas de agentes:')
for (const a of AGENTS) console.log(`  ${a.email}  /  ${a.password}`)
console.log(`\n${createdPerfiles.length} perfiles creados (1 plataforma cada uno):`)
for (const p of createdPerfiles) console.log(`  ${p.label}`)
console.log('\nVinculaciones sugeridas (pendientes de revisión policial):')
for (const v of VINCS) console.log(`  ${v.a} ↔ ${v.b}  (${v.score})`)
console.log()
