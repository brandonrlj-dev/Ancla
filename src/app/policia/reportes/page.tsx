'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Heart, Clock, Link2, Mail, MessageCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { directReports } from '@/lib/mock-data';

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

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  'nuevo':       { label: 'Nuevo',       color: '#ef4444', bg: '#fef2f2', icon: AlertCircle },
  'en-revision': { label: 'En revisión', color: '#f97316', bg: '#fff7ed', icon: Clock },
  'atendido':    { label: 'Atendido',    color: '#22c55e', bg: '#f0fdf4', icon: CheckCircle },
};

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export default function ReportesPage() {
  const router   = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div style={{ padding: isMobile ? '24px 16px' : '32px 32px', maxWidth: 900, margin: '0 auto' }}>
      {/* Green banner header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, var(--color-sage-500) 0%, var(--color-sage-600) 100%)',
          borderRadius: 18,
          padding: isMobile ? '24px 20px' : '28px 32px',
          marginBottom: 28,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -20, right: 60, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Heart size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 600, color: 'white', marginBottom: 4 }}>
              Reportes directos
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
              Mensajes enviados directamente por jóvenes a través del canal ANCLA. Requieren atención cuidadosa y empática.
            </p>
          </div>
        </div>

        <div style={{ position: 'relative', display: 'flex', gap: 20, marginTop: 18, flexWrap: 'wrap' }}>
          {[
            { label: 'Total recibidos', value: directReports.length },
            { label: 'Nuevos', value: directReports.filter((r) => r.status === 'nuevo').length },
            { label: 'En revisión', value: directReports.filter((r) => r.status === 'en-revision').length },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', marginTop: 3 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Report cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {directReports.map((rep, i) => {
          const status = statusConfig[rep.status] ?? statusConfig['en-revision'];
          const StatusIcon = status.icon;

          return (
            <motion.div
              key={rep.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{
                background: 'white', borderRadius: 16, boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--color-border-subtle)',
                borderTop: `3px solid ${urgencyColors[rep.urgency] ?? '#999'}`,
                overflow: 'hidden',
              }}
            >
              {/* Card header */}
              <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--color-border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>{rep.folio}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, background: status.bg, fontSize: '0.7rem', fontWeight: 600, color: status.color, fontFamily: 'var(--font-body)' }}>
                        <StatusIcon size={10} />
                        {status.label}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, background: `${urgencyColors[rep.urgency] ?? '#999'}14`, fontSize: '0.7rem', fontWeight: 600, color: urgencyColors[rep.urgency] ?? '#999', fontFamily: 'var(--font-body)' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: urgencyColors[rep.urgency] ?? '#999' }} />
                        {urgencyLabels[rep.urgency]}
                      </span>
                    </div>

                    {/* Message bubble */}
                    <div style={{
                      padding: '12px 16px', borderRadius: 12,
                      background: 'var(--color-sage-50)', border: '1px solid var(--color-sage-100)',
                      fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--color-text-primary)',
                      fontStyle: 'italic', lineHeight: 1.55,
                    }}>
                      <MessageCircle size={13} color="var(--color-sage-400)" style={{ marginRight: 6, verticalAlign: 'middle' }} />
                      &ldquo;{rep.summary}&rdquo;
                    </div>
                  </div>
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: '14px 20px', display: 'flex', gap: isMobile ? 12 : 24, flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Contact chip */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={12} color="var(--color-text-tertiary)" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                    {rep.contact}
                  </span>
                </div>

                {/* Vinculation chip */}
                {rep.vinculation && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: 'var(--color-terra-50)', border: '1px solid var(--color-terra-200)' }}>
                    <Link2 size={11} color="var(--color-terra-500)" />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-terra-600)', fontWeight: 500 }}>
                      {rep.vinculation}
                    </span>
                  </div>
                )}

                {/* Timestamp */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto' }}>
                  <Clock size={11} color="var(--color-text-tertiary)" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-text-tertiary)' }}>
                    {formatTimestamp(rep.timestamp)}
                  </span>
                </div>
              </div>

              {/* Action bar */}
              <div style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border-subtle)', background: 'var(--color-gray-50)', display: 'flex', gap: 10 }}>
                <button
                  onClick={() => router.push(`/policia/alertas`)}
                  style={{
                    padding: '7px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
                    background: '#2c3e50', color: 'white',
                    fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 500,
                  }}
                >
                  Abrir caso
                </button>
                <button
                  style={{
                    padding: '7px 16px', borderRadius: 999, border: '1px solid var(--color-border)', cursor: 'pointer',
                    background: 'white', color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-body)', fontSize: '0.78rem',
                  }}
                >
                  Marcar atendido
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
