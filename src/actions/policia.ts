'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { headers } from 'next/headers'
import { mapReporteRow, mapAlertaRow, mapVinculacionRow, mapPerfilRow, mapPerfilSimilarRow, mapVinculacionPerfilRow, type ReporteRow, type DashboardData, type AlertaRow, type EstadisticasData, type VinculacionRow, type ContactoDecifrado, type PerfilAgresorRow, type PerfilSimilarRow, type VinculacionPerfilRow } from '@/lib/policia-types'

const REPORTE_SELECT =
  'id, folio, tipo, tipo_reporte, plataforma, patrones, perfil_agresor, contacto_cifrado, contacto_familiar_cifrado, adulto_al_tanto, estado, created_at'

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

export async function getReportesFiltrados({ plataforma, zona }: { plataforma?: string; zona?: string }): Promise<ReporteRow[]> {
  const supabase = await createClient()

  if (zona) {
    const { data: alertasData } = await supabase
      .from('alertas')
      .select('id')
      .eq('zona_geografica', zona)

    const alertaIds = (alertasData ?? []).map((a) => a.id as string)
    if (alertaIds.length === 0) return []

    // Reports can be linked two ways:
    // 1. alerta_id set directly (new profile path in createNewProfile)
    // 2. Only via vinculaciones row (handleMatch path — alerta_id stays null on the report)
    const [directRes, vinRes] = await Promise.all([
      supabase.from('reportes_directos').select(REPORTE_SELECT).in('alerta_id', alertaIds),
      supabase.from('vinculaciones').select('reporte_id').in('alerta_id', alertaIds),
    ])

    const directSet = new Set((directRes.data ?? []).map((r) => (r as Record<string, unknown>).id as string))
    const extraIds  = (vinRes.data ?? [])
      .map((v) => (v as Record<string, unknown>).reporte_id as string)
      .filter((id) => !directSet.has(id))

    const extraData = extraIds.length > 0
      ? ((await supabase.from('reportes_directos').select(REPORTE_SELECT).in('id', extraIds)).data ?? [])
      : []

    return [...(directRes.data ?? []), ...extraData]
      .sort((a, b) => new Date((b as Record<string, unknown>).created_at as string).getTime()
                    - new Date((a as Record<string, unknown>).created_at as string).getTime())
      .slice(0, 100)
      .map((r) => mapReporteRow(r as Record<string, unknown>))
  }

  const { data } = await supabase
    .from('reportes_directos')
    .select(REPORTE_SELECT)
    .eq('plataforma', plataforma ?? '')
    .order('created_at', { ascending: false })
    .limit(100)

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

// ── Perfiles de agresores ─────────────────────────────────────────────────────

const PERFIL_SELECT = 'id, plataformas, tacticas, zonas_activas, identificadores, nivel_riesgo, num_reportes, created_at'

export async function getPerfiles(): Promise<PerfilAgresorRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('perfiles_agresores')
    .select(PERFIL_SELECT)
    .order('num_reportes', { ascending: false })
    .limit(100)
  return (data ?? []).map((r) => mapPerfilRow(r as Record<string, unknown>))
}

export async function getReportesDePerfl(perfilId: string): Promise<ReporteRow[]> {
  const supabase = await createClient()

  // Alertas linked to this profile
  const { data: alertasData } = await supabase
    .from('alertas')
    .select('id')
    .eq('perfil_id', perfilId)

  const alertaIds = (alertasData ?? []).map((a) => a.id as string)
  if (alertaIds.length === 0) return []

  // Reports via direct alerta_id and via vinculaciones
  const [directRes, vinRes] = await Promise.all([
    supabase.from('reportes_directos').select(REPORTE_SELECT).in('alerta_id', alertaIds),
    supabase.from('vinculaciones').select('reporte_id').in('alerta_id', alertaIds),
  ])

  const directSet = new Set((directRes.data ?? []).map((r) => (r as Record<string, unknown>).id as string))
  const extraIds  = (vinRes.data ?? [])
    .map((v) => (v as Record<string, unknown>).reporte_id as string)
    .filter((id) => !directSet.has(id))

  const extraData = extraIds.length > 0
    ? ((await supabase.from('reportes_directos').select(REPORTE_SELECT).in('id', extraIds)).data ?? [])
    : []

  return [...(directRes.data ?? []), ...extraData]
    .sort((a, b) => new Date((b as Record<string, unknown>).created_at as string).getTime()
                  - new Date((a as Record<string, unknown>).created_at as string).getTime())
    .map((r) => mapReporteRow(r as Record<string, unknown>))
}

export async function getPerfilDetalle(id: string): Promise<{
  perfil: PerfilAgresorRow | null
  similares: PerfilSimilarRow[]
  vinculaciones: VinculacionPerfilRow[]
}> {
  const supabase = await createClient()

  const [perfilRes, similaresRes, vinculacionesRes] = await Promise.all([
    supabase.from('perfiles_agresores').select(PERFIL_SELECT).eq('id', id).single(),
    supabase.rpc('buscar_perfiles_similares', { p_perfil_id: id, p_limit: 5 }),
    supabase.from('vinculaciones_perfiles').select('*').or(`perfil_a_id.eq.${id},perfil_b_id.eq.${id}`),
  ])

  return {
    perfil:        perfilRes.data ? mapPerfilRow(perfilRes.data as Record<string, unknown>) : null,
    similares:     (similaresRes.data ?? []).map((r: unknown) => mapPerfilSimilarRow(r as Record<string, unknown>)),
    vinculaciones: (vinculacionesRes.data ?? []).map((r: unknown) => mapVinculacionPerfilRow(r as Record<string, unknown>)),
  }
}

export async function confirmarVinculacionPerfil(
  perfilAId: string,
  perfilBId: string,
  similitudScore: number,
): Promise<void> {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const [a, b] = [perfilAId, perfilBId].sort()
  const service = createServiceClient()

  await service.from('vinculaciones_perfiles').upsert(
    { perfil_a_id: a, perfil_b_id: b, similitud_score: similitudScore, confirmada: true, descartada: false, agente_id: user.id },
    { onConflict: 'perfil_a_id,perfil_b_id' },
  )

  const h  = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0].trim() ?? null
  await service.from('audit_log').insert({
    agente_id:    user.id,
    agente_email: user.email ?? '',
    accion:       'actualizar_estado',
    recurso_tipo: 'vinculacion_perfil',
    recurso_id:   a,
    ip_address:   ip,
  })
}

export async function descartarVinculacionPerfil(
  perfilAId: string,
  perfilBId: string,
  similitudScore: number,
): Promise<void> {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const [a, b] = [perfilAId, perfilBId].sort()
  const service = createServiceClient()

  await service.from('vinculaciones_perfiles').upsert(
    { perfil_a_id: a, perfil_b_id: b, similitud_score: similitudScore, confirmada: false, descartada: true, agente_id: user.id },
    { onConflict: 'perfil_a_id,perfil_b_id' },
  )
}

// ── Alertas de inteligencia ───────────────────────────────────────────────────

export interface SurgeData {
  plataforma: string
  estasSemana: number
  semanaAnterior: number
  pctCambio: number
}

export interface ZonaConcentracion {
  zona: string
  count: number
  plataformas: string[]
}

export interface PerfilSignalData {
  id: string
  nivelRiesgo: string
  plataformas: string[]
  zonasActivas: string[]
  identificadores: string[]
  numReportes: number
  createdAt: string
}

export interface AlertasInteligenciaData {
  surges: SurgeData[]
  zonas: ZonaConcentracion[]
  nuevosAltoRiesgo: PerfilSignalData[]
  reincidentes: PerfilSignalData[]
}

export async function getAlertasInteligencia(): Promise<AlertasInteligenciaData> {
  const supabase = await createClient()

  const ahora     = new Date()
  const hace7d    = new Date(ahora.getTime() - 7  * 864e5).toISOString()
  const hace14d   = new Date(ahora.getTime() - 14 * 864e5).toISOString()

  const [reportesRes, alertasRes, perfilesRes] = await Promise.all([
    supabase.from('reportes_directos').select('plataforma, created_at').gte('created_at', hace14d),
    supabase.from('alertas').select('zona_geografica, plataformas, created_at').gte('created_at', hace7d).not('zona_geografica', 'is', null),
    supabase.from('perfiles_agresores').select('id, nivel_riesgo, plataformas, zonas_activas, identificadores, num_reportes, created_at'),
  ])

  // Platform surges: this week vs previous week
  const platEsta: Record<string, number>     = {}
  const platAnterior: Record<string, number> = {}
  const hace7dDate = new Date(hace7d)
  for (const r of reportesRes.data ?? []) {
    const plat = (r.plataforma as string) ?? 'Otra'
    if (new Date(r.created_at as string) >= hace7dDate) platEsta[plat] = (platEsta[plat] ?? 0) + 1
    else platAnterior[plat] = (platAnterior[plat] ?? 0) + 1
  }
  const surges: SurgeData[] = Object.entries(platEsta)
    .map(([plataforma, estasSemana]) => {
      const semanaAnterior = platAnterior[plataforma] ?? 0
      const pctCambio = semanaAnterior === 0 ? 100 : Math.round(((estasSemana - semanaAnterior) / semanaAnterior) * 100)
      return { plataforma, estasSemana, semanaAnterior, pctCambio }
    })
    .filter((s) => s.estasSemana >= 2)
    .sort((a, b) => b.estasSemana - a.estasSemana)
    .slice(0, 5)

  // Zone concentrations: alertas in last 7 days grouped by zone
  const zonaCounts: Record<string, { count: number; plats: Set<string> }> = {}
  for (const a of alertasRes.data ?? []) {
    const zona = a.zona_geografica as string
    if (!zonaCounts[zona]) zonaCounts[zona] = { count: 0, plats: new Set() }
    zonaCounts[zona].count++
    for (const p of (a.plataformas as string[])) zonaCounts[zona].plats.add(p)
  }
  const zonas: ZonaConcentracion[] = Object.entries(zonaCounts)
    .map(([zona, { count, plats }]) => ({ zona, count, plataformas: Array.from(plats) }))
    .filter((z) => z.count >= 1)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  // Profile signals
  const perfiles: PerfilSignalData[] = (perfilesRes.data ?? []).map((r) => ({
    id:              r.id as string,
    nivelRiesgo:     (r.nivel_riesgo as string)      ?? 'medio',
    plataformas:     (r.plataformas as string[])     ?? [],
    zonasActivas:    (r.zonas_activas as string[])   ?? [],
    identificadores: (r.identificadores as string[]) ?? [],
    numReportes:     (r.num_reportes as number)      ?? 0,
    createdAt:       r.created_at as string,
  }))

  const nuevosAltoRiesgo = perfiles
    .filter((p) => ['alto', 'critico'].includes(p.nivelRiesgo) && new Date(p.createdAt) >= hace7dDate)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const reincidentes = perfiles
    .filter((p) => p.numReportes >= 2)
    .sort((a, b) => b.numReportes - a.numReportes)
    .slice(0, 5)

  return { surges, zonas, nuevosAltoRiesgo, reincidentes }
}

export async function getEstadisticas(): Promise<EstadisticasData> {
  const supabase = await createClient()

  const [alertasRes, reportesRes, perfilesRes] = await Promise.all([
    supabase.from('alertas').select('zona_geografica').not('estado', 'eq', 'archivada'),
    supabase.from('reportes_directos').select('tipo_reporte, created_at, plataforma, patrones'),
    supabase.from('perfiles_agresores').select('nivel_riesgo'),
  ])

  // Count alertas per zone (skip nulls)
  const zoneCounts: Record<string, number> = {}
  for (const a of alertasRes.data ?? []) {
    if (!a.zona_geografica) continue
    const zona = a.zona_geografica as string
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

  // Count reportes by plataforma
  const platCounts: Record<string, number> = {}
  for (const r of reportesRes.data ?? []) {
    const day = new Date(r.created_at as string).getDay()
    if ((r.tipo_reporte as string) === 'legal') dayCounts[day].legal++
    else dayCounts[day].privado++

    const plat = (r.plataforma as string) ?? 'Otra'
    platCounts[plat] = (platCounts[plat] ?? 0) + 1
  }
  const weeklyReportes = DAYS.map((day, i) => ({ day, ...dayCounts[i] }))

  const total = reportesRes.data?.length ?? 0
  const plataformaStats = Object.entries(platCounts)
    .map(([name, count]) => ({ name, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  // Risk level distribution across profiles
  const riesgoOrder = ['critico', 'alto', 'medio', 'bajo']
  const riesgoCounts: Record<string, number> = {}
  for (const p of perfilesRes.data ?? []) {
    const nivel = (p.nivel_riesgo as string) ?? 'medio'
    riesgoCounts[nivel] = (riesgoCounts[nivel] ?? 0) + 1
  }
  const riesgoStats = riesgoOrder
    .filter((n) => riesgoCounts[n])
    .map((nivel) => ({ nivel, count: riesgoCounts[nivel] ?? 0 }))

  // Tactic frequency across all reports
  const tacticaCounts: Record<string, number> = {}
  for (const r of reportesRes.data ?? []) {
    for (const t of (r.patrones as string[]) ?? []) {
      tacticaCounts[t] = (tacticaCounts[t] ?? 0) + 1
    }
  }
  const tacticaStats = Object.entries(tacticaCounts)
    .map(([tactica, count]) => ({ tactica, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7)

  return { zonaStats, weeklyReportes, plataformaStats, riesgoStats, tacticaStats }
}
