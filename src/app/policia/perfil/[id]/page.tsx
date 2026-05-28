'use client';

import { useEffect, useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ArrowLeft, Users, MapPin, Smartphone, Clock, Link2, CheckCircle, XCircle } from 'lucide-react';
import { getPerfilDetalle, confirmarVinculacionPerfil, descartarVinculacionPerfil } from '@/actions/policia';
import { type PerfilAgresorRow, type PerfilSimilarRow, type VinculacionPerfilRow } from '@/lib/policia-types';

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
  const [loading,       setLoading]       = useState(true);
  const [isPending,     startTransition]  = useTransition();

  useEffect(() => {
    getPerfilDetalle(id).then(({ perfil: p, similares: s, vinculaciones: v }) => {
      setPerfil(p);
      setSimilares(s);
      setVinculaciones(v);
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
          Perfiles con vector de comportamiento similar (≥ 70% similitud). El policía decide si corresponden al mismo agresor.
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

              return (
                <div
                  key={otro.perfilId}
                  style={{
                    borderRadius: 12, padding: '16px',
                    background: confirmed ? 'var(--color-sage-50)' : discarded ? 'var(--color-gray-50)' : 'white',
                    border: `1px solid ${confirmed ? 'var(--color-sage-200)' : discarded ? 'var(--color-border-subtle)' : 'var(--color-border-subtle)'}`,
                    opacity: discarded ? 0.65 : 1,
                    transition: 'opacity 200ms',
                  }}
                >
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: otroColor, flexShrink: 0 }} />
                      <span
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-primary)', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'var(--color-border)' }}
                        onClick={() => router.push(`/policia/perfil/${otro.perfilId}`)}
                      >
                        PER-{otro.perfilId.slice(0, 6).toUpperCase()}
                      </span>
                      <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: '0.68rem', fontFamily: 'var(--font-body)', fontWeight: 600, background: `${otroColor}15`, color: otroColor, border: `1px solid ${otroColor}30` }}>
                        {riskLabels[otro.nivelRiesgo] ?? otro.nivelRiesgo}
                      </span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: sc }}>
                      {Math.round(otro.similitud * 100)}% similitud
                    </span>
                  </div>

                  {/* Details */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    <Tag label={otro.plataformas.join(', ')} />
                    {otro.tacticas.map((t) => <Tag key={t} label={tacticaLabels[t] ?? t} />)}
                    {otro.zonasActivas.map((z) => <Tag key={z} label={z} color="#5b81a8" />)}
                  </div>

                  {/* Actions */}
                  {confirmed ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle size={14} color="var(--color-sage-600)" />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.76rem', fontWeight: 600, color: 'var(--color-sage-700)' }}>
                        Confirmado como el mismo agresor
                      </span>
                    </div>
                  ) : discarded ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <XCircle size={14} color="var(--color-text-tertiary)" />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.76rem', color: 'var(--color-text-tertiary)' }}>
                        Descartado — agresores distintos
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleConfirmar(otro)}
                        disabled={isPending}
                        style={{ padding: '6px 16px', borderRadius: 999, border: 'none', cursor: isPending ? 'not-allowed' : 'pointer', background: '#2c3e50', color: 'white', fontFamily: 'var(--font-body)', fontSize: '0.76rem', fontWeight: 500, opacity: isPending ? 0.55 : 1, transition: 'opacity 150ms' }}
                      >
                        Mismo agresor
                      </button>
                      <button
                        onClick={() => handleDescartar(otro)}
                        disabled={isPending}
                        style={{ padding: '6px 16px', borderRadius: 999, border: '1px solid var(--color-border)', cursor: isPending ? 'not-allowed' : 'pointer', background: 'white', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', fontSize: '0.76rem', opacity: isPending ? 0.55 : 1, transition: 'opacity 150ms' }}
                      >
                        Distintos
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
