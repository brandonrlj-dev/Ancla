'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Scale, Heart, Shield, AlertTriangle, Users, Search, ArrowRight, ChevronLeft } from 'lucide-react';
import BridgeWires from '@/components/viz/BridgeWires';
import AnclaLogo from '@/components/brand/AnclaLogo';
import Jumper from '@/components/nav/Jumper';
import { kpis } from '@/lib/mock-data';

const YOUTH_SECTIONS = [
  { label: 'Bienvenida', href: '/joven', desc: 'Punto de entrada para jóvenes' },
  { label: 'Termómetro emocional', href: '/joven/termometro', desc: 'Evaluación de estado emocional' },
  { label: 'Chat con ANA', href: '/joven/chat', desc: 'Asistente de IA confidencial' },
  { label: 'Modo silencioso', href: '/joven/silencioso', desc: 'Calculadora de cobertura' },
  { label: 'Regulación emocional', href: '/joven/regulacion', desc: 'Técnicas de gestión emocional' },
  { label: 'Respiración guiada', href: '/joven/respiracion', desc: 'Ejercicio de 4-4-4' },
];

const POLICE_SECTIONS = [
  { label: 'Panel de operaciones', href: '/policia', desc: 'Dashboard con KPIs y mapa' },
  { label: 'Alertas activas', href: '/policia/alertas', desc: `${kpis.activeAlerts} casos en monitoreo` },
  { label: 'Reportes directos', href: '/policia/reportes', desc: `${kpis.directReports} reportes nuevos` },
  { label: 'Estadísticas', href: '/policia/estadisticas', desc: 'Embudo, heatmap y zonas' },
];

const bridgeKpis = [
  { icon: AlertTriangle, label: 'Alertas activas', value: kpis.activeAlerts, color: '#bf6b4a' },
  { icon: Users,        label: 'Agresores ID',     value: kpis.aggressorsIdentified, color: '#9e4a28' },
  { icon: Heart,        label: 'Reportes directos', value: kpis.directReports, color: '#6b7f5e' },
  { icon: Search,       label: 'En revisión',       value: kpis.casesUnderReview, color: '#5b81a8' },
];

export default function PuentePage() {
  const router   = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3ef', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ background: '#1a2533', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={() => router.push('/joven')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8aaac4', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: '0.78rem', padding: 0 }}
        >
          <ChevronLeft size={14} /> Volver
        </button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <Scale size={16} color="#8aaac4" />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: '#dce8f0' }}>
            Vista para jueces y autoridades
          </span>
        </div>
        <AnclaLogo size="sm" color="#dce8f0" />
      </div>

      {/* Main 3-column layout */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '280px 1fr 280px',
        gap: 0,
        minHeight: 0,
      }}>
        {/* Left — youth portal (warm) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            background: 'white',
            borderRight: '1px solid #e5e0d8',
            padding: '28px 20px',
            overflowY: 'auto',
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Heart size={16} color="var(--color-sage-500)" />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                Portal Joven
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
              Interfaz accesible para adolescentes. Tono empático, sin tecnicismos. WCAG 2.1 AA.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {YOUTH_SECTIONS.map((s, i) => (
              <motion.button
                key={s.href}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                onClick={() => router.push(s.href)}
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 10,
                  background: 'var(--color-sage-50)', border: '1px solid var(--color-sage-100)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                  transition: 'all 150ms',
                }}
                onMouseEnter={(e) => { (e.currentTarget.style.background = 'var(--color-sage-100)'); }}
                onMouseLeave={(e) => { (e.currentTarget.style.background = 'var(--color-sage-50)'); }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 500, color: 'var(--color-sage-700)', marginBottom: 1 }}>
                    {s.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>
                    {s.desc}
                  </div>
                </div>
                <ArrowRight size={13} color="var(--color-sage-400)" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Center — bridge wires + info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '32px 20px' : '40px 32px',
            background: '#f5f3ef',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Watermark */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', opacity: 0.04 }}>
            <Scale size={200} color="#2c3e50" />
          </div>

          <div style={{ position: 'relative', width: '100%', maxWidth: 560 }}>
            {/* Section label */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, background: 'white', boxShadow: '0 1px 6px rgba(0,0,0,0.08)', border: '1px solid #e5e0d8', fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                <Scale size={12} />
                Puente de datos ANCLA — tiempo real
              </span>
            </div>

            {/* SVG wires */}
            <div style={{ width: '100%', aspectRatio: '2.1 / 1', borderRadius: 16, overflow: 'hidden', background: '#1a2533', padding: '12px 0' }}>
              <BridgeWires />
            </div>

            {/* Legend text */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 20, textAlign: 'center' }}>
              {[
                { color: '#5b81a8', label: 'Alertas automáticas', desc: 'Detección por IA sin intervención' },
                { color: '#6b7f5e', label: 'Consentimiento', desc: 'Reportes voluntarios de jóvenes' },
                { color: '#bf6b4a', label: 'Vinculación', desc: 'Conexión alerta ↔ reporte' },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                      {item.label}
                    </span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: 'var(--color-text-tertiary)', lineHeight: 1.4 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Explanation block */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{ marginTop: 28, padding: '18px 20px', borderRadius: 14, background: 'white', border: '1px solid #e5e0d8', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}
            >
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>
                Cómo funciona ANCLA
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                El sistema detecta patrones de grooming digital a través del chat ANA y el termómetro emocional.
                Cuando se supera el umbral de riesgo, se genera una alerta automática cifrada que solo puede
                leer la Policía Cibernética de Nayarit. Los reportes directos de jóvenes llegan por un canal
                separado, protegido y anónimo. Este panel ofrece visibilidad simultánea de ambos flujos.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Right — police portal (dark) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            background: '#2c3e50',
            borderLeft: '1px solid #1a2533',
            padding: '28px 20px',
            overflowY: 'auto',
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Shield size={16} color="#9ab7d5" />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem', color: '#dce8f0' }}>
                Portal Policía
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#6889a8', lineHeight: 1.5 }}>
              Acceso restringido para Policía Cibernética. Requiere autenticación institucional + MFA.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
            {POLICE_SECTIONS.map((s, i) => (
              <motion.button
                key={s.href}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                onClick={() => router.push(s.href)}
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                  transition: 'all 150ms',
                }}
                onMouseEnter={(e) => { (e.currentTarget.style.background = 'rgba(255,255,255,0.11)'); }}
                onMouseLeave={(e) => { (e.currentTarget.style.background = 'rgba(255,255,255,0.06)'); }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 500, color: '#9ab7d5', marginBottom: 1 }}>
                    {s.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: '#6889a8' }}>
                    {s.desc}
                  </div>
                </div>
                <ArrowRight size={13} color="#5b81a8" />
              </motion.button>
            ))}
          </div>

          {/* KPI mini cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {bridgeKpis.map((kpi) => (
              <div key={kpi.label} style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <kpi.icon size={14} color={kpi.color} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 700, color: '#dce8f0', lineHeight: 1, marginTop: 6 }}>
                  {kpi.value}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: '#6889a8', marginTop: 3, lineHeight: 1.3 }}>
                  {kpi.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer KPI bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          background: '#1a2533',
          padding: '12px 32px',
          display: 'flex',
          gap: isMobile ? 16 : 40,
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {bridgeKpis.map((kpi) => (
          <div key={kpi.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <kpi.icon size={13} color={kpi.color} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: '#dce8f0' }}>{kpi.value}</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#6889a8' }}>{kpi.label}</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: '#3d5e81' }}>
          Sistema ANCLA · Nayarit · Cifrado E2E · {new Date().getFullYear()}
        </div>
      </motion.div>

      <Jumper />
    </div>
  );
}
