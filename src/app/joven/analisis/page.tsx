'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RiskShape from '@/components/viz/RiskShape';
import JovenHeader from '@/components/joven/JovenHeader';
import { useAnclaStore } from '@/lib/store';
import { mockFolio, mockHash } from '@/lib/mock-data';
import { ShieldCheck, MessageCircle, Lock } from 'lucide-react';

const patterns = [
  { label: 'Secretismo', detected: true },
  { label: 'Aislamiento', detected: true },
  { label: 'Halagos excesivos', detected: true },
  { label: 'Solicitud de imágenes', detected: false },
  { label: 'Presión repetida', detected: false },
];

export default function AnalisisPage() {
  const router          = useRouter();
  const { riskLevel }   = useAnclaStore();
  const [progress, setProgress] = useState(0);
  const [revealed, setRevealed] = useState(false);

  /* Animate progress bar on mount */
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(riskLevel);
      setTimeout(() => setRevealed(true), 900);
    }, 400);
    return () => clearTimeout(timer);
  }, [riskLevel]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-background)' }}>
      <JovenHeader title="Tu análisis" />

      <div style={{ flex: 1, padding: '32px 24px', maxWidth: 680, margin: '0 auto', width: '100%' }}>
        {/* Folio */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}
        >
          <Lock size={13} color="var(--color-text-tertiary)" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>
            Folio {mockFolio} · Cifrado
          </span>
        </motion.div>

        {/* Risk Shape + progress */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, marginBottom: 36 }}
        >
          <RiskShape risk={riskLevel} size={220} breathing />

          {/* Progress bar */}
          <div style={{ width: '100%', maxWidth: 360 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                Nivel de preocupación
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>
                {progress}%
              </span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: 'var(--color-gray-100)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.9, ease: 'easeOut', delay: 0.5 }}
                style={{
                  height: '100%',
                  borderRadius: 999,
                  background: riskLevel <= 25
                    ? 'var(--color-sage-500)'
                    : riskLevel <= 50
                    ? 'var(--color-calm-500)'
                    : riskLevel <= 75
                    ? 'var(--color-sand-500)'
                    : 'var(--color-terra-500)',
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Pattern chips */}
        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ marginBottom: 32 }}
            >
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, marginBottom: 12, color: 'var(--color-text-primary)' }}>
                Patrones detectados
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {patterns.map((p, i) => (
                  <motion.div
                    key={p.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 999,
                      fontSize: '0.82rem',
                      fontFamily: 'var(--font-body)',
                      fontWeight: 500,
                      background: p.detected ? 'var(--color-terra-100)' : 'var(--color-gray-100)',
                      color: p.detected ? 'var(--color-terra-700)' : 'var(--color-gray-500)',
                      border: `1px solid ${p.detected ? 'var(--color-terra-200)' : 'var(--color-gray-200)'}`,
                    }}
                  >
                    {p.detected ? '⚠ ' : ''}{p.label}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hash */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{
            padding: '12px 16px',
            borderRadius: 10,
            background: 'var(--color-gray-50)',
            border: '1px solid var(--color-border)',
            marginBottom: 28,
          }}
        >
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-body)', marginBottom: 4 }}>
            Evidencia digital preservada
          </div>
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-text-secondary)', wordBreak: 'break-all' }}>
            {mockHash}
          </code>
        </motion.div>

        {/* CTAs */}
        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              <button
                onClick={() => router.push('/joven/chat')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: 'var(--color-calm-500)', color: 'white',
                  border: 'none', borderRadius: 999, padding: '13px 28px',
                  fontSize: '0.95rem', fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer',
                  boxShadow: 'var(--shadow-calm)', transition: 'all 250ms',
                }}
              >
                <MessageCircle size={18} />
                Hablar con ANA sobre esto
              </button>
              <button
                onClick={() => router.push('/joven/mapa')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: 'transparent', color: 'var(--color-sage-700)',
                  border: '1.5px solid var(--color-sage-300)', borderRadius: 999, padding: '12px 28px',
                  fontSize: '0.95rem', fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 250ms',
                }}
              >
                <ShieldCheck size={18} />
                Ver mapa de lo sucedido
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
