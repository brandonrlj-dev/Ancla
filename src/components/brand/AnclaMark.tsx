'use client';

import { motion } from 'framer-motion';

interface AnclaMarkProps {
  size?: number;
  color?: string;
  className?: string;
  animated?: boolean;
}

export default function AnclaMark({
  size = 56,
  color = 'currentColor',
  className,
  animated = false,
}: AnclaMarkProps) {
  const h = size * (56 / 48);
  const s = 3.2;

  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 48 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* Asymmetric ring — opens top-right, calligraphic gesture */}
      <motion.path
        d="M 32 6 C 19 5 6 13 6 25 C 6 38 17 44 28 43"
        stroke={color}
        strokeWidth={s}
        strokeLinecap="round"
        fill="none"
        initial={animated ? { pathLength: 0, opacity: 0 } : false}
        animate={animated ? { pathLength: 1, opacity: 1 } : undefined}
        transition={animated ? { duration: 1.2, delay: 0, ease: 'easeInOut' } : undefined}
      />

      {/* Descending ribbon — flows down from ring, curls at foot */}
      <motion.path
        d="M 23 22 C 23 30 24 38 27 44 C 29 49 33 50 31 53 C 27 53 23 50 22 44"
        stroke={color}
        strokeWidth={s * 0.78}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={animated ? { pathLength: 0, opacity: 0 } : false}
        animate={animated ? { pathLength: 1, opacity: 1 } : undefined}
        transition={animated ? { duration: 1.2, delay: 0.3, ease: 'easeInOut' } : undefined}
      />

      {/* Center dot — the only closed element */}
      <motion.circle
        cx="23.5"
        cy="22"
        r={2.6}
        fill={color}
        initial={animated ? { opacity: 0, scale: 0 } : false}
        animate={animated ? { opacity: 1, scale: 1 } : undefined}
        transition={animated ? { delay: 1.0, duration: 0.4, ease: 'backOut' } : undefined}
        style={animated ? { transformOrigin: '23.5px 22px' } : undefined}
      />
    </svg>
  );
}
