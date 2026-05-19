'use client';

import { motion } from 'framer-motion';
import AnclaMark from './AnclaMark';

interface AnclaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'horizontal' | 'vertical' | 'mark-only';
  color?: string;
  className?: string;
  animated?: boolean;
}

const sizes = {
  sm:  { mark: 28, text: '0.9rem',  gap: 8 },
  md:  { mark: 40, text: '1.15rem', gap: 10 },
  lg:  { mark: 56, text: '1.5rem',  gap: 14 },
  xl:  { mark: 80, text: '2.1rem',  gap: 20 },
};

export default function AnclaLogo({
  size = 'md',
  variant = 'horizontal',
  color = 'var(--color-sage-700)',
  className,
  animated = false,
}: AnclaLogoProps) {
  const s = sizes[size];

  if (variant === 'mark-only') {
    return <AnclaMark size={s.mark} color={color} className={className} animated={animated} />;
  }

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: variant === 'vertical' ? 'column' : 'row',
        alignItems: 'center',
        gap: s.gap,
        color,
      }}
    >
      <AnclaMark size={s.mark} color={color} animated={animated} />
      <motion.span
        initial={animated ? { opacity: 0, x: -8 } : false}
        animate={animated ? { opacity: 1, x: 0 } : undefined}
        transition={animated ? { delay: 1.1, duration: 0.5 } : undefined}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: s.text,
          fontWeight: 600,
          letterSpacing: '0.18em',
          color,
          lineHeight: 1,
        }}
      >
        ANCLA
      </motion.span>
    </div>
  );
}
