'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import ThermOrb from '@/components/viz/ThermOrb';
import JovenHeader from '@/components/joven/JovenHeader';
import { emotionalStates } from '@/lib/mock-data';
import { useAnclaStore } from '@/lib/store';
import type { EmotionalState } from '@/lib/store';
import { ArrowRight } from 'lucide-react';

/* Background gradient using all 5 state colors */
const gradientH = `linear-gradient(90deg,
  #5b81a8 0%,
  #6b7f5e 25%,
  #c4a882 50%,
  #bf6b4a 75%,
  #9e4a28 100%)`;

const gradientV = `linear-gradient(180deg,
  #5b81a8 0%,
  #6b7f5e 25%,
  #c4a882 50%,
  #bf6b4a 75%,
  #9e4a28 100%)`;

export default function TermometroPage() {
  const router      = useRouter();
  const isMobile    = useMediaQuery('(max-width: 768px)');
  const { setEmotionalState } = useAnclaStore();
  const [selected, setSelected] = useState<EmotionalState | null>(null);

  function handleSelect(id: EmotionalState) {
    setSelected(id);
    setEmotionalState(id);
  }

  function handleContinue() {
    if (selected) router.push('/joven/chat');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <JovenHeader title="¿Cómo te sientes?" />

      {/* Subtle gradient stripe behind orbs */}
      <div
        style={{
          height: isMobile ? '100%' : 6,
          width: isMobile ? 6 : '100%',
          background: isMobile ? gradientV : gradientH,
          opacity: 0.35,
          position: 'absolute',
          top: isMobile ? '56px' : undefined,
          left: isMobile ? 0 : 0,
          right: isMobile ? undefined : 0,
          bottom: isMobile ? 0 : 'auto',
          marginTop: isMobile ? 0 : undefined,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: isMobile ? '24px 20px' : '40px 32px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.95rem',
            color: 'var(--color-text-secondary)',
            marginBottom: isMobile ? 28 : 40,
            maxWidth: 480,
          }}
        >
          Toca el estado que mejor describe cómo te sientes en este momento. No hay respuesta correcta o incorrecta.
        </motion.p>

        {/* 5 ThermOrbs */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 8 : 0,
            flex: isMobile ? 'none' : 1,
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: isMobile ? 'flex-start' : 'space-between',
          }}
        >
          {emotionalStates.map((state, i) => (
            <motion.div
              key={state.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.4, ease: 'easeOut' }}
              style={{
                flex: isMobile ? 'none' : 1,
                display: 'flex',
                flexDirection: isMobile ? 'row' : 'column',
                alignItems: 'center',
                gap: isMobile ? 16 : 16,
                padding: isMobile ? '14px 16px' : '20px 8px',
                borderRadius: 16,
                cursor: 'pointer',
                background: selected === state.id
                  ? `${state.color}18`
                  : 'transparent',
                border: selected === state.id
                  ? `1.5px solid ${state.color}50`
                  : '1.5px solid transparent',
                transition: 'all 250ms ease',
              }}
              onClick={() => handleSelect(state.id as EmotionalState)}
            >
              <ThermOrb
                color={state.color}
                glowColor={state.color}
                size={isMobile ? 56 : 72}
                cadence={state.rippleCadence}
                selected={selected === state.id}
              />
              <div style={{ flex: isMobile ? 1 : 'none', textAlign: isMobile ? 'left' : 'center' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontWeight: selected === state.id ? 600 : 400,
                    fontSize: '0.95rem',
                    color: selected === state.id ? state.color : 'var(--color-text-primary)',
                    transition: 'all 200ms',
                  }}
                >
                  {state.label}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.78rem',
                    color: 'var(--color-text-tertiary)',
                    marginTop: 2,
                  }}
                >
                  {state.description}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Continue button — appears when selected */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.4 }}
              style={{
                marginTop: 32,
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
                Gracias por compartirlo. Estás haciendo algo valiente.
              </p>
              <button
                onClick={handleContinue}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--color-calm-500)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 999,
                  padding: '13px 32px',
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-calm)',
                  transition: 'all 250ms ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget.style.transform = 'translateY(-2px)'); }}
                onMouseLeave={(e) => { (e.currentTarget.style.transform = 'none'); }}
              >
                Hablar con ANA
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => router.push('/joven/respiracion')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-tertiary)',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-body)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                  padding: 0,
                }}
              >
                Primero, un ejercicio de respiración
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
