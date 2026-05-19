'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { AnaState } from '@/lib/store';

interface AnaAvatarProps {
  state: AnaState;
  size?: number;
  className?: string;
}

const stateConfig = {
  listening: {
    bg:     'var(--color-calm-300)',
    inner:  'var(--color-calm-100)',
    glow:   'var(--color-calm-400)',
    border: 'var(--color-calm-500)',
    label:  'Escuchando',
  },
  talking: {
    bg:     'var(--color-sage-300)',
    inner:  'var(--color-sage-100)',
    glow:   'var(--color-sage-400)',
    border: 'var(--color-sage-600, #4a6148)',
    label:  'Hablando',
  },
  validating: {
    bg:     'var(--color-peach-300)',
    inner:  'var(--color-peach-100)',
    glow:   'var(--color-peach-400)',
    border: 'var(--color-peach-500)',
    label:  'Validando',
  },
  critical: {
    bg:     'var(--color-sage-200)',
    inner:  'var(--color-sage-50)',
    glow:   'transparent',
    border: 'var(--color-sage-300)',
    label:  'Procesando',
  },
};

const blobShapes: Record<AnaState, string[]> = {
  listening: [
    '60% 40% 30% 70% / 60% 30% 70% 40%',
    '50% 50% 40% 60% / 40% 60% 50% 50%',
    '60% 40% 30% 70% / 60% 30% 70% 40%',
  ],
  talking: [
    '60% 40% 30% 70% / 60% 30% 70% 40%',
    '30% 60% 70% 40% / 50% 60% 30% 60%',
    '50% 50% 60% 40% / 40% 50% 60% 50%',
    '40% 60% 40% 60% / 60% 40% 60% 40%',
    '60% 40% 30% 70% / 60% 30% 70% 40%',
  ],
  validating: [
    '55% 45% 50% 50% / 55% 45% 55% 45%',
    '45% 55% 55% 45% / 45% 55% 45% 55%',
    '55% 45% 50% 50% / 55% 45% 55% 45%',
  ],
  critical: [
    '48% 52% 52% 48% / 50% 50% 50% 50%',
    '44% 56% 50% 50% / 48% 52% 50% 50%',
    '48% 52% 52% 48% / 50% 50% 50% 50%',
  ],
};

export default function AnaAvatar({ state, size = 120, className }: AnaAvatarProps) {
  const config = stateConfig[state];
  const shapes = blobShapes[state];
  const [shapeIdx, setShapeIdx] = useState(0);

  useEffect(() => {
    if (state !== 'talking') { setShapeIdx(0); return; }
    const iv = setInterval(() => setShapeIdx((i) => (i + 1) % (shapes.length - 1)), 3400);
    return () => clearInterval(iv);
  }, [state, shapes.length]);

  /* Scale values per state */
  const scaleValues: number | number[] =
    state === 'listening' ? [0.96, 1.02, 0.96] :
    state === 'critical'  ? 0.92 :
    1;

  const scaleDuration =
    state === 'listening' ? 4.5 : undefined;

  return (
    <div
      className={className}
      style={{ position: 'relative', width: size, height: size }}
      role="img"
      aria-label={`ANA — ${config.label}`}
    >
      {/* External halo for validating */}
      <AnimatePresence>
        {state === 'validating' && (
          <motion.div
            key="halo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.4, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: -size * 0.18,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${config.glow} 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Ripple rings for talking — 2 staggered, 2.4s */}
      <AnimatePresence>
        {state === 'talking' &&
          [0, 1].map((ri) => (
            <motion.div
              key={`ripple-${ri}`}
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.9, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.4, repeat: Infinity, delay: ri * 1.2, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: `2px solid ${config.glow}`,
                pointerEvents: 'none',
              }}
            />
          ))}
      </AnimatePresence>

      {/* Main blob */}
      <motion.div
        animate={{
          borderRadius: shapes[shapeIdx],
          backgroundColor: config.bg,
          scale: scaleValues,
        }}
        transition={{
          borderRadius: { duration: state === 'talking' ? 0.8 : 0.6, ease: 'easeInOut' },
          backgroundColor: { duration: 0.5 },
          scale: scaleDuration
            ? { duration: scaleDuration, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.4 },
        }}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: shapes[0],
          backgroundColor: config.bg,
          boxShadow: state !== 'critical' ? `0 8px 32px ${config.glow}55` : 'none',
          border: state === 'critical' ? `2px solid ${config.border}` : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <motion.div
          animate={{ borderRadius: shapes[shapeIdx] }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{
            width: '60%',
            height: '60%',
            borderRadius: shapes[0],
            backgroundColor: config.inner,
            opacity: state === 'critical' ? 0.5 : 0.7,
          }}
        />
      </motion.div>

      {/* ANA initials overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: size * 0.22,
          fontWeight: 600,
          color: config.border,
          pointerEvents: 'none',
          letterSpacing: '0.05em',
        }}
      >
        ANA
      </div>
    </div>
  );
}
