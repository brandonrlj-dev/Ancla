'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Heart, Users, Search, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import NayaritMap from '@/components/viz/NayaritMap';
import { kpis, weeklyTrend, alertRows } from '@/lib/mock-data';
import { getDashboardData } from '@/actions/policia';
import { type DashboardData, type ReporteRow } from '@/lib/policia-types';
import { createClient } from '@/lib/supabase/client';

const urgencyColors: Record<string, string> = {
  critica: '#ef4444',
  alta:    '#f97316',
  media:   '#eab308',
  baja:    '#22c55e',
};

function deriveUrgency(r: ReporteRow) {
  if (r.patrones.includes('amenaza_difusion')) return 'critica';
  if (r.patrones.length >= 2) return 'alta';
  if (r.patrones.length === 1) return 'media';
  return 'baja';
}

function deriveSummary(r: ReporteRow) {
  const tipoMap: Record<string, string> = { sextorsion: 'Sextorsión', grooming: 'Grooming', acoso: 'Acoso digital' };
  const tipo = tipoMap[r.tipo] ?? r.tipo;
  return `${tipo} vía ${r.plataforma}`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function PCDashboard() {
  const router   = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  useEffect(() => {
    getDashboardData().then(setDashboard);
  }, []);

  // Realtime: refetch on new reports
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('dashboard-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reportes_directos' }, () => {
        getDashboardData().then(setDashboard);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div style={{ padding: isMobile ? '24px 16px' : '32px 32px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Page title */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Panel de operaciones
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-text-tertiary)', marginTop: 2 }}>
          Actualizado hace 3 minutos · {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Alertas activas',        value: kpis.activeAlerts,                      trend: kpis.weeklyChange.alerts,    up: true,  icon: AlertTriangle, color: '#bf6b4a', href: '/policia/alertas' },
          { label: 'Agresores identificados', value: kpis.aggressorsIdentified,              trend: kpis.weeklyChange.aggressors,up: true,  icon: Users,         color: '#9e4a28', href: '#' },
          { label: 'Reportes directos',       value: dashboard?.totalReportes    ?? '—',     trend: kpis.weeklyChange.reports,   up: true,  icon: Heart,         color: '#6b7f5e', href: '/policia/reportes' },
          { label: 'En revisión',             value: dashboard?.reportesEnRevision ?? '—',   trend: kpis.weeklyChange.cases,     up: false, icon: Search,        color: '#5b81a8', href: '/policia/reportes' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)', cursor: 'pointer' }}
            onClick={() => kpi.href !== '#' && router.push(kpi.href)}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${kpi.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <kpi.icon size={18} color={kpi.color} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 999, background: kpi.up ? '#dcfce7' : '#fef9c3', border: `1px solid ${kpi.up ? '#bbf7d0' : '#fef08a'}` }}>
                {kpi.up ? <TrendingUp size={12} color="#16a34a" /> : <TrendingDown size={12} color="#ca8a04" />}
                <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: kpi.up ? '#16a34a' : '#ca8a04' }}>
                  {typeof kpi.trend === 'number' && kpi.trend > 0 ? '+' : ''}{kpi.trend}
                </span>
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1 }}>
              {kpi.value}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: 6 }}>
              {kpi.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Map + feed — 2 cols desktop */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.1fr', gap: 20, marginBottom: 28 }}>
        {/* Nayarit map */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)', marginBottom: 16 }}>
            Distribución geográfica
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <NayaritMap size={240} />
          </div>
        </motion.div>

        {/* Mixed feed */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
              Actividad reciente
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'var(--color-terra-500)', fontFamily: 'var(--font-body)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-terra-500)' }} />Alerta
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'var(--color-sage-500)', fontFamily: 'var(--font-body)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-sage-500)' }} />Reporte
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Real direct reports feed */}
            {dashboard?.recentReportes.map((rep, i) => {
              const urg = deriveUrgency(rep);
              const color = urgencyColors[urg];
              return (
                <motion.div key={rep.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.07 }}
                  onClick={() => router.push('/policia/reportes')}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', borderLeft: `3px solid var(--color-sage-500)`, background: 'var(--color-sage-50)', transition: 'filter 150ms' }}
                  onMouseEnter={(e) => { (e.currentTarget.style.filter = 'brightness(0.97)'); }}
                  onMouseLeave={(e) => { (e.currentTarget.style.filter = 'none'); }}
                >
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>{rep.folio}</span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {deriveSummary(rep)}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-body)' }}>
                      Canal ANCLA · {timeAgo(rep.createdAt)}
                    </div>
                  </div>
                  <ArrowRight size={14} color="var(--color-text-tertiary)" />
                </motion.div>
              );
            })}
            {/* Mock alerts below real reports */}
            {alertRows.slice(0, 2).map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + ((dashboard?.recentReportes.length ?? 0) + i) * 0.07 }}
                onClick={() => router.push(`/policia/alerta/${item.id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', borderLeft: `3px solid ${urgencyColors[item.urgency] ?? '#999'}`, background: `${urgencyColors[item.urgency] ?? '#999'}08`, transition: 'filter 150ms' }}
                onMouseEnter={(e) => { (e.currentTarget.style.filter = 'brightness(0.97)'); }}
                onMouseLeave={(e) => { (e.currentTarget.style.filter = 'none'); }}
              >
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: urgencyColors[item.urgency] ?? '#999', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>{item.folio}</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.summary}</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-body)' }}>{item.zone} · dato de muestra</div>
                </div>
                <ArrowRight size={14} color="var(--color-text-tertiary)" />
              </motion.div>
            ))}
            {!dashboard && (
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-text-tertiary)', padding: '8px 12px', fontStyle: 'italic' }}>
                Cargando actividad reciente…
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Platform breakdown */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}
        style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)', marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)', marginBottom: 20 }}>
          Plataformas de origen
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {[
            { name: 'Instagram DM', pct: 78, color: '#bf6b4a' },
            { name: 'WhatsApp',     pct: 64, color: '#d4956b' },
            { name: 'TikTok DM',   pct: 52, color: '#c17a5e' },
            { name: 'Discord',      pct: 38, color: '#5b81a8' },
            { name: 'Free Fire',    pct: 31, color: '#7a9e6f' },
            { name: 'Snapchat',     pct: 24, color: '#a8906b' },
          ].map((p) => (
            <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 96, fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-secondary)', flexShrink: 0 }}>
                {p.name}
              </div>
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--color-gray-100)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p.pct}%` }}
                  transition={{ duration: 0.7, delay: 0.55 }}
                  style={{ height: '100%', borderRadius: 4, background: p.color }}
                />
              </div>
              <div style={{ width: 34, fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'right', flexShrink: 0 }}>
                {p.pct}%
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Weekly trend chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)', marginBottom: 20 }}>
          Tendencia semanal — Anónimas vs Directos
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={weeklyTrend}>
            <defs>
              <linearGradient id="anonGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#5b81a8" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#5b81a8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="directGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6b7f5e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6b7f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2ddd6" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: 'var(--font-body)' }} />
            <YAxis tick={{ fontSize: 11, fontFamily: 'var(--font-mono)' }} />
            <Tooltip contentStyle={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', borderRadius: 8, border: '1px solid #e2ddd6' }} />
            <Legend wrapperStyle={{ fontSize: '0.8rem', fontFamily: 'var(--font-body)' }} />
            <Area type="monotone" dataKey="anonymous" name="Anónimas" stroke="#5b81a8" fill="url(#anonGrad)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="direct"    name="Directos" stroke="#6b7f5e" fill="url(#directGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
