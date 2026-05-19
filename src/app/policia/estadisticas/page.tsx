'use client';

import { motion } from 'framer-motion';
import useMediaQuery from '@mui/material/useMediaQuery';
import { BarChart3, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import ActivityHeatmap from '@/components/viz/ActivityHeatmap';
import { conversionFunnel, nayaritZones, weeklyTrend } from '@/lib/mock-data';

const ZONE_COLORS = ['#bf6b4a', '#f97316', '#eab308', '#6b7f5e', '#5b81a8', '#8b5cf6'];

const funnelColors = ['#2c3e50', '#5b81a8', '#6b7f5e', '#bf6b4a'];

export default function EstadisticasPage() {
  const isMobile = useMediaQuery('(max-width: 768px)');

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
          Resumen del sistema · Últimos 30 días
        </p>
      </motion.div>

      {/* Conversion funnel + zone bar — 2 cols desktop */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <TrendingUp size={15} color="var(--color-text-secondary)" />
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
              Embudo de conversión
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {conversionFunnel.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    {step.label}
                  </span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, color: funnelColors[i] }}>
                      {step.value}%
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-text-tertiary)' }}>
                      ({step.count.toLocaleString('es-MX')})
                    </span>
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

          {/* Funnel note */}
          <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 10, background: 'var(--color-calm-50)', border: '1px solid var(--color-calm-100)' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-calm-700)', lineHeight: 1.5 }}>
              El 18% de las sesiones generan reportes formales. La tasa de retención en chat ANA es 61%.
            </p>
          </div>
        </motion.div>

        {/* Zone comparison */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)' }}
        >
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)', marginBottom: 16 }}>
            Alertas por zona
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={nayaritZones} layout="vertical" margin={{ left: 16, right: 16, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2ddd6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fontFamily: 'var(--font-mono)' }} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fontFamily: 'var(--font-body)' }} />
              <Tooltip
                contentStyle={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', borderRadius: 8, border: '1px solid #e2ddd6' }}
                formatter={(v) => [v ?? 0, 'Alertas']}
              />
              <Bar dataKey="alerts" radius={[0, 4, 4, 0]}>
                {nayaritZones.map((_entry, i) => (
                  <Cell key={i} fill={ZONE_COLORS[i % ZONE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Weekly trend bars */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
        style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)', marginBottom: 20 }}
      >
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)', marginBottom: 4 }}>
          Reportes semanales — desglose por canal
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-tertiary)', marginBottom: 16 }}>
          Anónimas (azul) vs. Directos a través de canal ANCLA (verde)
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyTrend} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2ddd6" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: 'var(--font-body)' }} />
            <YAxis tick={{ fontSize: 11, fontFamily: 'var(--font-mono)' }} />
            <Tooltip contentStyle={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', borderRadius: 8, border: '1px solid #e2ddd6' }} />
            <Bar dataKey="anonymous" name="Anónimas" fill="#5b81a8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="direct"    name="Directos"  fill="#6b7f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Activity heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)' }}
      >
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)', marginBottom: 4 }}>
          Mapa de calor — actividad por día y hora
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-tertiary)', marginBottom: 16 }}>
          Intensidad de contacto registrada en el sistema. Picos nocturnos y fines de semana son indicadores de riesgo elevado.
        </p>
        <ActivityHeatmap />
      </motion.div>
    </div>
  );
}
