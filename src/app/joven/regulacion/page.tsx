'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import AnclaLogo from '@/components/brand/AnclaLogo';
import { ChevronLeft, ArrowRight } from 'lucide-react';

/* ── Methods data (from original design) ── */
const METHODS = [
  {
    name: 'Respiración 4-4-4',
    desc: 'Inhala 4, retén 4, exhala 4. Activa el sistema parasimpático en menos de un minuto.',
    time: '3 MIN',
    href: '/joven/respiracion',
    color: '#5b81a8',
  },
  {
    name: '5-4-3-2-1 Grounding',
    desc: 'Nombra 5 cosas que ves, 4 que tocas, 3 que oyes, 2 que hueles, 1 que saboreas. Te trae al presente.',
    time: '4 MIN',
    href: null,
    color: '#6b7f5e',
  },
  {
    name: 'Visualización guiada',
    desc: 'Imagina un lugar seguro con todos los detalles posibles. Tu cerebro responde como si estuvieras ahí.',
    time: '8 MIN',
    href: null,
    color: '#c4a882',
  },
  {
    name: 'Relajación muscular progresiva',
    desc: 'Tensa y relaja cada grupo muscular. Libera la tensión que el cuerpo guarda sin que lo notes.',
    time: '10 MIN',
    href: null,
    color: '#bf6b4a',
  },
  {
    name: 'Escritura expresiva',
    desc: 'Escribe sin filtros durante 8 minutos. Estudios muestran reducción real de ansiedad después de 4 sesiones.',
    time: '8 MIN',
    href: null,
    color: '#a07090',
  },
];

/* ── Blob animation configs ── */
const BLOB_FRAMES = [
  ['60% 40% 40% 60% / 60% 60% 40% 40%', '40% 60% 70% 30% / 30% 60% 40% 70%', '50% 50% 60% 40% / 50% 40% 60% 50%'],
  ['40% 60% 30% 70% / 70% 30% 70% 30%', '60% 40% 50% 50% / 40% 60% 50% 50%', '50% 50% 40% 60% / 60% 50% 40% 60%'],
  ['55% 45% 65% 35% / 45% 55% 35% 65%', '35% 65% 45% 55% / 65% 35% 55% 45%', '50% 50% 55% 45% / 50% 55% 45% 50%'],
  ['70% 30% 40% 60% / 30% 70% 60% 40%', '50% 50% 60% 40% / 60% 40% 50% 50%', '40% 60% 50% 50% / 50% 50% 60% 40%'],
  ['45% 55% 55% 45% / 55% 45% 55% 45%', '60% 40% 40% 60% / 40% 60% 60% 40%', '50% 50% 50% 50% / 55% 45% 45% 55%'],
];
const DURATIONS = [9.2, 8.4, 10.1, 8.8, 9.6];
const ROTATIONS = [2, -2, 1.5, -1.5, 2];

/* ── Blob orb (extracted from WaterDropOrb, size 80px) ── */
function BlobOrb({ color, idx }: { color: string; idx: number }) {
  const frames = BLOB_FRAMES[idx];
  const dur    = DURATIONS[idx];
  const rot    = ROTATIONS[idx];

  return (
    <motion.div
      animate={{
        borderRadius: frames,
        rotate: [0, rot, 0, -rot, 0],
      }}
      transition={{
        borderRadius: { duration: dur, repeat: Infinity, ease: 'easeInOut' },
        rotate:       { duration: dur * 1.3, repeat: Infinity, ease: 'easeInOut' },
      }}
      style={{
        width: 80,
        height: 80,
        borderRadius: frames[0],
        background: `radial-gradient(ellipse at 35% 30%, ${color}cc 0%, ${color} 60%, ${color}dd 100%)`,
        boxShadow: `0 8px 28px ${color}44, inset 0 -6px 14px rgba(0,0,0,0.12), inset 0 6px 12px rgba(255,255,255,0.28)`,
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        opacity: 0.9,
      }}
    >
      {/* Drifting highlight */}
      <motion.div
        animate={{ x: [-10, 4, -10], y: [-8, 4, -8] }}
        transition={{ duration: dur * 0.7, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: 12, left: 14,
          width: 28, height: 16,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.45)',
          transform: 'rotate(-30deg)',
          pointerEvents: 'none',
        }}
      />
    </motion.div>
  );
}

export default function RegulacionPage() {
  const router   = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F5F2EE' }}>

      {/* Top bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        padding: isMobile ? '14px 18px' : '16px 32px',
        borderBottom: '1px solid rgba(44,44,42,0.08)',
        background: 'rgba(245,242,238,0.92)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#8B8780', fontFamily: 'var(--font-body)',
            fontSize: '0.7rem', letterSpacing: '0.08em',
            textTransform: 'uppercase', padding: 0,
          }}
        >
          <ChevronLeft size={14} /> Atrás
        </button>
        <AnclaLogo size="sm" color="#2C2C2A" />
        <div />
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        maxWidth: 1200,
        width: '100%',
        margin: '0 auto',
        padding: isMobile ? '28px 18px 48px' : '50px 60px 80px',
      }}>

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.68rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#8B8780',
            marginBottom: 10,
          }}
        >
          Basados en investigación científica
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: isMobile ? '1.9rem' : 'clamp(36px, 3.6vw, 48px)',
            fontWeight: 600,
            color: '#2C2C2A',
            margin: '0 0 10px',
          }}
        >
          Métodos para calmarte
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12 }}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: isMobile ? 15 : 17,
            color: '#57544E',
            marginBottom: 36,
          }}
        >
          Elige el que más te ayude. Puedes practicar cuantas veces necesites.
        </motion.p>

        {/* Cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 22,
        }}>
          {METHODS.map((m, i) => {
            const isHovered = hovered === i;
            return (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.07, duration: 0.45 }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => m.href && router.push(m.href)}
                style={{
                  background: '#FBF9F5',
                  borderRadius: 22,
                  border: '1px solid rgba(44,44,42,0.07)',
                  padding: 28,
                  cursor: m.href ? 'pointer' : 'default',
                  transition: 'transform 250ms ease, box-shadow 250ms ease',
                  transform: isHovered ? 'translateY(-3px)' : 'none',
                  boxShadow: isHovered
                    ? '0 2px 6px rgba(44,44,42,0.05), 0 12px 30px rgba(44,44,42,0.08)'
                    : '0 1px 3px rgba(44,44,42,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0,
                }}
              >
                {/* Blob orb */}
                <div style={{ marginBottom: 18 }}>
                  <BlobOrb color={m.color} idx={i} />
                </div>

                {/* Title */}
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 22,
                  fontWeight: 500,
                  color: '#2C2C2A',
                  margin: '0 0 8px',
                  lineHeight: 1.25,
                }}>
                  {m.name}
                </h3>

                {/* Description */}
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 14.5,
                  color: '#6a6560',
                  lineHeight: 1.6,
                  margin: '0 0 18px',
                  flex: 1,
                }}>
                  {m.desc}
                </p>

                {/* Meta row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#8B8780',
                  }}>
                    {m.time}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); m.href && router.push(m.href); }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '8px 16px',
                      borderRadius: 999,
                      border: '1px solid rgba(44,44,42,0.18)',
                      background: 'transparent',
                      cursor: m.href ? 'pointer' : 'default',
                      fontFamily: 'var(--font-body)',
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#2C2C2A',
                      transition: 'background 200ms ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(44,44,42,0.05)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    Practicar <ArrowRight size={13} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Crisis note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          style={{
            marginTop: 36,
            padding: '16px 20px',
            borderRadius: 16,
            background: 'rgba(167,199,231,0.12)',
            border: '1px solid rgba(167,199,231,0.35)',
            maxWidth: 540,
          }}
        >
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            color: '#57544E',
            lineHeight: 1.65,
            margin: 0,
          }}>
            Si en este momento te sientes en crisis o no puedes usar estas herramientas,{' '}
            <button
              onClick={() => router.push('/joven/chat')}
              style={{
                color: '#5b81a8', fontWeight: 600,
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 'inherit',
                textDecoration: 'underline', textUnderlineOffset: 3, padding: 0,
              }}
            >
              habla con ANA ahora
            </button>
            .
          </p>
        </motion.div>
      </div>
    </div>
  );
}
