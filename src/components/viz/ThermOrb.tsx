'use client';

import { motion } from 'framer-motion';

interface ThermOrbProps {
  intensity: 1 | 2 | 3 | 4 | 5;
  color: string;
  active?: boolean;
  size?: number;
}

export default function ThermOrb({ intensity, color, active = false, size = 70 }: ThermOrbProps) {
  // Cadence: 4.45s (calm/1) → 1.45s (panic/5)
  const rippleDur = 5.2 - intensity * 0.75;
  const orbR = 20 + intensity * 1.5;
  const dotR = 4 + intensity;
  const gradId = `therm-grad-${intensity}`;

  return (
    <div style={{ width: size, height: size, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 80 80" width={size} height={size} style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={gradId} cx="40%" cy="40%">
            <stop offset="0%"   stopColor={color} stopOpacity="0.95" />
            <stop offset="100%" stopColor={color} stopOpacity="0.55" />
          </radialGradient>
        </defs>

        {/* Ripple rings — always rendered, animated only when active */}
        {[0, 1, 2].map((ri) => (
          <motion.circle
            key={ri}
            cx="40" cy="40" r="18"
            fill="none"
            stroke={color}
            strokeWidth={1.2 - ri * 0.1}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            animate={
              active
                ? { scale: [0.4, 0.76, 2.4], opacity: [0, 0.7, 0] }
                : { scale: 0.4, opacity: 0 }
            }
            transition={
              active
                ? { duration: rippleDur, times: [0, 0.18, 1], ease: 'easeOut', repeat: Infinity, delay: ri * (rippleDur / 3) }
                : { duration: 0 }
            }
          />
        ))}

        {/* Orb */}
        <circle cx="40" cy="40" r={orbR} fill={`url(#${gradId})`} />
        {/* Inner dot */}
        <circle cx="40" cy="40" r={dotR} fill={color} opacity="0.8" />
      </svg>
    </div>
  );
}
