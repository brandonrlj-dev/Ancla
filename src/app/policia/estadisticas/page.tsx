'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import useMediaQuery from '@mui/material/useMediaQuery';
import { BarChart3, TrendingUp, Info } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import ActivityHeatmap from '@/components/viz/ActivityHeatmap';
import { conversionFunnel } from '@/lib/mock-data';
import { getEstadisticas } from '@/actions/policia';
import { type EstadisticasData } from '@/lib/policia-types';

const ZONE_COLORS = ['#bf6b4a', '#f97316', '#eab308', '#6b7f5e', '#5b81a8', '#8b5cf6'];
const funnelColors = ['#2c3e50', '#5b81a8', '#6b7f5e', '#bf6b4a'];

function IllustrativeNote({ label }: { label?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, background: 'var(--color-calm-50)', border: '1px solid var(--color-calm-200)', marginBottom: 14 }}>
      <Info size={12} color="var(--color-calm-500)" />
      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-calm-700)' }}>
        {label ?? 'Visualización ilustrativa — requiere historial acumulado'}
      </span>
    </div>
  );
}

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

      {/* Funnel + zone — 2 cols desktop */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Funnel — illustrative */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <TrendingUp size={15} color="var(--color-text-secondary)" />
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
              Embudo de conversión
            </div>
          </div>
          <IllustrativeNote label="Ilustrativo — las sesiones de chat no se almacenan en servidor" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {conversionFunnel.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{step.label}</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, color: funnelColors[i] }}>{step.value}%</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-text-tertiary)' }}>({step.count.toLocaleString('es-MX')})</span>
                  </div>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: 'var(--color-gray-100)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${step.value}%` }}
                    transition={{ delay: 0.25 + i * 0.08, duration: 0.8, ease: 'easeOut' }}
                    style={{ height: '100%', background: funnelColors[i], borderRadius: 999 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
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

      {/* Activity heatmap — illustrative */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)' }}
      >
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)', marginBottom: 12 }}>
          Mapa de calor — actividad por día y hora
        </div>
        <IllustrativeNote label="Ilustrativo — requiere acumulación de timestamps de contacto del agresor" />
        <ActivityHeatmap />
      </motion.div>
    </div>
  );
}
