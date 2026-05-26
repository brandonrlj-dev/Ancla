'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import { AlertTriangle, Filter, MapPin, Smartphone } from 'lucide-react';
import { getAlertas } from '@/actions/policia';
import { type AlertaRow } from '@/lib/policia-types';
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

const estadoLabels: Record<string, string> = {
  nueva:             'Nueva',
  en_investigacion:  'En investigación',
  resuelta:          'Resuelta',
  archivada:         'Archivada',
};

const FILTERS = ['Todas', 'Crítica', 'Alta', 'Media', 'Baja'] as const;
type Filter = typeof FILTERS[number];

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export default function AlertasPage() {
  const router   = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [alertas, setAlertas] = useState<AlertaRow[]>([]);
  const [active,  setActive]  = useState<Filter>('Todas');

  useEffect(() => {
    getAlertas().then(setAlertas);
  }, []);

  // Realtime: refetch on insert or update
  useEffect(() => {
    const supabase = createClient();
    const ch = supabase
      .channel('alertas-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alertas' }, () => {
        getAlertas().then(setAlertas);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = alertas.filter((r) =>
    active === 'Todas' ? true : urgencyLabels[r.nivelUrgencia] === active,
  );

  return (
    <div style={{ padding: isMobile ? '24px 16px' : '32px 32px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <AlertTriangle size={20} color="var(--color-terra-500)" />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Alertas activas
          </h1>
          <span style={{ background: 'var(--color-terra-500)', color: 'white', borderRadius: 999, padding: '2px 9px', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            {filtered.length}
          </span>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-text-tertiary)' }}>
          Monitoreando {alertas.length} casos · Actualización en tiempo real
        </p>
      </motion.div>

      {/* Filter pills */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}
      >
        <Filter size={14} color="var(--color-text-tertiary)" />
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setActive(f)} style={{
            padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: active === f ? 600 : 400,
            background: active === f ? '#2c3e50' : 'white',
            color: active === f ? 'white' : 'var(--color-text-secondary)',
            boxShadow: active === f ? 'none' : 'var(--shadow-sm)',
            transition: 'all 180ms',
          }}>
            {f}
          </button>
        ))}
      </motion.div>

      {/* Table — desktop */}
      {!isMobile && (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ background: 'white', borderRadius: 16, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)', overflow: 'hidden' }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)', background: 'var(--color-gray-50)' }}>
                  {['Urgencia', 'Ref', 'Plataforma(s)', 'Zona', 'Víctimas', 'Estado', 'Timestamp', ''].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filtered.map((row, i) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => router.push(`/policia/alerta/${row.id}`)}
                      style={{ borderBottom: '1px solid var(--color-border-subtle)', cursor: 'pointer', transition: 'background 150ms' }}
                      onMouseEnter={(e) => { (e.currentTarget.style.background = 'var(--color-gray-50)'); }}
                      onMouseLeave={(e) => { (e.currentTarget.style.background = 'white'); }}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: urgencyColors[row.nivelUrgencia] ?? '#999', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-body)', fontWeight: 600, color: urgencyColors[row.nivelUrgencia] ?? '#999' }}>
                            {urgencyLabels[row.nivelUrgencia] ?? row.nivelUrgencia}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>
                          ALT-{row.id.slice(0, 6).toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Smartphone size={11} color="var(--color-text-tertiary)" />
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                            {row.plataformas.join(', ')}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <MapPin size={11} color="var(--color-text-tertiary)" />
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                            {row.zonaGeografica ?? '—'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {row.numVictimas}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '3px 9px', borderRadius: 999,
                          fontSize: '0.68rem', fontFamily: 'var(--font-body)', fontWeight: 500, whiteSpace: 'nowrap',
                          background: row.estado === 'en_investigacion' ? '#dbeafe' : row.estado === 'nueva' ? '#dcfce7' : '#f3f4f6',
                          color:      row.estado === 'en_investigacion' ? '#1d4ed8' : row.estado === 'nueva' ? '#15803d' : '#6b7280',
                        }}>
                          {estadoLabels[row.estado] ?? row.estado}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>
                          {formatTimestamp(row.createdAt)}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-calm-500)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>Ver →</span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: '40px 16px', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
                      Sin alertas activas con este filtro
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
            {filtered.map((row, i) => (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => router.push(`/policia/alerta/${row.id}`)}
                style={{
                  background: 'white', borderRadius: 14, padding: '16px',
                  boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)',
                  borderLeft: `4px solid ${urgencyColors[row.nivelUrgencia] ?? '#999'}`,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: urgencyColors[row.nivelUrgencia] ?? '#999' }} />
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: urgencyColors[row.nivelUrgencia] ?? '#999', fontFamily: 'var(--font-body)' }}>
                      {urgencyLabels[row.nivelUrgencia] ?? row.nivelUrgencia}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-text-tertiary)' }}>
                    ALT-{row.id.slice(0, 6).toUpperCase()}
                  </span>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-text-primary)', marginBottom: 10, fontWeight: 500 }}>
                  {row.plataformas.join(' + ')} · {row.numVictimas} {row.numVictimas === 1 ? 'víctima' : 'víctimas'}
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
                    <MapPin size={10} />{row.zonaGeografica ?? '—'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                    {formatTimestamp(row.createdAt)}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div style={{ padding: '40px 0', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
              Sin alertas activas con este filtro
            </div>
          )}
        </div>
      )}
    </div>
  );
}
