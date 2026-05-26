'use client';

import { useEffect, useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ArrowLeft, AlertTriangle, MapPin, Smartphone, Clock, TrendingUp, Info, Link2, CheckCircle } from 'lucide-react';
import FaseGrooming from '@/components/viz/FaseGrooming';
import ActivityHeatmap from '@/components/viz/ActivityHeatmap';
import { linguisticPatterns, temporalEvents } from '@/lib/mock-data';
import { getAlerta, getVinculaciones, confirmarVinculacion, descartarVinculacion, updateAlertaEstado } from '@/actions/policia';
import { type AlertaRow, type VinculacionRow } from '@/lib/policia-types';

const urgencyColors: Record<string, string> = {
  critica: '#ef4444',
  alta:    '#f97316',
  media:   '#eab308',
  baja:    '#22c55e',
};

const urgencyLabels: Record<string, string> = {
  critica: 'Crítica',
  alta:    'Alta',
  media:   'Media',
  baja:    'Baja',
};

const estadoLabels: Record<string, string> = {
  nueva:            'Nueva',
  en_investigacion: 'En investigación',
  resuelta:         'Resuelta',
};

const eventTypeColors: Record<string, string> = {
  contact:  '#5b81a8',
  talk:     '#6b7f5e',
  isolate:  '#eab308',
  request:  '#f97316',
  pressure: '#ef4444',
  report:   '#8b5cf6',
};

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function IllustrativeNote() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, background: 'var(--color-calm-50)', border: '1px solid var(--color-calm-200)', marginBottom: 14 }}>
      <Info size={12} color="var(--color-calm-500)" />
      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-calm-700)' }}>
        Visualización ilustrativa — requiere historial acumulado de casos
      </span>
    </div>
  );
}

function scoreColor(score: number): string {
  if (score >= 0.95) return '#ef4444';
  if (score >= 0.88) return '#f97316';
  return '#eab308';
}

export default function AlertaDetailPage() {
  const router   = useRouter();
  const params   = useParams();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const id       = params.id as string;

  const [alerta,        setAlerta]        = useState<AlertaRow | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [vinculaciones, setVinculaciones] = useState<VinculacionRow[]>([]);
  const [isPending,     startTransition]  = useTransition();

  useEffect(() => {
    getAlerta(id).then((data) => {
      setAlerta(data);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    getVinculaciones(id).then(setVinculaciones);
  }, [id]);

  function handleUpdateAlertaEstado(nuevoEstado: 'nueva' | 'en_investigacion' | 'resuelta') {
    if (!alerta || alerta.estado === nuevoEstado) return;
    setAlerta({ ...alerta, estado: nuevoEstado });
    startTransition(async () => { await updateAlertaEstado(alerta.id, nuevoEstado); });
  }

  function handleConfirmar(v: VinculacionRow) {
    setVinculaciones((prev) => prev.map((x) => x.id === v.id ? { ...x, confirmada: true } : x));
    startTransition(async () => { await confirmarVinculacion(v.id, v.alertaId); });
  }

  function handleDescartar(vinculacionId: string) {
    setVinculaciones((prev) => prev.filter((x) => x.id !== vinculacionId));
    startTransition(async () => { await descartarVinculacion(vinculacionId); });
  }

  if (loading) {
    return (
      <div style={{ padding: '40px 32px', fontFamily: 'var(--font-body)', color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>
        Cargando…
      </div>
    );
  }

  if (!alerta) {
    return (
      <div style={{ padding: '40px 32px' }}>
        <button onClick={() => router.push('/policia/alertas')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-body)', fontSize: '0.82rem', padding: 0, marginBottom: 16 }}>
          <ArrowLeft size={14} /> Todas las alertas
        </button>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>
          Alerta no encontrada.
        </p>
      </div>
    );
  }

  const urgencyColor = urgencyColors[alerta.nivelUrgencia] ?? '#999';
  const ref = `ALT-${alerta.id.slice(0, 6).toUpperCase()}`;

  return (
    <div style={{ padding: isMobile ? '24px 16px' : '32px 32px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Back + title */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <button
          onClick={() => router.push('/policia/alertas')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-body)', fontSize: '0.82rem', padding: 0, marginBottom: 14 }}
        >
          <ArrowLeft size={14} /> Todas las alertas
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: urgencyColor }} />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {ref}
            </h1>
          </div>
          <span style={{ padding: '4px 12px', borderRadius: 999, background: `${urgencyColor}18`, border: `1px solid ${urgencyColor}40`, fontSize: '0.76rem', fontWeight: 600, color: urgencyColor, fontFamily: 'var(--font-body)' }}>
            {urgencyLabels[alerta.nivelUrgencia] ?? alerta.nivelUrgencia}
          </span>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: 6 }}>
          {alerta.plataformas.join(' + ')} · {alerta.numVictimas} {alerta.numVictimas === 1 ? 'víctima' : 'víctimas'} · {alerta.zonaGeografica ?? 'Nayarit'}
        </p>

        {/* Estado selector */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          {(['nueva', 'en_investigacion', 'resuelta'] as const).map((e) => {
            const active = alerta.estado === e;
            return (
              <button
                key={e}
                onClick={() => handleUpdateAlertaEstado(e)}
                disabled={active || isPending}
                style={{
                  padding: '5px 14px', borderRadius: 999,
                  border: active ? 'none' : '1px solid var(--color-border)',
                  background: active ? '#2c3e50' : 'white',
                  color: active ? 'white' : 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-body)', fontSize: '0.76rem',
                  fontWeight: active ? 600 : 400,
                  cursor: active ? 'default' : isPending ? 'not-allowed' : 'pointer',
                  opacity: !active && isPending ? 0.55 : 1,
                  transition: 'all 180ms',
                  boxShadow: active ? 'none' : 'var(--shadow-sm)',
                }}
              >
                {estadoLabels[e]}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Meta chips */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}
        style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}
      >
        {[
          { icon: MapPin,        label: alerta.zonaGeografica ?? 'Sin zona' },
          { icon: Smartphone,    label: alerta.plataformas.join(', ') },
          { icon: AlertTriangle, label: `${alerta.numVictimas} ${alerta.numVictimas === 1 ? 'víctima' : 'víctimas'}` },
          { icon: Clock,         label: formatTimestamp(alerta.createdAt) },
        ].map(({ icon: Icon, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: 'white', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)' }}>
            <Icon size={12} color="var(--color-text-tertiary)" />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>{label}</span>
          </div>
        ))}
      </motion.div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Fase grooming */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)' }}
        >
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)', marginBottom: 12 }}>
            Fase de grooming detectada
          </div>
          <IllustrativeNote />
          <FaseGrooming activePhase={3} />
        </motion.div>

        {/* Linguistic patterns */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
          style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)' }}
        >
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)', marginBottom: 12 }}>
            Patrones lingüísticos
          </div>
          <IllustrativeNote />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {linguisticPatterns.map((p) => (
              <div key={p.pattern}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>{p.pattern}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: p.frequency >= 85 ? '#ef4444' : p.frequency >= 70 ? '#f97316' : '#6b7280' }}>
                    {p.frequency}%
                  </span>
                </div>
                <div style={{ height: 5, borderRadius: 999, background: 'var(--color-gray-100)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p.frequency}%` }}
                    transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                    style={{ height: '100%', background: p.frequency >= 85 ? '#ef4444' : p.frequency >= 70 ? '#f97316' : '#eab308', borderRadius: 999 }}
                  />
                </div>
                <div style={{ marginTop: 4 }}>
                  {p.examples.slice(0, 1).map((ex) => (
                    <span key={ex} style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>{ex}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
        style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)', marginBottom: 20 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <TrendingUp size={16} color="var(--color-text-secondary)" />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
            Línea temporal del caso
          </div>
        </div>
        <IllustrativeNote />
        <div style={{ position: 'relative', paddingLeft: 28 }}>
          <div style={{ position: 'absolute', left: 9, top: 8, bottom: 8, width: 2, background: 'var(--color-border-subtle)', borderRadius: 1 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {temporalEvents.map((ev, i) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.32 + i * 0.06 }}
                style={{ position: 'relative', display: 'flex', gap: 14 }}
              >
                <div style={{ position: 'absolute', left: -23, top: 4, width: 10, height: 10, borderRadius: '50%', background: eventTypeColors[ev.type] ?? '#999', border: '2px solid white', boxShadow: `0 0 0 2px ${eventTypeColors[ev.type] ?? '#999'}40` }} />
                <div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-text-tertiary)' }}>{ev.date}</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.82rem', color: 'var(--color-text-primary)' }}>{ev.label}</span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>
                    {ev.detail}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Activity heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
        style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)', marginBottom: 20 }}
      >
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)', marginBottom: 12 }}>
          Mapa de actividad — horarios de contacto
        </div>
        <IllustrativeNote />
        <ActivityHeatmap />
      </motion.div>

      {/* Vinculaciones — only shown when present */}
      {vinculaciones.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46 }}
          style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Link2 size={16} color="var(--color-text-secondary)" />
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
              Posibles coincidencias
            </div>
            <span style={{ background: 'var(--color-gray-100)', borderRadius: 999, padding: '2px 8px', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              {vinculaciones.length}
            </span>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-tertiary)', marginBottom: 16, lineHeight: 1.5 }}>
            Reportes con perfil de agresor similar al de esta alerta. Confirmar registra una víctima adicional. Descartar elimina la vinculación permanentemente.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {vinculaciones.map((v) => (
              <div
                key={v.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                  padding: '12px 16px', borderRadius: 12,
                  background: v.confirmada ? 'var(--color-sage-50)' : 'var(--color-gray-50)',
                  border: `1px solid ${v.confirmada ? 'var(--color-sage-200)' : 'var(--color-border-subtle)'}`,
                }}
              >
                {/* Folio */}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-primary)', flex: 1, minWidth: 100 }}>
                  {v.folio}
                </span>

                {/* Score */}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700, color: scoreColor(v.similitudScore), whiteSpace: 'nowrap' }}>
                  {Math.round(v.similitudScore * 100)}% similitud
                </span>

                {/* Actions */}
                {v.confirmada ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, background: 'var(--color-sage-100)', fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-sage-700)' }}>
                    <CheckCircle size={11} />
                    Confirmada
                  </span>
                ) : (
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => handleConfirmar(v)}
                      disabled={isPending}
                      style={{ padding: '6px 14px', borderRadius: 999, border: 'none', cursor: isPending ? 'not-allowed' : 'pointer', background: '#2c3e50', color: 'white', fontFamily: 'var(--font-body)', fontSize: '0.76rem', fontWeight: 500, opacity: isPending ? 0.55 : 1, transition: 'opacity 150ms' }}
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => handleDescartar(v.id)}
                      disabled={isPending}
                      style={{ padding: '6px 14px', borderRadius: 999, border: '1px solid var(--color-border)', cursor: isPending ? 'not-allowed' : 'pointer', background: 'white', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', fontSize: '0.76rem', opacity: isPending ? 0.55 : 1, transition: 'opacity 150ms' }}
                    >
                      Descartar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
