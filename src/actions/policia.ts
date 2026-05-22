'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { headers } from 'next/headers'
import { mapReporteRow, type ReporteRow, type DashboardData } from '@/lib/policia-types'

export type { ReporteRow, DashboardData }

const REPORTE_SELECT =
  'id, folio, tipo, tipo_reporte, plataforma, patrones, contacto_cifrado, contacto_familiar_cifrado, adulto_al_tanto, estado, created_at'

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient()

  const [totalRes, nuevosRes, revisionRes, recentRes] = await Promise.all([
    supabase.from('reportes_directos').select('id', { count: 'exact', head: true }),
    supabase.from('reportes_directos').select('id', { count: 'exact', head: true }).eq('estado', 'nuevo'),
    supabase.from('reportes_directos').select('id', { count: 'exact', head: true }).eq('estado', 'en_revision'),
    supabase.from('reportes_directos').select(REPORTE_SELECT).order('created_at', { ascending: false }).limit(5),
  ])

  return {
    totalReportes:      totalRes.count    ?? 0,
    reportesNuevos:     nuevosRes.count   ?? 0,
    reportesEnRevision: revisionRes.count ?? 0,
    recentReportes:     (recentRes.data ?? []).map(mapReporteRow),
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
