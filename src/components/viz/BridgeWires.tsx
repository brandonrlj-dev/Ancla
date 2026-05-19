'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

/* 13 bezier curves: 5 blue (automatic), 4 green (consent), 4 terra (link) */
interface WireConfig {
  id:    string;
  type:  'blue' | 'green' | 'terra';
  d:     string;  // SVG path
  delay: number;
}

const W = 680, H = 320;
const MX = W / 2; // midpoint x

/* Left anchor points (youth portal) */
const LP: [number, number][] = [
  [0, 40], [0, 80], [0, 120], [0, 165], [0, 210],
  [0, 250], [0, 290],
];
/* Right anchor points (police portal) */
const RP: [number, number][] = [
  [W, 30], [W, 75], [W, 120], [W, 170], [W, 215],
  [W, 260], [W, 295],
];

/* Control point offset for bowing curves */
function bezierPath(lx: number, ly: number, rx: number, ry: number, bow: number): string {
  const cp1x = MX - 80, cp1y = ly + bow;
  const cp2x = MX + 80, cp2y = ry + bow;
  return `M ${lx} ${ly} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${rx} ${ry}`;
}

const wires: WireConfig[] = [
  { id: 'w0',  type: 'blue',  d: bezierPath(...LP[0], ...RP[0], -20),  delay: 0.0  },
  { id: 'w1',  type: 'green', d: bezierPath(...LP[1], ...RP[1],  10),  delay: 0.2  },
  { id: 'w2',  type: 'blue',  d: bezierPath(...LP[2], ...RP[2], -15),  delay: 0.4  },
  { id: 'w3',  type: 'terra', d: bezierPath(...LP[3], ...RP[3],  20),  delay: 0.6  },
  { id: 'w4',  type: 'blue',  d: bezierPath(...LP[4], ...RP[4], -10),  delay: 0.8  },
  { id: 'w5',  type: 'green', d: bezierPath(...LP[5], ...RP[5],  15),  delay: 1.0  },
  { id: 'w6',  type: 'blue',  d: bezierPath(...LP[6], ...RP[6], -25),  delay: 1.2  },
  { id: 'w7',  type: 'terra', d: bezierPath(...LP[0], ...RP[4],  30),  delay: 0.3  },
  { id: 'w8',  type: 'green', d: bezierPath(...LP[2], ...RP[6], -30),  delay: 0.5  },
  { id: 'w9',  type: 'blue',  d: bezierPath(...LP[4], ...RP[2],  25),  delay: 0.7  },
  { id: 'w10', type: 'terra', d: bezierPath(...LP[6], ...RP[0], -40),  delay: 0.9  },
  { id: 'w11', type: 'green', d: bezierPath(...LP[1], ...RP[5],  35),  delay: 1.1  },
  { id: 'w12', type: 'terra', d: bezierPath(...LP[5], ...RP[1], -35),  delay: 1.3  },
];

const colors = {
  blue:  'var(--color-calm-500)',
  green: 'var(--color-sage-500)',
  terra: 'var(--color-terra-500)',
};

const GLOW_IDS = { blue: 'glow-blue', green: 'glow-green', terra: 'glow-terra' };

/* 3 states — which wire type is highlighted */
type WireState = 'all' | 'blue' | 'green' | 'terra';
const STATES: WireState[] = ['all', 'blue', 'green', 'terra'];

const DASHLEN = 280;

export default function BridgeWires({ className }: { className?: string }) {
  const [stateIdx, setStateIdx] = useState(0);

  /* Cycle every 3.5s */
  useEffect(() => {
    const t = setInterval(() => setStateIdx((i) => (i + 1) % STATES.length), 3500);
    return () => clearInterval(t);
  }, []);

  const activeState = STATES[stateIdx];

  function wireOpacity(type: WireConfig['type']): number {
    if (activeState === 'all') return 0.75;
    return type === activeState ? 1 : 0.15;
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="100%"
      className={className}
      style={{ overflow: 'visible' }}
      aria-hidden="true"
    >
      <defs>
        {(['blue', 'green', 'terra'] as const).map((t) => (
          <filter key={t} id={GLOW_IDS[t]} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor={colors[t]} floodOpacity="0.6" result="flood" />
            <feComposite in="flood" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}
      </defs>

      {wires.map((w) => {
        const col     = colors[w.type];
        const opacity = wireOpacity(w.type);
        const isActive = activeState === 'all' || w.type === activeState;

        return (
          <motion.path
            key={w.id}
            d={w.d}
            stroke={col}
            strokeWidth={isActive ? 2 : 1}
            fill="none"
            strokeLinecap="round"
            filter={isActive ? `url(#${GLOW_IDS[w.type]})` : undefined}
            animate={{
              opacity,
              strokeDashoffset: [-DASHLEN, 0],
            }}
            initial={{ opacity, strokeDashoffset: -DASHLEN }}
            transition={{
              opacity: { duration: 0.5 },
              strokeDashoffset: {
                duration: isActive ? 2.0 : 4.0,
                repeat: Infinity,
                ease: 'linear',
                delay: w.delay,
              },
            }}
            style={{ strokeDasharray: `${DASHLEN * 0.4} ${DASHLEN * 1.5}` }}
          />
        );
      })}

      {/* State legend dots */}
      <g>
        {STATES.filter((s) => s !== 'all').map((s, i) => {
          const labels = { blue: 'Automática', green: 'Consentimiento', terra: 'Vinculación' };
          return (
            <g key={s} transform={`translate(${W / 2 - 110 + i * 78}, ${H - 20})`}>
              <circle r="5" fill={colors[s as keyof typeof colors]} opacity={activeState === s || activeState === 'all' ? 1 : 0.3} />
              <text x="10" y="4" fontSize="11" fill={colors[s as keyof typeof colors]} opacity={activeState === s || activeState === 'all' ? 1 : 0.3} fontFamily="var(--font-body)">
                {labels[s as keyof typeof labels]}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
