'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import useMediaQuery from '@mui/material/useMediaQuery';
import { BarChart3, ShieldAlert, Target } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { getEstadisticas } from '@/actions/policia';
import { type EstadisticasData } from '@/lib/policia-types';

const ZONE_COLORS = ['#bf6b4a', '#f97316', '#eab308', '#6b7f5e', '#5b81a8', '#8b5cf6'];

const RIESGO_COLORS: Record<string, string> = {
  critico: '#ef4444',
  alto:    '#f97316',
  medio:   '#eab308',
  bajo:    '#22c55e',
};

const RIESGO_LABELS: Record<string, string> = {
  critico: 'Crítico',
  alto:    'Alto',
  medio:   'Medio',
  bajo:    'Bajo',
};

const TACTICA_LABELS: Record<string, string> = {
  love_bombing:       'Love bombing',
  aislamiento:        'Aislamiento',
  solicitud_imagen:   'Solicitud de imagen',
  amenaza_difusion:   'Amenaza de difusión',
  gradualidad_sexual: 'Gradualidad sexual',
  secretismo:         'Secretismo',
  presion:            'Presión',
};

export default function EstadisticasPage() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [stats, setStats] = useState<EstadisticasData | null>(null);

  useEffect(() => {
    getEstadisticas().then(setStats);
  }, []);

  return (
    <div style={{ padding: isMobile ? '24px 16px' : '32px 32px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Page title */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <BarChart3 size={20} color="var(--color-calm-500)" />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Estadísticas
          </h1>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-text-tertiary)' }}>
          Datos reales del sistema · Actualizado en tiempo real
        </p>
      </motion.div>

      {/* Riesgo + zone — 2 cols desktop */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Risk level distribution — real */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <ShieldAlert size={15} color="var(--color-text-secondary)" />
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
              Perfiles por nivel de riesgo
            </div>
          </div>
          {stats && stats.riesgoStats.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {stats.riesgoStats.map((r, i) => {
                const color = RIESGO_COLORS[r.nivel] ?? '#999';
                const total = stats.riesgoStats.reduce((s, x) => s + x.count, 0);
                const pct   = total > 0 ? Math.round((r.count / total) * 100) : 0;
                return (
                  <motion.div key={r.nivel} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.08 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                        {RIESGO_LABELS[r.nivel] ?? r.nivel}
                      </span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, color }}>{pct}%</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-text-tertiary)' }}>({r.count})</span>
                      </div>
                    </div>
                    <div style={{ height: 8, borderRadius: 999, background: 'var(--color-gray-100)', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.25 + i * 0.08, duration: 0.8, ease: 'easeOut' }}
                        style={{ height: '100%', background: color, borderRadius: 999 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontStyle: 'italic' }}>
              {stats ? 'Sin perfiles registrados' : 'Cargando…'}
            </div>
          )}
        </motion.div>

        {/* Zone comparison — real data */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)' }}
        >
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)', marginBottom: 16 }}>
            Alertas por zona
          </div>
          {stats && stats.zonaStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.zonaStats} layout="vertical" margin={{ left: 16, right: 16, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2ddd6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fontFamily: 'var(--font-mono)' }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 11, fontFamily: 'var(--font-body)' }} />
                <Tooltip
                  contentStyle={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', borderRadius: 8, border: '1px solid #e2ddd6' }}
                  formatter={(v) => [v ?? 0, 'Alertas']}
                />
                <Bar dataKey="alerts" radius={[0, 4, 4, 0]}>
                  {stats.zonaStats.map((_entry, i) => (
                    <Cell key={i} fill={ZONE_COLORS[i % ZONE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontStyle: 'italic' }}>
              {stats ? 'Sin alertas registradas' : 'Cargando…'}
            </div>
          )}
        </motion.div>
      </div>

      {/* Weekly trend — real data */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
        style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)', marginBottom: 20 }}
      >
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)', marginBottom: 4 }}>
          Reportes por día de la semana
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-tertiary)', marginBottom: 16 }}>
          Anónimos (azul) vs. Con acompañamiento (verde) · Total histórico
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stats?.weeklyReportes ?? []} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2ddd6" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: 'var(--font-body)' }} />
            <YAxis tick={{ fontSize: 11, fontFamily: 'var(--font-mono)' }} allowDecimals={false} />
            <Tooltip contentStyle={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', borderRadius: 8, border: '1px solid #e2ddd6' }} />
            <Bar dataKey="privado" name="Anónimos"          fill="#5b81a8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="legal"   name="Con acompañamiento" fill="#6b7f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Tácticas más reportadas — real */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Target size={15} color="var(--color-text-secondary)" />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
            Tácticas más reportadas
          </div>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-tertiary)', marginBottom: 16 }}>
          Frecuencia de cada táctica en el total de reportes recibidos
        </p>
        {stats && stats.tacticaStats.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.tacticaStats.map((t) => ({ ...t, label: TACTICA_LABELS[t.tactica] ?? t.tactica }))} layout="vertical" margin={{ left: 8, right: 24, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2ddd6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fontFamily: 'var(--font-mono)' }} allowDecimals={false} />
              <YAxis dataKey="label" type="category" width={148} tick={{ fontSize: 11, fontFamily: 'var(--font-body)' }} />
              <Tooltip
                contentStyle={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', borderRadius: 8, border: '1px solid #e2ddd6' }}
                formatter={(v) => [v, 'reportes']}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {stats.tacticaStats.map((_t, i) => (
                  <Cell key={i} fill={ZONE_COLORS[i % ZONE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontStyle: 'italic' }}>
            {stats ? 'Sin reportes registrados' : 'Cargando…'}
          </div>
        )}
      </motion.div>
    </div>
  );
}
