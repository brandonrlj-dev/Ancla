// Shared types and utilities for the police portal — safe to import from client and server

export interface ReporteRow {
  id: string
  folio: string
  tipo: string
  tipoReporte: 'privado' | 'legal'
  plataforma: string
  patrones: string[]
  tieneContacto: boolean
  adultoAlTanto: boolean | null
  estado: string
  createdAt: string
}

export interface AlertaRow {
  id: string
  nivelUrgencia: string
  plataformas: string[]
  zonaGeografica: string | null
  estado: string
  createdAt: string
  numVictimas: number
}

export interface EstadisticasData {
  zonaStats: { name: string; alerts: number }[]
  weeklyReportes: { day: string; privado: number; legal: number }[]
}

export interface DashboardData {
  totalReportes: number
  reportesNuevos: number
  reportesEnRevision: number
  recentReportes: ReporteRow[]
  alertasActivas: number
  agresoresIdentificados: number
  recentAlertas: AlertaRow[]
}

export function mapAlertaRow(r: Record<string, unknown>): AlertaRow {
  return {
    id:             r.id as string,
    nivelUrgencia:  (r.nivel_urgencia as string)         ?? 'media',
    plataformas:    (r.plataformas as string[])          ?? [],
    zonaGeografica: (r.zona_geografica as string | null) ?? null,
    estado:         (r.estado as string)                 ?? 'nueva',
    createdAt:      r.created_at as string,
    numVictimas:    (r.num_victimas as number)           ?? 1,
  }
}

export interface ContactoDecifrado {
  victima:  string | null
  familiar: { nombre: string | null; contacto: string } | null
}

export interface VinculacionRow {
  id: string
  alertaId: string
  reporteId: string
  folio: string
  similitudScore: number
  confirmada: boolean
  createdAt: string
}

export function mapVinculacionRow(r: Record<string, unknown>): VinculacionRow {
  const rd = r.reportes_directos as Record<string, unknown> | null
  return {
    id:            r.id as string,
    alertaId:      r.alerta_id as string,
    reporteId:     r.reporte_id as string,
    folio:         (rd?.folio as string) ?? '—',
    similitudScore: (r.similitud_score as number) ?? 0,
    confirmada:    (r.confirmada as boolean) ?? false,
    createdAt:     r.created_at as string,
  }
}

export function mapReporteRow(r: Record<string, unknown>): ReporteRow {
  return {
    id:           r.id as string,
    folio:        r.folio as string,
    tipo:         (r.tipo as string)                          ?? 'acoso',
    tipoReporte:  (r.tipo_reporte as 'privado' | 'legal')    ?? 'privado',
    plataforma:   (r.plataforma as string)                   ?? '',
    patrones:     (r.patrones as string[])                   ?? [],
    tieneContacto: !!(r.contacto_cifrado || r.contacto_familiar_cifrado),
    adultoAlTanto: (r.adulto_al_tanto as boolean | null)     ?? null,
    estado:       (r.estado as string)                       ?? 'nuevo',
    createdAt:    r.created_at as string,
  }
}
