'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useTransition } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Heart, Clock, Link2, CheckCircle, AlertCircle, Loader2, Users, Shield } from 'lucide-react';
import { getReportes, updateReporteEstado, decryptContacto } from '@/actions/policia';
import { mapReporteRow, type ReporteRow, type ContactoDecifrado } from '@/lib/policia-types';
import { createClient } from '@/lib/supabase/client';

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

const estadoConfig: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  nuevo:       { label: 'Nuevo',        color: '#ef4444', bg: '#fef2f2', icon: AlertCircle },
  en_revision: { label: 'En revisión',  color: '#f97316', bg: '#fff7ed', icon: Clock },
  procesado:   { label: 'Atendido',     color: '#22c55e', bg: '#f0fdf4', icon: CheckCircle },
  archivado:   { label: 'Archivado',    color: '#9ca3af', bg: '#f9fafb', icon: CheckCircle },
};

function deriveUrgency(r: ReporteRow): string {
  if (r.patrones.includes('amenaza_difusion')) return 'critica';
  if (r.patrones.length >= 2) return 'alta';
  if (r.patrones.length === 1) return 'media';
  return 'baja';
}

function deriveSummary(r: ReporteRow): string {
  const tipoMap: Record<string, string> = { sextorsion: 'Sextorsión', grooming: 'Grooming', acoso: 'Acoso digital' };
  const tipo = tipoMap[r.tipo] ?? r.tipo;
  return `${tipo} vía ${r.plataforma}`;
}

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

// Map a raw realtime payload to ReporteRow (same shape as DB row)
function mapPayload(raw: Record<string, unknown>): ReporteRow {
  return mapReporteRow(raw);
}

// ── Card ──────────────────────────────────────────────────────────────────────

function ReporteCard({ rep, onUpdateEstado }: {
  rep: ReporteRow;
  onUpdateEstado: (id: string, estado: 'en_revision' | 'procesado') => void;
}) {
  const isMobile                       = useMediaQuery('(max-width: 768px)');
  const [contacto,   setContacto]      = useState<ContactoDecifrado | null>(null);
  const [loadingCtx, setLoadingCtx]    = useState(false);
  const urgency   = deriveUrgency(rep);

  async function handleVerContacto() {
    setLoadingCtx(true);
    try { setContacto(await decryptContacto(rep.id)); }
    finally { setLoadingCtx(false); }
  }
  const status    = estadoConfig[rep.estado] ?? estadoConfig['nuevo'];
  const StatusIcon = status.icon;
  const isNew     = rep.estado === 'nuevo';
  const isReview  = rep.estado === 'en_revision';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'white', borderRadius: 16, boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border-subtle)',
        borderTop: `3px solid ${urgencyColors[urgency]}`,
        overflow: 'hidden',
      }}
    >
      {/* Card header */}
      <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--color-border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>
                {rep.folio}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, background: status.bg, fontSize: '0.7rem', fontWeight: 600, color: status.color, fontFamily: 'var(--font-body)' }}>
                <StatusIcon size={10} /> {status.label}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, background: `${urgencyColors[urgency]}14`, fontSize: '0.7rem', fontWeight: 600, color: urgencyColors[urgency], fontFamily: 'var(--font-body)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: urgencyColors[urgency] }} />
                {urgencyLabels[urgency]}
              </span>
              {/* Tipo reporte badge */}
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, background: rep.tipoReporte === 'legal' ? 'var(--color-calm-50)' : 'var(--color-gray-100)', fontSize: '0.7rem', color: rep.tipoReporte === 'legal' ? 'var(--color-calm-700)' : 'var(--color-text-tertiary)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                {rep.tipoReporte === 'legal' ? <><Users size={9} /> Seguimiento legal</> : <><Shield size={9} /> Solo registro</>}
              </span>
            </div>

            {/* Summary */}
            <div style={{ padding: '12px 16px', borderRadius: 12, background: 'var(--color-sage-50)', border: '1px solid var(--color-sage-100)', fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--color-text-primary)', lineHeight: 1.55 }}>
              {deriveSummary(rep)}
              {rep.patrones.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                  {rep.patrones.map((p) => (
                    <span key={p} style={{ padding: '2px 8px', borderRadius: 999, fontSize: '0.7rem', background: 'var(--color-terra-100)', color: 'var(--color-terra-700)', border: '1px solid var(--color-terra-200)', fontFamily: 'var(--font-body)' }}>
                      {p.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '14px 20px', display: 'flex', gap: isMobile ? 12 : 24, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Contact type */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {rep.tieneContacto
            ? <><Link2 size={12} color="var(--color-calm-500)" /><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-calm-600)' }}>Contacto disponible</span></>
            : <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>Sin contacto</span>
          }
        </div>

        {/* Adult notice */}
        {rep.adultoAlTanto === true && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, background: 'var(--color-calm-50)', border: '1px solid var(--color-calm-200)' }}>
            <Users size={10} color="var(--color-calm-500)" />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--color-calm-600)', fontWeight: 500 }}>Familiar al tanto</span>
          </div>
        )}

        {/* Timestamp */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto' }}>
          <Clock size={11} color="var(--color-text-tertiary)" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-text-tertiary)' }}>
            {formatTimestamp(rep.createdAt)}
          </span>
        </div>
      </div>

      {/* Action bar */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border-subtle)', background: 'var(--color-gray-50)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {isNew && (
          <button
            onClick={() => onUpdateEstado(rep.id, 'en_revision')}
            style={{ padding: '7px 16px', borderRadius: 999, border: 'none', cursor: 'pointer', background: '#2c3e50', color: 'white', fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 500 }}
          >
            Tomar caso
          </button>
        )}
        {(isNew || isReview) && (
          <button
            onClick={() => onUpdateEstado(rep.id, 'procesado')}
            style={{ padding: '7px 16px', borderRadius: 999, border: '1px solid var(--color-border)', cursor: 'pointer', background: 'white', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', fontSize: '0.78rem' }}
          >
            Marcar atendido
          </button>
        )}
        {rep.estado === 'procesado' && (
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic', lineHeight: '32px' }}>
            Caso atendido
          </span>
        )}
        {rep.tieneContacto && !contacto && (
          <button
            onClick={handleVerContacto}
            disabled={loadingCtx}
            style={{ marginLeft: 'auto', padding: '7px 16px', borderRadius: 999, border: '1px solid var(--color-calm-300)', cursor: loadingCtx ? 'not-allowed' : 'pointer', background: 'var(--color-calm-50)', color: 'var(--color-calm-700)', fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 500, opacity: loadingCtx ? 0.6 : 1, transition: 'opacity 150ms' }}
          >
            {loadingCtx ? 'Descifrando…' : 'Ver contacto'}
          </button>
        )}
      </div>

      {/* Decrypted contact — shown once, not persisted */}
      {contacto && (
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--color-calm-200)', background: 'var(--color-calm-50)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-calm-700)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Contacto descifrado · solo visible en sesión
          </span>
          {contacto.victima && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
              {contacto.victima}
            </span>
          )}
          {contacto.familiar && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {contacto.familiar.nombre && (
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                  {contacto.familiar.nombre}
                </span>
              )}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                {contacto.familiar.contacto}
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReportesPage() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [reportes, setReportes] = useState<ReporteRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getReportes().then((data) => { setReportes(data); setLoading(false); });
  }, []);

  // Realtime — prepend new reports as they arrive
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('reportes-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reportes_directos' },
        (payload) => {
          const nuevo = mapPayload(payload.new as Record<string, unknown>);
          setReportes((prev) => [nuevo, ...prev]);
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  function handleUpdateEstado(id: string, estado: 'en_revision' | 'procesado') {
    // Optimistic update
    setReportes((prev) => prev.map((r) => r.id === id ? { ...r, estado } : r));
    startTransition(async () => {
      await updateReporteEstado(id, estado);
    });
  }

  const nuevo     = reportes.filter((r) => r.estado === 'nuevo').length;
  const revision  = reportes.filter((r) => r.estado === 'en_revision').length;

  return (
    <div style={{ padding: isMobile ? '24px 16px' : '32px 32px', maxWidth: 900, margin: '0 auto' }}>

      {/* Header banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ background: 'linear-gradient(135deg, var(--color-sage-500) 0%, var(--color-sage-600) 100%)', borderRadius: 18, padding: isMobile ? '24px 20px' : '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -20, right: 60, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Heart size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 600, color: 'white', marginBottom: 3 }}>
              Reportes directos
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
              Enviados por jóvenes a través del canal ANCLA · En tiempo real
            </p>
          </div>
          {/* Live indicator */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 0 3px rgba(74,222,128,0.3)', animation: 'pulse 2s infinite' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)' }}>En vivo</span>
          </div>
        </div>

        <div style={{ position: 'relative', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Total recibidos', value: reportes.length },
            { label: 'Nuevos',          value: nuevo },
            { label: 'En revisión',     value: revision },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', marginTop: 3 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px', justifyContent: 'center', color: 'var(--color-text-tertiary)' }}>
          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>Cargando reportes…</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && reportes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-tertiary)' }}>
          <Heart size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>
            No hay reportes todavía. Aparecerán aquí en tiempo real cuando los jóvenes envíen.
          </p>
        </div>
      )}

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <AnimatePresence mode="popLayout">
          {reportes.map((rep) => (
            <ReporteCard key={rep.id} rep={rep} onUpdateEstado={handleUpdateEstado} />
          ))}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
