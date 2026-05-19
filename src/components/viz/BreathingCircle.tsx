'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/* 4-phase cycle: Inhala 3s | Retén 3s | Exhala 3s | Retén 3s = 12s */
const CYCLE  = 12;
const PHASES = [
  { label: 'Inhala',  duration: 3, color: 'var(--color-calm-500)' },
  { label: 'Retén',   duration: 3, color: 'var(--color-sage-500)'  },
  { label: 'Exhala',  duration: 3, color: 'var(--color-calm-400)'  },
  { label: 'Retén',   duration: 3, color: 'var(--color-sage-400)'  },
];

/* Compute phase from elapsed time */
function getPhase(elapsed: number) {
  const t = elapsed % CYCLE;
  let acc = 0;
  for (let i = 0; i < PHASES.length; i++) {
    acc += PHASES[i].duration;
    if (t < acc) return i;
  }
  return 3;
}

interface BreathingCircleProps {
  size?: number;
  onCycleComplete?: () => void;
}

export default function BreathingCircle({ size = 240, onCycleComplete }: BreathingCircleProps) {
  const [elapsed, setElapsed] = useState(0);
  const [cyclesDone, setCyclesDone] = useState(0);
  const [active, setActive] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const startRef = useRef<number | null>(null);
  const rafRef   = useRef<number>(0);

  const phase    = getPhase(elapsed);
  const phaseObj = PHASES[phase];

  /* Main tick — runs RAF loop when active */
  useEffect(() => {
    if (!active) return;

    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const e = (now - startRef.current) / 1000;
      setElapsed(e);

      const completed = Math.floor(e / CYCLE);
      if (completed > cyclesDone) {
        setCyclesDone(completed);
        onCycleComplete?.();
        if (completed >= 1) setShowButtons(true);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, cyclesDone, onCycleComplete]);

  /* Scale keyframes — 12s cycle */
  const scaleKeys = [1, 1.5, 1.5, 1, 1];
  const times     = [0, 0.25, 0.5, 0.75, 1];

  /* Progress within current phase (0-1) */
  const phaseElapsed = (elapsed % CYCLE) - PHASES.slice(0, phase).reduce((a, p) => a + p.duration, 0);
  const phaseProgress = Math.min(1, phaseElapsed / PHASES[phase].duration);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 32,
        userSelect: 'none',
      }}
    >
      {/* Phase label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.4 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 600,
            color: phaseObj.color,
          }}
        >
          {phaseObj.label}
        </motion.div>
      </AnimatePresence>

      {/* Breathing circles */}
      <div style={{ position: 'relative', width: size, height: size }}>
        {/* Outer ring 1 */}
        <motion.div
          animate={
            active
              ? { scale: scaleKeys, opacity: [0.25, 0.35, 0.25, 0.35, 0.25] }
              : { scale: 1, opacity: 0.2 }
          }
          transition={
            active
              ? { duration: CYCLE, times, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }
              : {}
          }
          style={{
            position: 'absolute',
            inset: -size * 0.12,
            borderRadius: '50%',
            border: `2px solid ${phaseObj.color}`,
            opacity: 0.2,
          }}
        />
        {/* Outer ring 2 */}
        <motion.div
          animate={
            active
              ? { scale: scaleKeys, opacity: [0.15, 0.22, 0.15, 0.22, 0.15] }
              : { scale: 1, opacity: 0.1 }
          }
          transition={
            active
              ? { duration: CYCLE, times, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }
              : {}
          }
          style={{
            position: 'absolute',
            inset: -size * 0.24,
            borderRadius: '50%',
            border: `1.5px solid ${phaseObj.color}`,
            opacity: 0.1,
          }}
        />

        {/* Main circle */}
        <motion.div
          animate={
            active
              ? { scale: scaleKeys, backgroundColor: phaseObj.color }
              : { scale: 1 }
          }
          transition={
            active
              ? { scale: { duration: CYCLE, times, repeat: Infinity, ease: 'easeInOut' }, backgroundColor: { duration: 0.5 } }
              : { backgroundColor: { duration: 0.5 } }
          }
          onClick={() => !active && setActive(true)}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: active ? phaseObj.color : 'var(--color-calm-300)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: active ? 'default' : 'pointer',
            boxShadow: `0 8px 40px ${phaseObj.color}44`,
          }}
        >
          {!active && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'white',
                textAlign: 'center',
              }}
            >
              Toca para{'\n'}empezar
            </motion.span>
          )}
        </motion.div>

        {/* Progress ring */}
        {active && (
          <svg
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={size / 2 - 4}
              fill="none"
              stroke={phaseObj.color}
              strokeWidth="3"
              strokeOpacity="0.25"
            />
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={size / 2 - 4}
              fill="none"
              stroke={phaseObj.color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * (size / 2 - 4)}
              animate={{ strokeDashoffset: 2 * Math.PI * (size / 2 - 4) * (1 - phaseProgress) }}
              style={{ rotate: '-90deg', transformOrigin: `${size / 2}px ${size / 2}px` }}
              transition={{ duration: 0.05 }}
            />
          </svg>
        )}
      </div>

      {/* Cycle counter */}
      {active && (
        <div style={{ display: 'flex', gap: 8 }}>
          {[1, 2, 3].map((n) => (
            <motion.div
              key={n}
              animate={{ backgroundColor: cyclesDone >= n ? 'var(--color-sage-500)' : 'var(--color-gray-200)' }}
              style={{ width: 10, height: 10, borderRadius: '50%' }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      )}

      {/* Post-cycle buttons */}
      <AnimatePresence>
        {showButtons && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}
          >
            <button
              onClick={() => { setActive(false); setElapsed(0); setCyclesDone(0); setShowButtons(false); startRef.current = null; setTimeout(() => setActive(true), 50); }}
              style={{
                background: 'var(--color-calm-500)',
                color: 'white',
                border: 'none',
                borderRadius: 999,
                padding: '10px 28px',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Otro ciclo
            </button>
            <button
              onClick={() => setActive(false)}
              style={{
                background: 'transparent',
                color: 'var(--color-gray-500)',
                border: '1.5px solid var(--color-gray-300)',
                borderRadius: 999,
                padding: '10px 28px',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Listo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
