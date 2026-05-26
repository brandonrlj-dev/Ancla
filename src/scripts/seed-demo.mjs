#!/usr/bin/env node
// Seed script for ANCLA demo — Nayarit data
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
    console.error('Could not read .env.local — make sure you run this from the project root.')
    process.exit(1)
  }
}

loadEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY
const GEMINI_KEY   = process.env.GOOGLE_GENERATIVE_AI_API_KEY

if (!SUPABASE_URL || !SERVICE_KEY || !GEMINI_KEY) {
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_GENERATIVE_AI_API_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Helpers ───────────────────────────────────────────────────────────────────

async function embed(text) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: { parts: [{ text }] },
      }),
    },
  )
  if (!res.ok) throw new Error(`Embedding API ${res.status}: ${await res.text()}`)
  const json = await res.json()
  return `[${json.embedding.values.join(',')}]`
}

function ok(label)    { console.log(`  ✓ ${label}`) }
function fail(label, err) { console.error(`  ✗ ${label}: ${err.message}`); throw err }

// ── Step 1: Agent accounts ────────────────────────────────────────────────────

console.log('\n📋 Creando cuentas de agentes...')

const AGENTS = [
  { email: 'agente1@policia-nayarit.gob.mx', password: 'AnclaDemo2025!', nombre: 'Lic. Ramírez' },
  { email: 'agente2@policia-nayarit.gob.mx', password: 'AnclaDemo2025!', nombre: 'Lic. Torres'  },
]

for (const agent of AGENTS) {
  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 200 })
  const existing = list?.users?.find(u => u.email === agent.email)
  if (existing) {
    ok(`${agent.email} (ya existe)`)
    continue
  }
  const { error } = await supabase.auth.admin.createUser({
    email: agent.email,
    password: agent.password,
    user_metadata: { rol: 'policia', nombre: agent.nombre },
    email_confirm: true,
  })
  if (error) fail(agent.email, error)
  else ok(agent.email)
}

// ── Step 2: Aggressor profiles with embeddings ────────────────────────────────

console.log('\n🎯 Creando perfiles de agresores...')

const PROFILE_DEFS = [
  {
    text: 'Agresor activo en Instagram y WhatsApp. Usa love bombing, solicita fotos íntimas y amenaza con difundirlas. Contacta a jóvenes de 13 a 17 años en zona Tepic, Nayarit.',
    plataformas:   ['Instagram', 'WhatsApp'],
    tacticas:      ['love_bombing', 'secretismo', 'solicitud_imagen', 'amenaza_difusion'],
    horarios:      { franjas: [{ dias_semana: [1,2,3,4,5], hora_inicio: '15:00', hora_fin: '22:00' }], zona_horaria_estimada: 'America/Mexico_City', hora_pico: '20:00' },
    nivel_riesgo:  'alto',
    num_reportes:  4,
  },
  {
    text: 'Depredador en Roblox y Discord. Se hace pasar por jugador de la misma edad. Ofrece regalos virtuales y pide secretismo para aislar a sus víctimas. Patrón de grooming prolongado en Bahía de Banderas.',
    plataformas:   ['Roblox', 'Discord'],
    tacticas:      ['love_bombing', 'aislamiento', 'secretismo', 'regalos_virtuales'],
    horarios:      { franjas: [{ dias_semana: [6,0], hora_inicio: '10:00', hora_fin: '23:00' }], zona_horaria_estimada: 'America/Mexico_City', hora_pico: '16:00' },
    nivel_riesgo:  'alto',
    num_reportes:  2,
  },
  {
    text: 'Acosador en TikTok e Instagram. Envía mensajes hostiles, insultos y presiona emocionalmente desde múltiples cuentas falsas. Reportado en Bahía de Banderas y Compostela, Nayarit.',
    plataformas:   ['TikTok', 'Instagram'],
    tacticas:      ['presion', 'manipulacion_emocional', 'multiple_cuentas'],
    horarios:      { franjas: [{ dias_semana: [0,1,2,3,4,5,6], hora_inicio: '18:00', hora_fin: '01:00' }], zona_horaria_estimada: 'America/Mexico_City', hora_pico: '22:00' },
    nivel_riesgo:  'medio',
    num_reportes:  3,
  },
]

const perfilIds = []
for (const p of PROFILE_DEFS) {
  process.stdout.write(`  Generando embedding: "${p.text.slice(0, 55)}…" `)
  const vector = await embed(p.text)
  process.stdout.write('✓\n')

  const { data, error } = await supabase
    .from('perfiles_agresores')
    .insert({ patron_vector: vector, plataformas: p.plataformas, tacticas: p.tacticas, horarios: p.horarios, nivel_riesgo: p.nivel_riesgo, num_reportes: p.num_reportes })
    .select('id')
    .single()

  if (error) fail(`perfil ${p.plataformas.join('+')}`, error)
  else { ok(`perfil ${p.plataformas.join('+')} → ${data.id.slice(0, 8)}`); perfilIds.push(data.id) }
}

// ── Step 3: Alertas ───────────────────────────────────────────────────────────

console.log('\n🚨 Creando alertas...')

const ALERTAS_DEF = [
  { nivel_urgencia: 'critica',  num_victimas: 4, perfil_id: perfilIds[0], plataformas: ['Instagram','WhatsApp'], zona_geografica: 'Tepic, Nayarit',              horarios: PROFILE_DEFS[0].horarios, estado: 'en_investigacion' },
  { nivel_urgencia: 'alta',     num_victimas: 2, perfil_id: perfilIds[0], plataformas: ['Instagram'],           zona_geografica: 'Tepic, Nayarit',              horarios: PROFILE_DEFS[0].horarios, estado: 'nueva'           },
  { nivel_urgencia: 'alta',     num_victimas: 2, perfil_id: perfilIds[1], plataformas: ['Roblox','Discord'],    zona_geografica: 'Bahía de Banderas, Nayarit',  horarios: PROFILE_DEFS[1].horarios, estado: 'en_investigacion' },
  { nivel_urgencia: 'media',    num_victimas: 1, perfil_id: perfilIds[1], plataformas: ['Discord'],             zona_geografica: 'Xalisco, Nayarit',            horarios: PROFILE_DEFS[1].horarios, estado: 'nueva'           },
  { nivel_urgencia: 'media',    num_victimas: 3, perfil_id: perfilIds[2], plataformas: ['TikTok','Instagram'],  zona_geografica: 'Bahía de Banderas, Nayarit',  horarios: PROFILE_DEFS[2].horarios, estado: 'nueva'           },
  { nivel_urgencia: 'baja',     num_victimas: 1, perfil_id: perfilIds[2], plataformas: ['TikTok'],             zona_geografica: 'Compostela, Nayarit',         horarios: PROFILE_DEFS[2].horarios, estado: 'resuelta'        },
]

const alertaIds = []
for (const a of ALERTAS_DEF) {
  const { data, error } = await supabase.from('alertas').insert(a).select('id').single()
  if (error) fail(`alerta ${a.nivel_urgencia}/${a.zona_geografica}`, error)
  else { ok(`alerta ${a.nivel_urgencia} — ${a.zona_geografica} → ${data.id.slice(0, 8)}`); alertaIds.push(data.id) }
}

// ── Step 4: Reportes directos ─────────────────────────────────────────────────

console.log('\n📄 Creando reportes directos...')

const REPORTES_DEF = [
  {
    folio: 'A-DE7A91', hash_sha256: 'sha256:de7a91b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
    plataforma: 'Instagram', tipo: 'sextorsion', tipo_reporte: 'legal',
    patrones: ['love_bombing','solicitud_imagen','amenaza_difusion'],
    perfil_agresor: { plataformas: ['Instagram','WhatsApp'], identificadores: ['@kevin_mx99','3112345678'], telefono: null, pais_estimado: 'MX', tacticas: ['love_bombing','solicitud_imagen','amenaza_difusion'], descripcion_libre: 'Se presentó como estudiante de preparatoria' },
    adulto_al_tanto: true, alerta_id: alertaIds[0], estado: 'procesado',
  },
  {
    folio: 'A-4F2B3C', hash_sha256: 'sha256:4f2b3ca9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1',
    plataforma: 'Instagram', tipo: 'sextorsion', tipo_reporte: 'privado',
    patrones: ['solicitud_imagen','amenaza_difusion','secretismo'],
    perfil_agresor: { plataformas: ['Instagram'], identificadores: ['@kevsports_oficial'], telefono: null, pais_estimado: 'MX', tacticas: ['solicitud_imagen','amenaza_difusion'], descripcion_libre: null },
    adulto_al_tanto: null, alerta_id: alertaIds[0], estado: 'en_revision',
  },
  {
    folio: 'A-7C8E2D', hash_sha256: 'sha256:7c8e2d1a0b9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3',
    plataforma: 'Roblox', tipo: 'grooming', tipo_reporte: 'legal',
    patrones: ['love_bombing','aislamiento','secretismo'],
    perfil_agresor: { plataformas: ['Roblox','Discord'], identificadores: ['xXDarkXx1234','darkgamer#8821'], telefono: null, pais_estimado: 'MX', tacticas: ['love_bombing','aislamiento','secretismo'], descripcion_libre: 'Afirmaba tener 14 años, voz de adulto en Discord' },
    adulto_al_tanto: true, alerta_id: alertaIds[2], estado: 'nuevo',
  },
  {
    folio: 'A-1A9F5B', hash_sha256: 'sha256:1a9f5bc2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0',
    plataforma: 'TikTok', tipo: 'acoso', tipo_reporte: 'privado',
    patrones: ['presion','manipulacion_emocional'],
    perfil_agresor: { plataformas: ['TikTok'], identificadores: ['@tiktok_acoso891234'], telefono: null, pais_estimado: 'MX', tacticas: ['presion','manipulacion_emocional'], descripcion_libre: null },
    adulto_al_tanto: null, alerta_id: alertaIds[4], estado: 'nuevo',
  },
  {
    folio: 'A-3B6D0E', hash_sha256: 'sha256:3b6d0ea1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9',
    plataforma: 'WhatsApp', tipo: 'sextorsion', tipo_reporte: 'legal',
    patrones: ['amenaza_difusion','presion','solicitud_imagen'],
    perfil_agresor: { plataformas: ['WhatsApp','Instagram'], identificadores: ['5531234567'], telefono: '+52 55 3123 4567', pais_estimado: 'MX', tacticas: ['amenaza_difusion','presion'], descripcion_libre: 'Número con lada CDMX, posible VoIP' },
    adulto_al_tanto: true, alerta_id: null, estado: 'nuevo',
  },
]

const reporteIds = []
for (const r of REPORTES_DEF) {
  const { data, error } = await supabase.from('reportes_directos').insert(r).select('id').single()
  if (error) fail(`reporte ${r.folio}`, error)
  else { ok(`reporte ${r.folio} (${r.tipo}/${r.tipo_reporte}) → ${data.id.slice(0, 8)}`); reporteIds.push(data.id) }
}

// ── Step 5: Vinculaciones ─────────────────────────────────────────────────────

console.log('\n🔗 Creando vinculaciones...')

const VINCS = [
  { alerta_id: alertaIds[0], reporte_id: reporteIds[0], similitud_score: 0.94 },
  { alerta_id: alertaIds[0], reporte_id: reporteIds[1], similitud_score: 0.87 },
  { alerta_id: alertaIds[2], reporte_id: reporteIds[2], similitud_score: 0.91 },
  { alerta_id: alertaIds[4], reporte_id: reporteIds[3], similitud_score: 0.83 },
]

for (const v of VINCS) {
  const { error } = await supabase.from('vinculaciones').insert(v)
  if (error && !error.message.includes('unique')) fail(`vinculacion`, error)
  else ok(`similitud=${v.similitud_score} — ${v.alerta_id.slice(0, 8)} ↔ ${v.reporte_id.slice(0, 8)}`)
}

// ── Summary ───────────────────────────────────────────────────────────────────

console.log('\n✅ Seed completado\n')
console.log('Cuentas de agentes:')
for (const a of AGENTS) console.log(`  ${a.email}  /  ${a.password}`)
console.log('\nFolios de demo (portal policía):')
for (const r of REPORTES_DEF) console.log(`  ${r.folio}  —  ${r.tipo} / ${r.tipo_reporte} / ${r.estado}`)
console.log()
