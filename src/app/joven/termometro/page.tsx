'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import ThermOrb from '@/components/viz/ThermOrb';
import AnclaLogo from '@/components/brand/AnclaLogo';
import { ChevronLeft } from 'lucide-react';

const STATES = [
  { id: 0, label: 'Tranquilo/a',    intensity: 1, color: '#87B383' },
  { id: 1, label: 'Preocupado/a',   intensity: 2, color: '#A7C7E7' },
  { id: 2, label: 'Nervioso/a',     intensity: 3, color: '#5C8AB3' },
  { id: 3, label: 'Muy asustado/a', intensity: 4, color: '#E0B5A2' },
  { id: 4, label: 'En pánico',      intensity: 5, color: '#C17A5E' },
] as const;

export default function TermometroPage() {
  const router    = useRouter();
  const isMobile  = useMediaQuery('(max-width: 768px)');
  const [picked, setPicked] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  function handlePick(s: typeof STATES[number]) {
    setPicked(s.id);
    setTimeout(() => {
      if (s.id <= 1) router.push('/joven/modo');
      else router.push('/joven/respiracion');
    }, 500);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F5F2EE' }}>

      {/* Top bar — 3-column grid matching original */}
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
            fontSize: isMobile ? '0.7rem' : '0.75rem',
            letterSpacing: '0.08em', textTransform: 'uppercase', padding: 0,
          }}
        >
          <ChevronLeft size={14} /> Atrás
        </button>

        <AnclaLogo size="sm" color="#2C2C2A" />

        <div /> {/* right slot empty — Jumper is global */}
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        maxWidth: 1100,
        width: '100%',
        margin: '0 auto',
        padding: isMobile ? '24px 18px 40px' : '40px 40px 60px',
      }}>

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            textAlign: 'center',
            marginBottom: 16,
            fontFamily: 'var(--font-body)',
            fontSize: '0.68rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#8B8780',
          }}
        >
          Paso 1 — Cómo te sientes
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.5 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: isMobile ? 28 : 'clamp(40px, 4.2vw, 56px)',
            fontWeight: 600,
            textAlign: 'center',
            color: '#2C2C2A',
            lineHeight: isMobile ? 1.2 : 1.15,
            margin: '0 0 12px',
          }}
        >
          ¿Cómo estás en este momento?
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18, duration: 0.5 }}
          style={{
            textAlign: 'center',
            color: '#57544E',
            fontSize: isMobile ? 15 : 17,
            fontFamily: 'var(--font-body)',
            marginBottom: isMobile ? 28 : 64,
            margin: `0 auto ${isMobile ? 28 : 64}px`,
            maxWidth: 560,
          }}
        >
          No hay respuesta correcta. Toca la que más se parece a lo que sientes ahora.
        </motion.p>

        {/* Scale */}
        <div style={{ position: 'relative' }}>

          {/* Gradient line — desktop only */}
          {!isMobile && (
            <div style={{
              position: 'absolute',
              top: 78,
              left: '8%',
              right: '8%',
              height: 2,
              background: 'linear-gradient(to right, #87B383 0%, #A7C7E7 35%, #5C8AB3 60%, #E0B5A2 85%, #C17A5E 100%)',
              opacity: 0.5,
              zIndex: 0,
              pointerEvents: 'none',
            }} />
          )}

          {/* Cards grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(5, 1fr)',
            gap: isMobile ? 10 : 18,
            position: 'relative',
            zIndex: 1,
          }}>
            {STATES.map((s, i) => {
              const isSelected = picked === s.id;
              const isHovered  = hovered === s.id;
              const isActive   = isSelected || isHovered;

              return (
                <motion.button
                  key={s.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.06, duration: 0.4 }}
                  onClick={() => handlePick(s)}
                  onMouseEnter={() => setHovered(s.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'row' : 'column',
                    alignItems: 'center',
                    gap: 18,
                    padding: isMobile ? '16px 18px' : '28px 18px',
                    background: '#FBF9F5',
                    border: `1.5px solid ${isActive ? s.color : 'transparent'}`,
                    borderRadius: 22,
                    cursor: 'pointer',
                    textAlign: isMobile ? 'left' : 'center',
                    color: s.color,
                    transition: 'border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease',
                    transform: isActive ? 'translateY(-4px)' : 'none',
                    boxShadow: isActive
                      ? '0 2px 6px rgba(44,44,42,0.05), 0 12px 30px rgba(44,44,42,0.06)'
                      : '0 1px 2px rgba(44,44,42,0.04)',
                    zIndex: isActive ? 2 : 1,
                    minHeight: isMobile ? 72 : 'auto',
                  }}
                >
                  <ThermOrb
                    intensity={s.intensity as 1|2|3|4|5}
                    color={s.color}
                    active={isActive}
                    size={isMobile ? 48 : 70}
                  />
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: isMobile ? 17 : 18,
                      fontStyle: 'italic',
                      color: '#2C2C2A',
                      lineHeight: 1.3,
                    }}
                  >
                    {s.label}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
