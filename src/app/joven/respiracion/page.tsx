'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import BreathingCircle from '@/components/viz/BreathingCircle';
import JovenHeader from '@/components/joven/JovenHeader';

export default function RespiracionPage() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(160deg, var(--color-calm-50) 0%, var(--color-sage-50) 60%, var(--color-off-white) 100%)',
      }}
    >
      <JovenHeader title="Respiración guiada" />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 24px',
          gap: 24,
        }}
      >
        {/* Intro text */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', maxWidth: 400 }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.6rem',
              fontWeight: 600,
              color: 'var(--color-calm-700)',
              marginBottom: 10,
            }}
          >
            Respira conmigo
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
            }}
          >
            Este ejercicio de respiración 4-4-4 te ayudará a encontrar calma.
            Sigue el ritmo del círculo con tu respiración.
          </p>
        </motion.div>

        {/* Breathing circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <BreathingCircle
            size={240}
            onCycleComplete={() => {/* handled internally */}}
          />
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            display: 'flex',
            gap: 24,
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: 8,
          }}
        >
          {[
            { phase: 'Inhala', duration: '3s', color: 'var(--color-calm-500)' },
            { phase: 'Retén', duration: '3s', color: 'var(--color-sage-500)' },
            { phase: 'Exhala', duration: '3s', color: 'var(--color-calm-400)' },
            { phase: 'Retén', duration: '3s', color: 'var(--color-sage-400)' },
          ].map((p, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 999,
                background: 'white',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                {p.phase}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                {p.duration}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Skip link */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          onClick={() => router.push('/joven/chat')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-tertiary)',
            fontSize: '0.82rem',
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: 3,
            padding: 0,
            marginTop: 8,
          }}
        >
          Saltar y hablar con ANA
        </motion.button>
      </div>
    </div>
  );
}
