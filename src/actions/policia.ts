'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { headers } from 'next/headers'
import { mapReporteRow, mapAlertaRow, mapVinculacionRow, type ReporteRow, type DashboardData, type AlertaRow, type EstadisticasData, type VinculacionRow, type ContactoDecifrado } from '@/lib/policia-types'

const REPORTE_SELECT =
  'id, folio, tipo, tipo_reporte, plataforma, patrones, contacto_cifrado, contacto_familiar_cifrado, adulto_al_tanto, estado, created_at'

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient()

  const [totalRes, nuevosRes, revisionRes, recentRes, alertasActivasRes, agresoresRes, recentAlertasRes] = await Promise.all([
    supabase.from('reportes_directos').select('id', { count: 'exact', head: true }),
    supabase.from('reportes_directos').select('id', { count: 'exact', head: true }).eq('estado', 'nuevo'),
    supabase.from('reportes_directos').select('id', { count: 'exact', head: true }).eq('estado', 'en_revision'),
    supabase.from('reportes_directos').select(REPORTE_SELECT).order('created_at', { ascending: false }).limit(5),
    supabase.from('alertas').select('id', { count: 'exact', head: true }).not('estado', 'in', '("resuelta","archivada")'),
    supabase.from('perfiles_agresores').select('id', { count: 'exact', head: true }),
    supabase.from('alertas').select('id, nivel_urgencia, plataformas, zona_geografica, estado, created_at').order('created_at', { ascending: false }).limit(3),
  ])

  return {
    totalReportes:         totalRes.count         ?? 0,
    reportesNuevos:        nuevosRes.count        ?? 0,
    reportesEnRevision:    revisionRes.count      ?? 0,
    recentReportes:        (recentRes.data        ?? []).map(mapReporteRow),
    alertasActivas:        alertasActivasRes.count ?? 0,
    agresoresIdentificados: agresoresRes.count    ?? 0,
    recentAlertas:         (recentAlertasRes.data ?? []).map(mapAlertaRow),
  }
}

export async function getReportes(): Promise<ReporteRow[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('reportes_directos')
    .select(REPORTE_SELECT)
    .order('created_at', { ascending: false })
    .limit(50)

  return (data ?? []).map(mapReporteRow)
}

export async function updateReporteEstado(
  id: string,
  estado: 'nuevo' | 'en_revision' | 'procesado' | 'archivado',
): Promise<void> {
  const service    = createServiceClient()
  const authClient = await createClient()

  await service
    .from('reportes_directos')
    .update({ estado, updated_at: new Date().toISOString() })
    .eq('id', id)

  const { data: { user } } = await authClient.auth.getUser()
  if (user) {
    const h  = await headers()
    const ip = h.get('x-forwarded-for')?.split(',')[0].trim() ?? null

    await service.from('audit_log').insert({
      agente_id:    user.id,
      agente_email: user.email ?? '',
      accion:       'actualizar_estado',
      recurso_tipo: 'reporte',
      recurso_id:   id,
      ip_address:   ip,
    })
  }
}

const ALERTA_SELECT = 'id, nivel_urgencia, plataformas, zona_geografica, estado, created_at, num_victimas'

export async function getAlertas(): Promise<AlertaRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('alertas')
    .select(ALERTA_SELECT)
    .not('estado', 'in', '("archivada")')
    .order('created_at', { ascending: false })
    .limit(100)
  return (data ?? []).map(r => mapAlertaRow(r as Record<string, unknown>))
}

export async function getAlerta(id: string): Promise<AlertaRow | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('alertas')
    .select(ALERTA_SELECT)
    .eq('id', id)
    .single()
  if (!data) return null
  return mapAlertaRow(data as Record<string, unknown>)
}

// ── Contact decryption ────────────────────────────────────────────────────────
// Mirror of encryptContact in report.ts — same key, same params, decrypt op.

async function aesDecrypt(encrypted: string): Promise<string> {
  const [ivB64, ctB64] = encrypted.split(':')
  const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'ancla-fallback-key'),
    'PBKDF2', false, ['deriveKey'],
  )
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: new TextEncoder().encode('ancla-contact-v1'), iterations: 10_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 }, false, ['decrypt'],
  )
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(ivB64) }, key, fromB64(ctB64))
  return new TextDecoder().decode(plain)
}

export async function decryptContacto(reporteId: string): Promise<ContactoDecifrado> {
  const service    = createServiceClient()
  const authClient = await createClient()

  const { data: { user } } = await authClient.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { data, error } = await service
    .from('reportes_directos')
    .select('contacto_cifrado, contacto_familiar_cifrado')
    .eq('id', reporteId)
    .single()

  if (error || !data) throw new Error('Reporte no encontrado')

  const victima = data.contacto_cifrado
    ? await aesDecrypt(data.contacto_cifrado as string)
    : null

  let familiar: { nombre: string | null; contacto: string } | null = null
  if (data.contacto_familiar_cifrado) {
    familiar = JSON.parse(await aesDecrypt(data.contacto_familiar_cifrado as string)) as { nombre: string | null; contacto: string }
  }

  const h  = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0].trim() ?? null
  await service.from('audit_log').insert({
    agente_id:    user.id,
    agente_email: user.email ?? '',
    accion:       'ver_reporte',
    recurso_tipo: 'contacto',
    recurso_id:   reporteId,
    ip_address:   ip,
  })

  return { victima, familiar }
}

// ── Alerta state ──────────────────────────────────────────────────────────────

export async function updateAlertaEstado(
  id: string,
  estado: 'nueva' | 'en_investigacion' | 'resuelta',
): Promise<void> {
  const service    = createServiceClient()
  const authClient = await createClient()

  await service
    .from('alertas')
    .update({ estado, updated_at: new Date().toISOString() })
    .eq('id', id)

  const { data: { user } } = await authClient.auth.getUser()
  if (user) {
    const h  = await headers()
    const ip = h.get('x-forwarded-for')?.split(',')[0].trim() ?? null
    await service.from('audit_log').insert({
      agente_id:    user.id,
      agente_email: user.email ?? '',
      accion:       'actualizar_estado',
      recurso_tipo: 'alerta',
      recurso_id:   id,
      ip_address:   ip,
    })
  }
}

const VINCULACION_SELECT =
  'id, alerta_id, reporte_id, similitud_score, confirmada, created_at, reportes_directos!reporte_id(folio)'

export async function getVinculaciones(alertaId: string): Promise<VinculacionRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('vinculaciones')
    .select(VINCULACION_SELECT)
    .eq('alerta_id', alertaId)
    .order('similitud_score', { ascending: false })
  return (data ?? []).map((r) => mapVinculacionRow(r as Record<string, unknown>))
}

export async function confirmarVinculacion(vinculacionId: string, alertaId: string): Promise<void> {
  const supabase = createServiceClient()

  await supabase
    .from('vinculaciones')
    .update({ confirmada: true })
    .eq('id', vinculacionId)

  await supabase.rpc('incrementar_victimas', { p_alerta_id: alertaId })
}

export async function descartarVinculacion(vinculacionId: string): Promise<void> {
  const supabase = createServiceClient()
  await supabase.from('vinculaciones').delete().eq('id', vinculacionId)
}

export async function getEstadisticas(): Promise<EstadisticasData> {
  const supabase = await createClient()

  const [alertasRes, reportesRes] = await Promise.all([
    supabase.from('alertas').select('zona_geografica').not('estado', 'eq', 'archivada'),
    supabase.from('reportes_directos').select('tipo_reporte, created_at'),
  ])

  // Count alertas per zone
  const zoneCounts: Record<string, number> = {}
  for (const a of alertasRes.data ?? []) {
    const zona = (a.zona_geografica as string) ?? 'Sin zona'
    zoneCounts[zona] = (zoneCounts[zona] ?? 0) + 1
  }
  const zonaStats = Object.entries(zoneCounts)
    .map(([name, alerts]) => ({ name, alerts }))
    .sort((a, b) => b.alerts - a.alerts)
    .slice(0, 8)

  // Count reportes by day of week
  const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const dayCounts: Record<number, { privado: number; legal: number }> = {}
  for (let i = 0; i < 7; i++) dayCounts[i] = { privado: 0, legal: 0 }
  for (const r of reportesRes.data ?? []) {
    const day = new Date(r.created_at as string).getDay()
    if ((r.tipo_reporte as string) === 'legal') dayCounts[day].legal++
    else dayCounts[day].privado++
  }
  const weeklyReportes = DAYS.map((day, i) => ({ day, ...dayCounts[i] }))

  return { zonaStats, weeklyReportes }
}
