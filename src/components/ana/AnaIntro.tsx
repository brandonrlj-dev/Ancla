'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import AnaAvatar from './AnaAvatar';

const phrases = [
  'Hola. Soy ANA.',
  'Estoy aquí para escucharte,\nsin juzgarte.',
  'Este es tu espacio seguro.',
];

interface AnaIntroProps {
  onDone: () => void;
}

export default function AnaIntro({ onDone }: AnaIntroProps) {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [showButtons, setShowButtons] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  /* Typewriter effect */
  useEffect(() => {
    const target = phrases[phraseIdx];
    setDisplayed('');
    let charIdx = 0;
    const timer = setInterval(() => {
      charIdx++;
      setDisplayed(target.slice(0, charIdx));
      if (charIdx >= target.length) {
        clearInterval(timer);
        /* Pause before next phrase */
        setTimeout(() => {
          if (phraseIdx < phrases.length - 1) {
            setPhraseIdx((i) => i + 1);
          } else {
            setShowButtons(true);
          }
        }, 1400);
      }
    }, 48);
    return () => clearInterval(timer);
  }, [phraseIdx]);

  /* Cursor blink */
  useEffect(() => {
    const t = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(t);
  }, []);

  const handleStart = useCallback(() => onDone(), [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, var(--color-calm-50) 0%, var(--color-sage-50) 50%, var(--color-off-white) 100%)',
        zIndex: 50,
        padding: '2rem',
        gap: '2.5rem',
      }}
    >
      {/* Large pulsing orb */}
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <AnaAvatar state="listening" size={160} />
      </motion.div>

      {/* Typewriter phrases */}
      <div
        style={{
          minHeight: '5rem',
          textAlign: 'center',
          maxWidth: 440,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={phraseIdx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.4rem, 4vw, 1.9rem)',
              fontWeight: 500,
              color: 'var(--color-calm-700)',
              lineHeight: 1.45,
              whiteSpace: 'pre-wrap',
            }}
          >
            {displayed}
            <span style={{ opacity: cursorVisible ? 1 : 0, color: 'var(--color-calm-400)' }}>|</span>
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Phrase dots */}
      <div style={{ display: 'flex', gap: 8 }}>
        {phrases.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === phraseIdx ? 20 : 8,
              backgroundColor: i <= phraseIdx ? 'var(--color-calm-400)' : 'var(--color-calm-200)',
            }}
            transition={{ duration: 0.3 }}
            style={{ height: 8, borderRadius: 4 }}
          />
        ))}
      </div>

      {/* Buttons — appear after last phrase */}
      <AnimatePresence>
        {showButtons && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
          >
            <button
              onClick={handleStart}
              style={{
                background: 'var(--color-calm-500)',
                color: 'white',
                border: 'none',
                borderRadius: 999,
                padding: '14px 40px',
                fontSize: '1rem',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 250ms ease',
                boxShadow: '0 4px 16px var(--color-calm-300)',
              }}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.transform = 'none'; }}
            >
              Quiero hablar con ANA
            </button>
            <button
              onClick={handleStart}
              style={{
                background: 'transparent',
                color: 'var(--color-gray-500)',
                border: 'none',
                padding: '8px 16px',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}
            >
              Solo quiero explorar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
