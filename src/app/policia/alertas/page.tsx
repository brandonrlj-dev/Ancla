'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import { TrendingUp, TrendingDown, MapPin, Smartphone, AlertTriangle, RefreshCw, ArrowRight } from 'lucide-react';
import { getAlertasInteligencia, type AlertasInteligenciaData } from '@/actions/policia';

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

function SectionHeader({ icon: Icon, title, count, color }: { icon: React.ElementType; title: string; count: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <Icon size={17} color={color} />
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
        {title}
      </h2>
      {count > 0 && (
        <span style={{ background: color, color: 'white', borderRadius: 999, padding: '2px 8px', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
          {count}
        </span>
      )}
    </div>
  );
}

function EmptySlot({ text }: { text: string }) {
  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic', background: 'white', borderRadius: 12, border: '1px solid var(--color-border-subtle)' }}>
      {text}
    </div>
  );
}

export default function AlertasInteligenciaPage() {
  const router   = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [data,    setData]    = useState<AlertasInteligenciaData | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    getAlertasInteligencia().then((d) => { setData(d); setLoading(false); });
  }

  useEffect(() => { load(); }, []);

  const totalSeñales = (data?.surges.length ?? 0) + (data?.zonas.length ?? 0) + (data?.nuevosAltoRiesgo.length ?? 0) + (data?.reincidentes.length ?? 0);

  return (
    <div style={{ padding: isMobile ? '24px 16px' : '32px 32px', maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <AlertTriangle size={20} color="var(--color-terra-500)" />
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Señales de riesgo
              </h1>
              {!loading && totalSeñales > 0 && (
                <span style={{ background: 'var(--color-terra-500)', color: 'white', borderRadius: 999, padding: '2px 9px', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {totalSeñales}
                </span>
              )}
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-text-tertiary)' }}>
              Concentraciones de actividad en plataformas y zonas · Nayarit · últimos 7 días
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 999, border: '1px solid var(--color-border)', background: 'white', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-secondary)', boxShadow: 'var(--shadow-sm)', opacity: loading ? 0.6 : 1, transition: 'opacity 150ms' }}
          >
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Actualizar
          </button>
        </div>
      </motion.div>

      {/* Section 1 — Platform surges */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: 32 }}>
        <SectionHeader icon={Smartphone} title="Plataformas activas esta semana" count={data?.surges.length ?? 0} color="#bf6b4a" />
        {loading ? (
          <div style={{ height: 100, borderRadius: 12, background: 'var(--color-gray-100)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        ) : data?.surges.length === 0 ? (
          <EmptySlot text="Sin concentraciones detectadas esta semana" />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {data?.surges.map((s, i) => (
              <motion.div
                key={s.plataforma}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.06 }}
                style={{ background: 'white', borderRadius: 14, padding: '18px 20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)', borderTop: '3px solid #bf6b4a' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{s.plataforma}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, background: s.pctCambio > 0 ? '#fee2e2' : '#dcfce7', border: `1px solid ${s.pctCambio > 0 ? '#fecaca' : '#bbf7d0'}` }}>
                    {s.pctCambio > 0
                      ? <TrendingUp size={11} color="#dc2626" />
                      : <TrendingDown size={11} color="#16a34a" />}
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700, color: s.pctCambio > 0 ? '#dc2626' : '#16a34a' }}>
                      {s.pctCambio > 0 ? '+' : ''}{s.pctCambio}%
                    </span>
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1, marginBottom: 4 }}>
                  {s.estasSemana}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-text-tertiary)', marginBottom: 14 }}>
                  reportes · semana anterior: {s.semanaAnterior}
                </div>
                <button
                  onClick={() => router.push(`/policia/reportes?plataforma=${encodeURIComponent(s.plataforma)}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)', fontSize: '0.76rem', fontWeight: 500, color: '#bf6b4a' }}
                >
                  Ver reportes <ArrowRight size={12} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      {/* Section 2 — Zone concentrations */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} style={{ marginBottom: 32 }}>
        <SectionHeader icon={MapPin} title="Concentración geográfica — últimos 7 días" count={data?.zonas.length ?? 0} color="#5b81a8" />
        {loading ? (
          <div style={{ height: 100, borderRadius: 12, background: 'var(--color-gray-100)' }} />
        ) : data?.zonas.length === 0 ? (
          <EmptySlot text="Sin concentraciones geográficas detectadas" />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {data?.zonas.map((z, i) => (
              <motion.div
                key={z.zona}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.06 }}
                style={{ background: 'white', borderRadius: 14, padding: '18px 20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)', borderTop: '3px solid #5b81a8' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <MapPin size={13} color="#5b81a8" />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{z.zona}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1, marginBottom: 4 }}>
                  {z.count}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-text-tertiary)', marginBottom: 10 }}>
                  {z.count === 1 ? 'caso activo' : 'casos activos'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                  {z.plataformas.map((p) => (
                    <span key={p} style={{ padding: '2px 8px', borderRadius: 999, background: '#eff6ff', border: '1px solid #bfdbfe', fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: '#1d4ed8' }}>
                      {p}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => router.push(`/policia/reportes?zona=${encodeURIComponent(z.zona)}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)', fontSize: '0.76rem', fontWeight: 500, color: '#5b81a8' }}
                >
                  Ver reportes <ArrowRight size={12} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      {/* Sections 3 & 4 — side by side on desktop */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24 }}>

        {/* Section 3 — New high-risk profiles */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}>
          <SectionHeader icon={AlertTriangle} title="Nuevos perfiles de alto riesgo" count={data?.nuevosAltoRiesgo.length ?? 0} color="#ef4444" />
          {loading ? (
            <div style={{ height: 120, borderRadius: 12, background: 'var(--color-gray-100)' }} />
          ) : data?.nuevosAltoRiesgo.length === 0 ? (
            <EmptySlot text="Sin perfiles de alto riesgo esta semana" />
          ) : (
            <div style={{ background: 'white', borderRadius: 14, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)', overflow: 'hidden' }}>
              {data?.nuevosAltoRiesgo.map((p, i) => {
                const color = riskColors[p.nivelRiesgo] ?? '#999';
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.28 + i * 0.05 }}
                    onClick={() => router.push(`/policia/perfil/${p.id}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: i < (data?.nuevosAltoRiesgo.length ?? 0) - 1 ? '1px solid var(--color-border-subtle)' : 'none', cursor: 'pointer', transition: 'background 150ms' }}
                    onMouseEnter={(e) => { (e.currentTarget.style.background = 'var(--color-gray-50)'); }}
                    onMouseLeave={(e) => { (e.currentTarget.style.background = 'white'); }}
                  >
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          PER-{p.id.slice(0, 6).toUpperCase()}
                        </span>
                        <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-body)', fontWeight: 600, color, padding: '1px 6px', borderRadius: 999, background: `${color}15`, border: `1px solid ${color}30` }}>
                          {riskLabels[p.nivelRiesgo]}
                        </span>
                      </div>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-text-tertiary)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'block' }}>
                        {p.plataformas.join(', ')}{p.zonasActivas.length > 0 ? ` · ${p.zonasActivas[0]}` : ''}
                      </span>
                    </div>
                    <ArrowRight size={13} color="var(--color-text-tertiary)" />
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.section>

        {/* Section 4 — Repeat offenders */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <SectionHeader icon={TrendingUp} title="Agresores reincidentes" count={data?.reincidentes.length ?? 0} color="#f97316" />
          {loading ? (
            <div style={{ height: 120, borderRadius: 12, background: 'var(--color-gray-100)' }} />
          ) : data?.reincidentes.length === 0 ? (
            <EmptySlot text="Sin agresores reincidentes detectados" />
          ) : (
            <div style={{ background: 'white', borderRadius: 14, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)', overflow: 'hidden' }}>
              {data?.reincidentes.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.32 + i * 0.05 }}
                  onClick={() => router.push(`/policia/perfil/${p.id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: i < (data?.reincidentes.length ?? 0) - 1 ? '1px solid var(--color-border-subtle)' : 'none', cursor: 'pointer', transition: 'background 150ms' }}
                  onMouseEnter={(e) => { (e.currentTarget.style.background = 'var(--color-gray-50)'); }}
                  onMouseLeave={(e) => { (e.currentTarget.style.background = 'white'); }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff7ed', border: '1.5px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700, color: '#f97316' }}>{p.numReportes}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 2 }}>
                      PER-{p.id.slice(0, 6).toUpperCase()}
                    </div>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-text-tertiary)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'block' }}>
                      {p.plataformas.join(', ')}{p.zonasActivas.length > 0 ? ` · ${p.zonasActivas[0]}` : ''}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {p.numReportes} {p.numReportes === 1 ? 'reporte' : 'reportes'}
                  </span>
                  <ArrowRight size={13} color="var(--color-text-tertiary)" />
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

      </div>
    </div>
  );
}
