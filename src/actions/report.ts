'use server'

import { createServiceClient } from '@/lib/supabase/service'

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
  tipoReporte: 'privado' | 'legal'
  // Ruta privada: victim's own optional contact
  contacto?: string
  // Ruta legal: family contact (required) + optional name
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

  // Victim's own contact — only relevant for ruta privada
  let contactoCifrado: string | null = null
  if (params.tipoReporte === 'privado' && params.contacto?.trim()) {
    contactoCifrado = await encryptContact(params.contacto.trim())
  }

  // Family contact — only for ruta legal; encrypt as JSON {nombre, contacto}
  let contactoFamiliarCifrado: string | null = null
  if (params.tipoReporte === 'legal' && params.contactoFamiliar?.trim()) {
    const payload = JSON.stringify({
      nombre: params.nombreFamiliar?.trim() ?? null,
      contacto: params.contactoFamiliar.trim(),
    })
    contactoFamiliarCifrado = await encryptContact(payload)
  }

  // adulto_al_tanto: implicit TRUE for legal (youth provided family contact), NULL for private
  const adultoAlTanto = params.tipoReporte === 'legal' ? true : null

  const perfilAgresor = {
    plataformas: [params.plataforma],
    identificadores: params.identificador ? [params.identificador] : [],
    telefono: null,
    pais_estimado: 'MX',
    tacticas: params.patterns,
    descripcion_libre: null,
  }

  const { data, error } = await supabase
    .from('reportes_directos')
    .insert({
      folio: params.folio,
      hash_sha256: params.hashSha256,
      plataforma: params.plataforma,
      tipo,
      tipo_reporte: params.tipoReporte,
      patrones: params.patterns,
      perfil_agresor: perfilAgresor,
      contacto_cifrado: contactoCifrado,
      contacto_familiar_cifrado: contactoFamiliarCifrado,
      adulto_al_tanto: adultoAlTanto,
      estado: 'nuevo',
    })
    .select('id, folio')
    .single()

  if (error) throw new Error(`[submitReport] ${error.message}`)
  return { reporteId: data.id, folio: data.folio }
}
