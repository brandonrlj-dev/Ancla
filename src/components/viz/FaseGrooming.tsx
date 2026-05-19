'use client';

import { motion } from 'framer-motion';
import { groomingPhases } from '@/lib/mock-data';

interface FaseGroomingProps {
  activePhase: number;   // 1–5
  compact?: boolean;
  className?: string;
}

export default function FaseGrooming({ activePhase, compact = false, className }: FaseGroomingProps) {
  const progress = ((activePhase - 1) / (groomingPhases.length - 1)) * 100;

  return (
    <div className={className}>
      {/* Phase steps */}
      <div
        style={{
          display: 'flex',
          gap: compact ? 8 : 12,
          flexWrap: compact ? 'nowrap' : 'wrap',
          marginBottom: 12,
        }}
      >
        {groomingPhases.map((phase, i) => {
          const isActive = phase.id === activePhase;
          const isDone   = phase.id < activePhase;

          return (
            <motion.div
              key={phase.id}
              animate={{
                backgroundColor: isActive
                  ? 'var(--color-terra-500)'
                  : isDone
                  ? 'var(--color-terra-200)'
                  : 'var(--color-gray-100)',
                borderColor: isActive
                  ? 'var(--color-terra-500)'
                  : isDone
                  ? 'var(--color-terra-300)'
                  : 'var(--color-gray-300)',
                scale: isActive ? 1.04 : 1,
              }}
              transition={{ duration: 0.3 }}
              style={{
                flex: compact ? 1 : undefined,
                minWidth: compact ? 0 : undefined,
                padding: compact ? '6px 10px' : '10px 16px',
                borderRadius: 999,
                border: '1.5px solid',
                display: 'flex',
                flexDirection: compact ? 'row' : 'column',
                alignItems: 'center',
                gap: compact ? 6 : 4,
              }}
            >
              {/* Phase number */}
              <span
                style={{
                  fontSize: compact ? '0.75rem' : '0.65rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: isActive ? 'white' : isDone ? 'var(--color-terra-600, #9e4a28)' : 'var(--color-gray-400)',
                }}
              >
                {phase.id}
              </span>

              {/* Phase label */}
              <span
                style={{
                  fontSize: compact ? '0.75rem' : '0.8rem',
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: 'var(--font-body)',
                  color: isActive ? 'white' : isDone ? 'var(--color-terra-700)' : 'var(--color-gray-500)',
                  whiteSpace: 'nowrap',
                }}
              >
                {phase.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 4,
          borderRadius: 999,
          backgroundColor: 'var(--color-gray-200)',
          overflow: 'hidden',
        }}
      >
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{
            height: '100%',
            borderRadius: 999,
            background: 'linear-gradient(90deg, var(--color-sand-400), var(--color-terra-500))',
          }}
        />
      </div>

      {/* Active phase description */}
      {!compact && (
        <motion.p
          key={activePhase}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            marginTop: 8,
            fontSize: '0.82rem',
            color: 'var(--color-terra-700)',
            fontFamily: 'var(--font-body)',
          }}
        >
          <strong>Fase {activePhase}:</strong> {groomingPhases[activePhase - 1]?.description}
        </motion.p>
      )}
    </div>
  );
}
