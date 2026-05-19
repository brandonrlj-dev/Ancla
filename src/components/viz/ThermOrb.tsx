'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface ThermOrbProps {
  color: string;
  glowColor?: string;
  size?: number;
  cadence?: number;   // ripple cadence in seconds: 4.45 (calm) → 1.45 (crisis)
  label?: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function ThermOrb({
  color,
  glowColor,
  size = 64,
  cadence = 3,
  label,
  selected = false,
  onClick,
  className,
}: ThermOrbProps) {
  const [hovered, setHovered] = useState(false);
  const glow = glowColor ?? color;
  const showRipples = hovered || selected;

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        cursor: onClick ? 'pointer' : 'default',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div style={{ position: 'relative', width: size, height: size }}>
        {/* 3 Staggered ripple rings — variable cadence */}
        <AnimatePresence>
          {showRipples &&
            [0, 1, 2].map((ri) => (
              <motion.div
                key={`ring-${ri}-${showRipples}`}
                initial={{ scale: 1, opacity: 0.55 }}
                animate={{ scale: 2.4, opacity: 0 }}
                exit={{ scale: 1, opacity: 0 }}
                transition={{
                  duration: cadence,
                  repeat: Infinity,
                  delay: ri * (cadence / 3),
                  ease: 'easeOut',
                }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: `1.5px solid ${glow}`,
                  pointerEvents: 'none',
                }}
              />
            ))}
        </AnimatePresence>

        {/* Main orb */}
        <motion.div
          animate={{
            boxShadow: selected
              ? `0 0 0 3px ${color}, 0 8px 24px ${glow}66`
              : hovered
              ? `0 0 0 2px ${color}88, 0 4px 20px ${glow}55`
              : `0 4px 16px ${glow}40`,
            scale: selected ? 1.05 : hovered ? 1.04 : 1,
            backgroundColor: color,
          }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: color,
          }}
        />
      </div>

      {/* Label */}
      {label && (
        <motion.span
          animate={{ color: selected ? color : 'var(--color-text-secondary)' }}
          transition={{ duration: 0.2 }}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.8rem',
            fontWeight: selected ? 600 : 400,
            textAlign: 'center',
            lineHeight: 1.3,
          }}
        >
          {label}
        </motion.span>
      )}
    </div>
  );
}
