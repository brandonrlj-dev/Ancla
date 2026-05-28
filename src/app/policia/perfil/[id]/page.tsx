'use client';

import { useEffect, useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ArrowLeft, Users, MapPin, Smartphone, Clock, Link2, CheckCircle, XCircle, Heart } from 'lucide-react';
import { getPerfilDetalle, confirmarVinculacionPerfil, descartarVinculacionPerfil, getReportesDePerfl } from '@/actions/policia';
import { type PerfilAgresorRow, type PerfilSimilarRow, type VinculacionPerfilRow, type ReporteRow } from '@/lib/policia-types';

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

function scoreColor(s: number) {
  if (s >= 0.92) return '#ef4444';
  if (s >= 0.82) return '#f97316';
  return '#eab308';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
}

function Tag({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 999,
      fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 500,
      background: color ? `${color}15` : 'var(--color-gray-100)',
      color: color ?? 'var(--color-text-secondary)',
      border: `1px solid ${color ? `${color}30` : 'var(--color-border-subtle)'}`,
    }}>
      {label}
    </span>
  );
}

export default function PerfilDetallePage() {
  const router   = useRouter();
  const params   = useParams();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const id       = params.id as string;

  const [perfil,        setPerfil]        = useState<PerfilAgresorRow | null>(null);
  const [similares,     setSimilares]     = useState<PerfilSimilarRow[]>([]);
  const [vinculaciones, setVinculaciones] = useState<VinculacionPerfilRow[]>([]);
  const [reportes,      setReportes]      = useState<ReporteRow[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [isPending,     startTransition]  = useTransition();

  useEffect(() => {
    Promise.all([
      getPerfilDetalle(id),
      getReportesDePerfl(id),
    ]).then(([{ perfil: p, similares: s, vinculaciones: v }, reps]) => {
      setPerfil(p);
      setSimilares(s);
      setVinculaciones(v);
      setReportes(reps);
      setLoading(false);
    });
  }, [id]);

  function getDecision(otroId: string): VinculacionPerfilRow | undefined {
    const [a, b] = [id, otroId].sort();
    return vinculaciones.find((v) => v.perfilAId === a && v.perfilBId === b);
  }

  function handleConfirmar(otro: PerfilSimilarRow) {
    const decision = getDecision(otro.perfilId);
    if (decision?.confirmada) return;
    const [a, b] = [id, otro.perfilId].sort();
    setVinculaciones((prev) => {
      const updated = prev.filter((v) => !(v.perfilAId === a && v.perfilBId === b));
      return [...updated, { id: 'optimistic', perfilAId: a, perfilBId: b, similitudScore: otro.similitud, confirmada: true, descartada: false, createdAt: new Date().toISOString() }];
    });
    startTransition(async () => { await confirmarVinculacionPerfil(id, otro.perfilId, otro.similitud); });
  }

  function handleDescartar(otro: PerfilSimilarRow) {
    const decision = getDecision(otro.perfilId);
    if (decision?.descartada) return;
    const [a, b] = [id, otro.perfilId].sort();
    setVinculaciones((prev) => {
      const updated = prev.filter((v) => !(v.perfilAId === a && v.perfilBId === b));
      return [...updated, { id: 'optimistic', perfilAId: a, perfilBId: b, similitudScore: otro.similitud, confirmada: false, descartada: true, createdAt: new Date().toISOString() }];
    });
    startTransition(async () => { await descartarVinculacionPerfil(id, otro.perfilId, otro.similitud); });
  }

  if (loading) {
    return <div style={{ padding: '40px 32px', fontFamily: 'var(--font-body)', color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>Cargando…</div>;
  }

  if (!perfil) {
    return (
      <div style={{ padding: '40px 32px' }}>
        <button onClick={() => router.push('/policia/perfiles')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-body)', fontSize: '0.82rem', padding: 0, marginBottom: 16 }}>
          <ArrowLeft size={14} /> Todos los perfiles
        </button>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>Perfil no encontrado.</p>
      </div>
    );
  }

  const riskColor = riskColors[perfil.nivelRiesgo] ?? '#999';

  return (
    <div style={{ padding: isMobile ? '24px 16px' : '32px 32px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Back + title */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <button
          onClick={() => router.push('/policia/perfiles')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-body)', fontSize: '0.82rem', padding: 0, marginBottom: 14 }}
        >
          <ArrowLeft size={14} /> Todos los perfiles
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: riskColor }} />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              PER-{perfil.id.slice(0, 6).toUpperCase()}
            </h1>
          </div>
          <span style={{ padding: '4px 12px', borderRadius: 999, background: `${riskColor}18`, border: `1px solid ${riskColor}40`, fontSize: '0.76rem', fontWeight: 600, color: riskColor, fontFamily: 'var(--font-body)' }}>
            Riesgo {riskLabels[perfil.nivelRiesgo] ?? perfil.nivelRiesgo}
          </span>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: 6 }}>
          {perfil.plataformas.join(' + ')} · {perfil.numReportes} {perfil.numReportes === 1 ? 'reporte vinculado' : 'reportes vinculados'}
        </p>
      </motion.div>

      {/* Meta chips */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}
      >
        {[
          { icon: Smartphone, label: perfil.plataformas.join(', ') },
          { icon: MapPin,     label: perfil.zonasActivas.length > 0 ? perfil.zonasActivas.join(', ') : 'Sin zona registrada' },
          { icon: Users,      label: `${perfil.numReportes} ${perfil.numReportes === 1 ? 'reporte' : 'reportes'}` },
          { icon: Clock,      label: `Registrado el ${formatDate(perfil.createdAt)}` },
        ].map(({ icon: Icon, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: 'white', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)' }}>
            <Icon size={12} color="var(--color-text-tertiary)" />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>{label}</span>
          </div>
        ))}
      </motion.div>

      {/* Tactics card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)', marginBottom: 20 }}
      >
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)', marginBottom: 14 }}>
          Tácticas detectadas
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {perfil.tacticas.length > 0
            ? perfil.tacticas.map((t) => <Tag key={t} label={tacticaLabels[t] ?? t} color={riskColor} />)
            : <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>Sin tácticas registradas</span>
          }
        </div>
      </motion.div>

      {/* Linked reports */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)', marginBottom: 20 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Heart size={16} color="var(--color-text-secondary)" />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
            Reportes vinculados
          </div>
          <span style={{ background: 'var(--color-gray-100)', borderRadius: 999, padding: '2px 8px', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            {reportes.length}
          </span>
        </div>

        {reportes.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
            Sin reportes vinculados aún
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {reportes.map((rep) => (
              <div
                key={rep.id}
                onClick={() => router.push(`/policia/reportes?folio=${rep.folio}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', transition: 'background 150ms' }}
                onMouseEnter={(e) => { (e.currentTarget.style.background = 'var(--color-gray-50)'); }}
                onMouseLeave={(e) => { (e.currentTarget.style.background = 'transparent'); }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)', flexShrink: 0 }}>
                  {rep.folio}
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.76rem', color: 'var(--color-text-secondary)', flex: 1 }}>
                  {rep.plataforma} · {rep.tipo}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-text-tertiary)', flexShrink: 0 }}>
                  {formatDate(rep.createdAt)}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', flexShrink: 0 }}>→</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Similar profiles panel */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
        style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Link2 size={16} color="var(--color-text-secondary)" />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
            Perfiles similares
          </div>
          <span style={{ background: 'var(--color-gray-100)', borderRadius: 999, padding: '2px 8px', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            {similares.length}
          </span>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-tertiary)', marginBottom: 20, lineHeight: 1.5 }}>
          Perfiles con comportamiento similar detectado automáticamente por plataforma. El policía decide si corresponden al mismo agresor.
        </p>

        {similares.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
            Sin perfiles similares detectados
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {similares.map((otro) => {
              const decision  = getDecision(otro.perfilId);
              const confirmed = decision?.confirmada ?? false;
              const discarded = decision?.descartada ?? false;
              const otroColor = riskColors[otro.nivelRiesgo] ?? '#999';
              const sc        = scoreColor(otro.similitud);
              const pct       = Math.round(otro.similitud * 100);
              const topTacticas = otro.tacticas.slice(0, 3).map((t) => tacticaLabels[t] ?? t);
              const extraTacticas = otro.tacticas.length - topTacticas.length;

              return (
                <div
                  key={otro.perfilId}
                  style={{
                    borderRadius: 12,
                    background: confirmed ? '#f6f9f5' : discarded ? 'var(--color-gray-50)' : 'white',
                    border: `1px solid ${confirmed ? '#c8ddc0' : discarded ? 'var(--color-border-subtle)' : 'var(--color-border-subtle)'}`,
                    borderLeft: `4px solid ${confirmed ? '#6b7f5e' : discarded ? '#d1d5db' : otroColor}`,
                    opacity: discarded ? 0.6 : 1,
                    transition: 'opacity 200ms',
                    overflow: 'hidden',
                  }}
                >
                  {/* Similarity bar */}
                  <div style={{ height: 3, background: 'var(--color-gray-100)' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: sc, transition: 'width 600ms ease' }} />
                  </div>

                  <div style={{ padding: '14px 16px' }}>
                    {/* Top row: platforms + pct + risk */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-text-primary)', marginBottom: 3 }}>
                          {otro.plataformas.join(' · ')}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ padding: '1px 7px', borderRadius: 999, fontSize: '0.65rem', fontFamily: 'var(--font-body)', fontWeight: 600, background: `${otroColor}18`, color: otroColor }}>
                            {riskLabels[otro.nivelRiesgo] ?? otro.nivelRiesgo}
                          </span>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>
                            {otro.numReportes} {otro.numReportes === 1 ? 'reporte' : 'reportes'}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 800, color: sc, lineHeight: 1 }}>
                          {pct}%
                        </div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                          similitud
                        </div>
                      </div>
                    </div>

                    {/* Identifiers */}
                    {otro.identificadores.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
                        {otro.identificadores.slice(0, 3).map((id) => (
                          <span key={id} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', background: '#f0f4f8', border: '1px solid #d1dce8', borderRadius: 6, padding: '2px 8px', color: '#3d5e81' }}>
                            {id}
                          </span>
                        ))}
                        {otro.identificadores.length > 3 && (
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--color-text-tertiary)', alignSelf: 'center' }}>
                            +{otro.identificadores.length - 3} más
                          </span>
                        )}
                      </div>
                    )}

                    {/* Tactics */}
                    {topTacticas.length > 0 && (
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.76rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                        {topTacticas.join(' · ')}{extraTacticas > 0 ? ` +${extraTacticas} más` : ''}
                      </div>
                    )}

                    {/* Zones */}
                    {otro.zonasActivas.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                        <MapPin size={11} color="var(--color-text-tertiary)" />
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>
                          {otro.zonasActivas.slice(0, 2).map((z) => z.replace(/, Nayarit$/, '')).join(', ')}
                          {otro.zonasActivas.length > 2 ? ` +${otro.zonasActivas.length - 2}` : ''}
                        </span>
                      </div>
                    )}

                    {/* Actions row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      {confirmed ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <CheckCircle size={13} color="#6b7f5e" />
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.73rem', fontWeight: 600, color: '#6b7f5e' }}>
                            Mismo agresor confirmado
                          </span>
                        </div>
                      ) : discarded ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <XCircle size={13} color="var(--color-text-tertiary)" />
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.73rem', color: 'var(--color-text-tertiary)' }}>
                            Descartado
                          </span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => handleConfirmar(otro)} disabled={isPending}
                            style={{ padding: '5px 14px', borderRadius: 999, border: 'none', cursor: isPending ? 'not-allowed' : 'pointer', background: '#2c3e50', color: 'white', fontFamily: 'var(--font-body)', fontSize: '0.73rem', fontWeight: 500, opacity: isPending ? 0.55 : 1 }}>
                            Mismo agresor
                          </button>
                          <button onClick={() => handleDescartar(otro)} disabled={isPending}
                            style={{ padding: '5px 14px', borderRadius: 999, border: '1px solid var(--color-border)', cursor: isPending ? 'not-allowed' : 'pointer', background: 'transparent', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', fontSize: '0.73rem', opacity: isPending ? 0.55 : 1 }}>
                            Distintos
                          </button>
                        </div>
                      )}
                      <button onClick={() => router.push(`/policia/perfil/${otro.perfilId}`)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-text-tertiary)', padding: 0 }}>
                        Ver perfil →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
