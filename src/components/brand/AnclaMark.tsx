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
  const h = size * (80 / 56);

  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 56 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Open asymmetric ring — gap at bottom-left, slightly tilted */}
      <motion.path
        d="M 11 28 A 15 12 -10 1 1 33 32"
        stroke={color}
        strokeWidth="3.4"
        strokeLinecap="round"
        initial={animated ? { pathLength: 0, opacity: 0 } : false}
        animate={animated ? { pathLength: 1, opacity: 1 } : undefined}
        transition={animated ? { duration: 1.2, delay: 0, ease: 'easeInOut' } : undefined}
      />

      {/* Descending ribbon — curves down from ring end, curls back left */}
      <motion.path
        d="M 33 32 C 40 44 42 57 36 67 C 31 75 21 75 18 68 C 15 61 20 56 27 60"
        stroke={color}
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animated ? { pathLength: 0, opacity: 0 } : false}
        animate={animated ? { pathLength: 1, opacity: 1 } : undefined}
        transition={animated ? { duration: 1.2, delay: 0.3, ease: 'easeInOut' } : undefined}
      />

      {/* Heart dot — off-center, top-right of ring */}
      <motion.path
        d="M 39 12 C 39 10.2 37.6 9 36.1 9.9 C 34.5 10.9 34.5 13.1 36.1 14.7 L 39 17.8 L 41.9 14.7 C 43.5 13.1 43.5 10.9 41.9 9.9 C 40.4 9 39 10.2 39 12"
        fill={color}
        initial={animated ? { opacity: 0, scale: 0 } : false}
        animate={animated ? { opacity: 1, scale: 1 } : undefined}
        transition={animated ? { delay: 1.0, duration: 0.4, ease: 'backOut' } : undefined}
        style={animated ? { transformOrigin: '39px 13px' } : undefined}
      />
    </svg>
  );
}
