'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Users, MapPin, Smartphone } from 'lucide-react';
import { getPerfiles } from '@/actions/policia';
import { type PerfilAgresorRow } from '@/lib/policia-types';

const riskColors: Record<string, string> = {
  critico: '#ef4444',
  alto:    '#f97316',
  medio:   '#eab308',
  bajo:    '#22c55e',
};

const riskLabels: Record<string, string> = {
  critico: 'Crítico',
  alto:    'Alto',
  medio:   'Medio',
  bajo:    'Bajo',
};

const tacticaLabels: Record<string, string> = {
  love_bombing:       'Love bombing',
  aislamiento:        'Aislamiento',
  solicitud_imagen:   'Solicitud de imagen',
  amenaza_difusion:   'Amenaza de difusión',
  gradualidad_sexual: 'Gradualidad sexual',
  secretismo:         'Secretismo',
  presion:            'Presión',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function PerfilesPage() {
  const router   = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [perfiles, setPerfiles] = useState<PerfilAgresorRow[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getPerfiles().then((data) => { setPerfiles(data); setLoading(false); });
  }, []);

  return (
    <div style={{ padding: isMobile ? '24px 16px' : '32px 32px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Users size={20} color="var(--color-terra-500)" />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Perfiles de agresores
          </h1>
          {!loading && (
            <span style={{ background: 'var(--color-terra-500)', color: 'white', borderRadius: 999, padding: '2px 9px', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              {perfiles.length}
            </span>
          )}
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-text-tertiary)' }}>
          Construidos por similitud vectorial. Haz clic en un perfil para ver posibles duplicados.
        </p>
      </motion.div>

      {/* Table — desktop */}
      {!isMobile && (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: 'white', borderRadius: 16, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)', overflow: 'hidden' }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)', background: 'var(--color-gray-50)' }}>
                  {['Riesgo', 'Ref', 'Plataformas', 'Tácticas', 'Zonas activas', 'Reportes', 'Registrado', ''].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {perfiles.map((p, i) => {
                    const color = riskColors[p.nivelRiesgo] ?? '#999';
                    return (
                      <motion.tr
                        key={p.id}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => router.push(`/policia/perfil/${p.id}`)}
                        style={{ borderBottom: '1px solid var(--color-border-subtle)', cursor: 'pointer', transition: 'background 150ms' }}
                        onMouseEnter={(e) => { (e.currentTarget.style.background = 'var(--color-gray-50)'); }}
                        onMouseLeave={(e) => { (e.currentTarget.style.background = 'white'); }}
                      >
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-body)', fontWeight: 600, color }}>{riskLabels[p.nivelRiesgo] ?? p.nivelRiesgo}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', maxWidth: 180 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>
                              PER-{p.id.slice(0, 6).toUpperCase()}
                            </span>
                            {p.identificadores.slice(0, 2).map((id) => (
                              <span key={id} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 600, color: '#3d5e81', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {id}
                              </span>
                            ))}
                            {p.identificadores.length > 2 && (
                              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: 'var(--color-text-tertiary)' }}>+{p.identificadores.length - 2} más</span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Smartphone size={11} color="var(--color-text-tertiary)" />
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                              {p.plataformas.slice(0, 2).join(', ')}{p.plataformas.length > 2 ? ` +${p.plataformas.length - 2}` : ''}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', maxWidth: 200 }}>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-secondary)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'block' }}>
                            {p.tacticas.map((t) => tacticaLabels[t] ?? t).join(', ')}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          {p.zonasActivas.length > 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <MapPin size={11} color="var(--color-text-tertiary)" />
                              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                                {p.zonasActivas.slice(0, 2).join(', ')}{p.zonasActivas.length > 2 ? ` +${p.zonasActivas.length - 2}` : ''}
                              </span>
                            </div>
                          ) : (
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{p.numReportes}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>{formatDate(p.createdAt)}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--color-calm-500)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>Ver →</span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
                {!loading && perfiles.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: '40px 16px', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
                      Sin perfiles registrados aún
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Cards — mobile */}
      {isMobile && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AnimatePresence mode="popLayout">
            {perfiles.map((p, i) => {
              const color = riskColors[p.nivelRiesgo] ?? '#999';
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => router.push(`/policia/perfil/${p.id}`)}
                  style={{ background: 'white', borderRadius: 14, padding: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)', borderLeft: `4px solid ${color}`, cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color, fontFamily: 'var(--font-body)' }}>{riskLabels[p.nivelRiesgo] ?? p.nivelRiesgo}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--color-text-tertiary)' }}>PER-{p.id.slice(0, 6).toUpperCase()}</span>
                      {p.identificadores[0] && (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600, color: '#3d5e81' }}>{p.identificadores[0]}</span>
                      )}
                    </div>
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-text-primary)', marginBottom: 8, fontWeight: 500 }}>
                    {p.plataformas.join(' + ')} · {p.numReportes} {p.numReportes === 1 ? 'reporte' : 'reportes'}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {p.zonasActivas.length > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
                        <MapPin size={10} />{p.zonasActivas.join(', ')}
                      </span>
                    )}
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-calm-500)', fontFamily: 'var(--font-body)', fontWeight: 500, marginLeft: 'auto' }}>Ver →</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {!loading && perfiles.length === 0 && (
            <div style={{ padding: '40px 0', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
              Sin perfiles registrados aún
            </div>
          )}
        </div>
      )}
    </div>
  );
}
