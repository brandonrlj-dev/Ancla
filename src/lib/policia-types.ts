// Shared types and utilities for the police portal — safe to import from client and server

export interface ReporteRow {
  id: string
  folio: string
  tipo: string
  tipoReporte: 'privado' | 'legal'
  plataforma: string
  patrones: string[]
  identificadoresAgresor: string[]
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
  plataformaStats: { name: string; count: number; pct: number }[]
  riesgoStats: { nivel: string; count: number }[]
  tacticaStats: { tactica: string; count: number }[]
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

export interface PerfilAgresorRow {
  id: string
  plataformas: string[]
  tacticas: string[]
  zonasActivas: string[]
  identificadores: string[]
  nivelRiesgo: string
  numReportes: number
  createdAt: string
}

export interface PerfilSimilarRow {
  perfilId: string
  similitud: number
  numReportes: number
  nivelRiesgo: string
  plataformas: string[]
  tacticas: string[]
  zonasActivas: string[]
  identificadores: string[]
}

export interface VinculacionPerfilRow {
  id: string
  perfilAId: string
  perfilBId: string
  similitudScore: number
  confirmada: boolean
  descartada: boolean
  createdAt: string
}

export function mapPerfilRow(r: Record<string, unknown>): PerfilAgresorRow {
  return {
    id:              r.id as string,
    plataformas:     (r.plataformas as string[])      ?? [],
    tacticas:        (r.tacticas as string[])          ?? [],
    zonasActivas:    (r.zonas_activas as string[])     ?? [],
    identificadores: (r.identificadores as string[])  ?? [],
    nivelRiesgo:     (r.nivel_riesgo as string)        ?? 'medio',
    numReportes:     (r.num_reportes as number)        ?? 0,
    createdAt:       r.created_at as string,
  }
}

export function mapPerfilSimilarRow(r: Record<string, unknown>): PerfilSimilarRow {
  return {
    perfilId:        r.perfil_id as string,
    similitud:       r.similitud as number,
    numReportes:     (r.num_reportes as number)        ?? 0,
    nivelRiesgo:     (r.nivel_riesgo as string)        ?? 'medio',
    plataformas:     (r.plataformas as string[])       ?? [],
    tacticas:        (r.tacticas as string[])          ?? [],
    zonasActivas:    (r.zonas_activas as string[])     ?? [],
    identificadores: (r.identificadores as string[])  ?? [],
  }
}

export function mapVinculacionPerfilRow(r: Record<string, unknown>): VinculacionPerfilRow {
  return {
    id:             r.id as string,
    perfilAId:      r.perfil_a_id as string,
    perfilBId:      r.perfil_b_id as string,
    similitudScore: (r.similitud_score as number) ?? 0,
    confirmada:     (r.confirmada as boolean)     ?? false,
    descartada:     (r.descartada as boolean)     ?? false,
    createdAt:      r.created_at as string,
  }
}

export function mapReporteRow(r: Record<string, unknown>): ReporteRow {
  const perfilAgresor = r.perfil_agresor as Record<string, unknown> | null
  return {
    id:                    r.id as string,
    folio:                 r.folio as string,
    tipo:                  (r.tipo as string)                          ?? 'acoso',
    tipoReporte:           (r.tipo_reporte as 'privado' | 'legal')    ?? 'privado',
    plataforma:            (r.plataforma as string)                   ?? '',
    patrones:              (r.patrones as string[])                   ?? [],
    identificadoresAgresor: (perfilAgresor?.identificadores as string[]) ?? [],
    tieneContacto:         !!(r.contacto_cifrado || r.contacto_familiar_cifrado),
    adultoAlTanto:         (r.adulto_al_tanto as boolean | null)     ?? null,
    estado:                (r.estado as string)                       ?? 'nuevo',
    createdAt:             r.created_at as string,
  }
}
