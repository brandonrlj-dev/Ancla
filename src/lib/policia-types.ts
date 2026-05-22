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

export interface DashboardData {
  totalReportes: number
  reportesNuevos: number
  reportesEnRevision: number
  recentReportes: ReporteRow[]
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
