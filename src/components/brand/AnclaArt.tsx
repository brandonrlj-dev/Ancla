'use client';

import { motion } from 'framer-motion';
import AnclaMark from './AnclaMark';

interface FireflyConfig {
  cx: string;
  cy: string;
  moveDuration: number;
  glowDuration: number;
  moveDelay: number;
  glowDelay: number;
  dx1: number; dy1: number;
  dx2: number; dy2: number;
  dx3: number; dy3: number;
  r: number;
}

/* 8 fireflies — each has a completely independent 2D path and blink */
const fireflies: FireflyConfig[] = [
  { cx: '22%', cy: '38%', moveDuration: 5.8, glowDuration: 11.2, moveDelay: 0,    glowDelay: 0.5,  dx1:  8, dy1: -6, dx2: -4, dy2: 10, dx3: 6,  dy3:  3, r: 4 },
  { cx: '68%', cy: '22%', moveDuration: 6.4, glowDuration: 14.1, moveDelay: 1.3,  glowDelay: 3.2,  dx1: -7, dy1:  8, dx2:  5, dy2: -5, dx3: -3, dy3:  7, r: 3 },
  { cx: '78%', cy: '56%', moveDuration: 5.2, glowDuration:  9.8, moveDelay: 2.7,  glowDelay: 1.1,  dx1:  5, dy1:  7, dx2: -8, dy2: -3, dx3:  4, dy3: -6, r: 3.5 },
  { cx: '15%', cy: '68%', moveDuration: 7.0, glowDuration: 12.5, moveDelay: 0.8,  glowDelay: 5.4,  dx1: -6, dy1: -8, dx2:  9, dy2:  4, dx3: -5, dy3:  8, r: 2.5 },
  { cx: '48%', cy: '80%', moveDuration: 5.6, glowDuration: 10.3, moveDelay: 3.5,  glowDelay: 2.0,  dx1:  4, dy1: -9, dx2: -3, dy2:  6, dx3:  7, dy3: -4, r: 4 },
  { cx: '82%', cy: '40%', moveDuration: 6.1, glowDuration: 13.7, moveDelay: 1.9,  glowDelay: 7.2,  dx1: -8, dy1:  5, dx2:  4, dy2: -7, dx3: -6, dy3:  3, r: 3 },
  { cx: '12%', cy: '48%', moveDuration: 6.7, glowDuration: 15.0, moveDelay: 0.4,  glowDelay: 4.6,  dx1:  6, dy1:  4, dx2: -5, dy2: -8, dx3:  8, dy3:  5, r: 2.5 },
  { cx: '55%', cy: '14%', moveDuration: 5.3, glowDuration:  9.4, moveDelay: 2.2,  glowDelay: 0.9,  dx1: -3, dy1:  8, dx2:  7, dy2: -4, dx3: -6, dy3: -7, r: 3 },
];

interface AnclaArtProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

export default function AnclaArt({ width = '100%', height = '100%', className }: AnclaArtProps) {
  return (
    <div
      className={className}
      style={{ position: 'relative', width, height, overflow: 'hidden' }}
      aria-hidden="true"
    >
      {/* Watercolor underwash — blurred soft washes */}
      <svg
        viewBox="0 0 400 520"
        width="100%"
        height="100%"
        style={{ position: 'absolute', inset: 0 }}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="watercolor-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="28" />
          </filter>
          <filter id="firefly-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Wash 1 — sage */}
        <motion.ellipse
          cx="140" cy="180" rx="120" ry="100"
          fill="var(--color-sage-300)"
          filter="url(#watercolor-blur)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.18, 0.24, 0.18] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Wash 2 — calm */}
        <motion.ellipse
          cx="280" cy="300" rx="100" ry="90"
          fill="var(--color-calm-300)"
          filter="url(#watercolor-blur)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.14, 0.20, 0.14] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        {/* Wash 3 — peach */}
        <motion.ellipse
          cx="180" cy="400" rx="90" ry="75"
          fill="var(--color-peach-300)"
          filter="url(#watercolor-blur)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.10, 0.16, 0.10] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />
        {/* Wash 4 — sand */}
        <motion.ellipse
          cx="320" cy="160" rx="80" ry="65"
          fill="var(--color-sand-300)"
          filter="url(#watercolor-blur)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.12, 0.18, 0.12] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

        {/* Gradient ribbon accent */}
        <defs>
          <linearGradient id="ribbon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="var(--color-sage-400)"  stopOpacity="0.5" />
            <stop offset="50%"  stopColor="var(--color-calm-400)"  stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-peach-300)" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <motion.path
          d="M 60 80 C 100 120 160 100 200 160 C 240 220 200 280 240 340 C 280 400 340 380 360 440"
          stroke="url(#ribbon-gradient)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 2.5, ease: 'easeOut', delay: 0.4 }}
        />

        {/* 8 Fireflies — independent paths */}
        {fireflies.map((f, i) => {
          const x = parseFloat(f.cx) * 4;   // convert % to 0-400 coords
          const y = parseFloat(f.cy) * 5.2; // convert % to 0-520 coords

          return (
            <motion.g key={i} filter="url(#firefly-glow)">
              <motion.circle
                cx={x}
                cy={y}
                r={f.r}
                fill="var(--color-sage-400)"
                animate={{
                  cx: [x, x + f.dx1, x + f.dx2, x + f.dx3, x],
                  cy: [y, y + f.dy1, y + f.dy2, y + f.dy3, y],
                  opacity: [0.1, 0.9, 0.1, 0.8, 0.1],
                }}
                transition={{
                  cx: { duration: f.moveDuration, repeat: Infinity, ease: 'easeInOut', delay: f.moveDelay },
                  cy: { duration: f.moveDuration, repeat: Infinity, ease: 'easeInOut', delay: f.moveDelay },
                  opacity: { duration: f.glowDuration, repeat: Infinity, ease: 'easeInOut', delay: f.glowDelay },
                }}
              />
            </motion.g>
          );
        })}
      </svg>

      {/* Hero AnclaMark — centered */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -52%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.0, ease: 'easeOut' }}
        >
          <AnclaMark size={120} color="var(--color-sage-700)" animated />
        </motion.div>
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6, ease: 'easeOut' }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            fontWeight: 600,
            letterSpacing: '0.2em',
            color: 'var(--color-sage-700)',
          }}
        >
          ANCLA
        </motion.span>
      </div>
    </div>
  );
}
