'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import JovenHeader from '@/components/joven/JovenHeader';
import { regulationMethods } from '@/lib/mock-data';
import { ArrowRight } from 'lucide-react';

/* Water-drop border-radius keyframes — each orb has a unique set */
const blobKeyframes = [
  ['60% 40% 40% 60% / 60% 60% 40% 40%', '40% 60% 70% 30% / 30% 60% 40% 70%', '50% 50% 60% 40% / 50% 40% 60% 50%'],
  ['40% 60% 30% 70% / 70% 30% 70% 30%', '60% 40% 50% 50% / 40% 60% 50% 50%', '50% 50% 40% 60% / 60% 50% 40% 60%'],
  ['55% 45% 65% 35% / 45% 55% 35% 65%', '35% 65% 45% 55% / 65% 35% 55% 45%', '50% 50% 55% 45% / 50% 55% 45% 50%'],
  ['70% 30% 40% 60% / 30% 70% 60% 40%', '50% 50% 60% 40% / 60% 40% 50% 50%', '40% 60% 50% 50% / 50% 50% 60% 40%'],
  ['45% 55% 55% 45% / 55% 45% 55% 45%', '60% 40% 40% 60% / 40% 60% 60% 40%', '50% 50% 50% 50% / 55% 45% 45% 55%'],
];

/* Each orb has slightly different animation duration */
const durations = [9.2, 8.4, 10.1, 8.8, 9.6];
const rotations = [2, -2, 1.5, -1.5, 2];

interface WaterDropOrbProps {
  color: string;
  label: string;
  description: string;
  blobIdx: number;
  onClick: () => void;
}

function WaterDropOrb({ color, label, description, blobIdx, onClick }: WaterDropOrbProps) {
  const frames = blobKeyframes[blobIdx];
  const dur    = durations[blobIdx];
  const rot    = rotations[blobIdx];

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.4 }}
      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}
    >
      {/* Orb */}
      <motion.div
        animate={{
          borderRadius: frames,
          rotate: [0, rot, 0, -rot, 0],
        }}
        transition={{
          borderRadius: { duration: dur, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: dur * 1.3, repeat: Infinity, ease: 'easeInOut' },
        }}
        style={{
          width: 110,
          height: 110,
          borderRadius: frames[0],
          background: `radial-gradient(ellipse at 35% 30%, ${color}cc 0%, ${color} 60%, ${color}dd 100%)`,
          boxShadow: `0 12px 40px ${color}55, inset 0 -8px 20px rgba(0,0,0,0.15), inset 0 8px 16px rgba(255,255,255,0.25)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Moving highlight */}
        <motion.div
          animate={{ x: [-15, 5, -15], y: [-10, 5, -10] }}
          transition={{ duration: dur * 0.7, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: 12,
            left: 16,
            width: 36,
            height: 20,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.45)',
            transform: 'rotate(-30deg)',
            pointerEvents: 'none',
          }}
        />
      </motion.div>

      {/* Label */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--color-text-primary)', marginBottom: 4 }}>
          {label}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.45, maxWidth: 130 }}>
          {description}
        </div>
      </div>

      {/* Link hint */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color, fontSize: '0.78rem', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
        Explorar
        <ArrowRight size={13} />
      </div>
    </motion.div>
  );
}

export default function RegulacionPage() {
  const router   = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-background)' }}>
      <JovenHeader title="Métodos de regulación" />

      <div style={{ flex: 1, padding: isMobile ? '28px 20px' : '40px 48px' }}>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--color-text-secondary)', marginBottom: 40, maxWidth: 520 }}
        >
          Cuando sientas que las emociones son muy intensas, estos métodos pueden ayudarte a recuperar calma. Elige el que más te llame.
        </motion.p>

        {/* Orb grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile
              ? 'repeat(2, 1fr)'
              : 'repeat(5, 1fr)',
            gap: isMobile ? '32px 16px' : '40px 24px',
            justifyItems: 'center',
          }}
        >
          {regulationMethods.map((method, i) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <WaterDropOrb
                color={method.color}
                label={method.label}
                description={method.description}
                blobIdx={i}
                onClick={() => router.push(method.href)}
              />
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            marginTop: 48,
            padding: '16px 20px',
            borderRadius: 14,
            background: 'var(--color-calm-50)',
            border: '1px solid var(--color-calm-200)',
            maxWidth: 500,
          }}
        >
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-calm-700)', lineHeight: 1.6 }}>
            Si en este momento te sientes en crisis o no puedes usar estas herramientas,{' '}
            <button
              onClick={() => router.push('/joven/chat')}
              style={{ color: 'var(--color-calm-500)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', textDecoration: 'underline', textUnderlineOffset: 3, padding: 0 }}
            >
              habla con ANA ahora
            </button>
            .
          </p>
        </motion.div>
      </div>
    </div>
  );
}
