'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Scale, ChevronLeft, Zap, Heart, Link2 } from 'lucide-react';
import BridgeWires from '@/components/viz/BridgeWires';
import AnclaLogo from '@/components/brand/AnclaLogo';
import Jumper from '@/components/nav/Jumper';

const YOUTH_CASES = [
  { id: 'ANC-7F4C2', platform: 'Instagram', risk: 'Crítico', date: '1 may' },
  { id: 'ANC-7A3B1', platform: 'WhatsApp',  risk: 'Alto',    date: '30 abr' },
  { id: 'ANC-7D9E4', platform: 'TikTok',    risk: 'Alto',    date: '29 abr' },
  { id: 'ANC-7C2D7', platform: 'Discord',   risk: 'Medio',   date: '28 abr' },
  { id: 'ANC-7B6F8', platform: 'Free Fire', risk: 'Medio',   date: '27 abr' },
] as const;

const POLICE_CASES = [
  { id: 'A-7F4C2', status: 'En investigación', assigned: 'Agente Ruiz',   date: '1 may' },
  { id: 'A-7A3B1', status: 'Análisis forense',  assigned: 'Agente Torres', date: '30 abr' },
  { id: 'A-7D9E4', status: 'Pendiente',         assigned: 'Sin asignar',   date: '29 abr' },
  { id: 'A-7C2D7', status: 'En revisión',        assigned: 'Agente Mora',   date: '28 abr' },
  { id: 'A-7B6F8', status: 'Cerrado',           assigned: 'Agente Ruiz',   date: '27 abr' },
] as const;

const CONNECTIONS = [
  {
    id: 'auto',
    icon: Zap,
    color: '#5b81a8',
    title: 'Automático',
    desc: 'La IA detecta patrones de riesgo y genera una alerta cifrada sin intervención humana.',
  },
  {
    id: 'consent',
    icon: Heart,
    color: '#6b7f5e',
    title: 'Consentimiento',
    desc: 'El joven decide compartir su reporte con autoridades. Nada se envía sin su aprobación.',
  },
  {
    id: 'link',
    icon: Link2,
    color: '#bf6b4a',
    title: 'Vinculación',
    desc: 'Un algoritmo empareja alertas automáticas con reportes directos del mismo caso.',
  },
] as const;

const RISK_COLOR: Record<string, string> = {
  Crítico: '#bf6b4a',
  Alto:    '#d4956b',
  Medio:   '#8faa82',
};

export default function PuentePage() {
  const router      = useRouter();
  const isMobile    = useMediaQuery('(max-width: 900px)');
  const [connIdx, setConnIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setConnIdx((i) => (i + 1) % CONNECTIONS.length), 3200);
    return () => clearInterval(t);
  }, []);

  const conn = CONNECTIONS[connIdx];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3ef', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ background: '#1a2533', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <button
          onClick={() => router.push('/joven')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8aaac4', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: '0.78rem', padding: 0 }}
        >
          <ChevronLeft size={14} /> Volver
        </button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#8aaac4', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            <Scale size={11} /> Vista para jueces
          </span>
        </div>
        <AnclaLogo size="sm" color="#dce8f0" />
      </div>

      {/* Title */}
      <div style={{ padding: isMobile ? '24px 20px 16px' : '32px 48px 20px', textAlign: 'center', borderBottom: '1px solid #e5e0d8' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: 600, color: '#2c3e50', lineHeight: 1.3 }}>
          Dos portales que nunca se ven entre sí —{' '}
          <span style={{ color: '#5b81a8' }}>conectados por tres caminos</span>
        </h1>
      </div>

      {/* Main 3-column */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 260px 1fr', gap: 0, minHeight: 0 }}>

        {/* Left — youth cases */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55 }}
          style={{ background: 'white', borderRight: isMobile ? 'none' : '1px solid #e5e0d8', padding: '24px 20px', overflowY: 'auto' }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9ab7a0', marginBottom: 14 }}>
            Portal Joven · casos recientes
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {YOUTH_CASES.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.07 }}
                style={{ padding: '12px 14px', borderRadius: 12, background: '#fafaf8', border: '1px solid #e8e4dc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: '#2c3e50', marginBottom: 3 }}>{c.id}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#8a9aaa' }}>{c.platform} · {c.date}</div>
                </div>
                <div style={{ padding: '3px 9px', borderRadius: 999, background: RISK_COLOR[c.risk] + '22', border: `1px solid ${RISK_COLOR[c.risk]}55`, fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fontWeight: 700, color: RISK_COLOR[c.risk], whiteSpace: 'nowrap' }}>
                  {c.risk}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Center — wires + cycling connection card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.7 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px 16px', background: '#f5f3ef', gap: 20 }}
        >
          {/* Wires SVG */}
          <div style={{ width: '100%', borderRadius: 14, overflow: 'hidden', background: '#1a2533', padding: '10px 0' }}>
            <BridgeWires />
          </div>

          {/* Cycling connection card */}
          <div style={{ width: '100%', minHeight: 120, position: 'relative' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={conn.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                style={{ padding: '16px 18px', borderRadius: 14, background: 'white', border: `1.5px solid ${conn.color}44`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: conn.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <conn.icon size={14} color={conn.color} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 600, color: '#2c3e50' }}>{conn.title}</span>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#6a7c8e', lineHeight: 1.6 }}>{conn.desc}</p>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10 }}>
              {CONNECTIONS.map((_, i) => (
                <button key={i} onClick={() => setConnIdx(i)}
                  style={{ width: i === connIdx ? 16 : 6, height: 6, borderRadius: 3, background: i === connIdx ? CONNECTIONS[i].color : '#ccc', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 250ms' }} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right — police cases */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55 }}
          style={{ background: '#2c3e50', borderLeft: isMobile ? 'none' : '1px solid #1a2533', padding: '24px 20px', overflowY: 'auto' }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4d7a9e', marginBottom: 14 }}>
            Portal Policía · casos vinculados
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {POLICE_CASES.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.07 }}
                style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: '#9ab7d5', marginBottom: 3 }}>{c.id}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#4d7a9e' }}>{c.assigned} · {c.date}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: '#6889a8', whiteSpace: 'nowrap', textAlign: 'right' }}>
                  {c.status}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ background: '#1a2533', padding: '14px 32px', display: 'flex', gap: isMobile ? 20 : 48, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}
      >
        {[
          { value: '0',   label: 'datos personales expuestos',  note: 'por diseño' },
          { value: '~4s', label: 'tiempo de vinculación',       note: 'promedio' },
          { value: '38%', label: 'de alertas con reporte directo', note: 'correlación' },
        ].map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 700, color: '#dce8f0' }}>{s.value}</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#6889a8' }}>{s.label}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#3d5e81' }}>({s.note})</span>
          </div>
        ))}
      </motion.div>

      <Jumper />
    </div>
  );
}
