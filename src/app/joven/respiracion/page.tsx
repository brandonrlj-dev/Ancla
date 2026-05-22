'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import AnclaLogo from '@/components/brand/AnclaLogo';
import { ChevronLeft, ArrowRight } from 'lucide-react';

const PHASES      = ['Inhala…', 'Retén…', 'Exhala…', 'Retén…'] as const;
const VALIDATIONS = [
  'No es tu culpa.',
  'Estás haciendo lo correcto.',
  'Aquí estás seguro/a.',
  'Respira. Tienes tiempo.',
] as const;

export default function RespiracionPage() {
  const router    = useRouter();
  const isMobile  = useMediaQuery('(max-width: 768px)');

  const [phase,  setPhase]  = useState(0);
  const [valid,  setValid]  = useState(0);
  const [cycles, setCycles] = useState(0);

  /* Phase ticker — 6 s per phase, 24 s full cycle */
  useEffect(() => {
    const t = setInterval(() => {
      setPhase((p) => {
        const next = (p + 1) % 4;
        if (next === 0) setCycles((c) => c + 1);
        return next;
      });
    }, 6000);
    return () => clearInterval(t);
  }, []);

  /* Validation ticker — 14 s */
  useEffect(() => {
    const t = setInterval(() => setValid((v) => (v + 1) % VALIDATIONS.length), 14000);
    return () => clearInterval(t);
  }, []);

  /* Responsive sizes */
  const wrapSize   = isMobile ? 280 : 360;
  const circleSize = isMobile ? 140 : 180;
  const ringSize   = isMobile ? 190 : 240;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: `
        radial-gradient(circle at 50% 40%, rgba(167,199,231,0.25), transparent 50%),
        #F5F2EE
      `,
    }}>

      {/* Top bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        padding: isMobile ? '14px 18px' : '16px 32px',
        borderBottom: '1px solid rgba(44,44,42,0.08)',
        background: 'rgba(245,242,238,0.92)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        flexShrink: 0,
      }}>
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#8B8780', fontFamily: 'var(--font-body)',
            fontSize: '0.7rem', letterSpacing: '0.08em',
            textTransform: 'uppercase', padding: 0,
          }}
        >
          <ChevronLeft size={14} /> Atrás
        </button>
        <AnclaLogo size="sm" color="#2C2C2A" />
        <div />
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '30px 24px 50px' : '30px 40px 60px',
        textAlign: 'center',
      }}>

        {/* Eyebrow */}
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.68rem',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#8B8780',
          marginBottom: 30,
        }}>
          Respiración 4-4-4
        </div>

        {/* Circle composition */}
        <div style={{
          position: 'relative',
          width: wrapSize,
          height: wrapSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 60,
          flexShrink: 0,
        }}>
          {/* Ring 1 */}
          <motion.div
            animate={{ scale: [0.8, 2.2], opacity: [0.5, 0] }}
            transition={{ duration: 4, ease: 'easeOut', repeat: Infinity }}
            style={{
              position: 'absolute',
              width: ringSize,
              height: ringSize,
              border: '1px solid #A7C7E7',
              borderRadius: '50%',
            }}
          />
          {/* Ring 2 — offset by 1 s */}
          <motion.div
            animate={{ scale: [0.8, 2.2], opacity: [0.5, 0] }}
            transition={{ duration: 4, ease: 'easeOut', repeat: Infinity, delay: 1 }}
            style={{
              position: 'absolute',
              width: ringSize,
              height: ringSize,
              border: '1px solid #A7C7E7',
              borderRadius: '50%',
            }}
          />

          {/* Breathing circle */}
          <motion.div
            animate={{ scale: [1, 1.5, 1.5, 1] }}
            transition={{
              duration: 24,
              times: [0, 0.25, 0.5, 1],
              ease: 'easeInOut',
              repeat: Infinity,
            }}
            style={{
              width: circleSize,
              height: circleSize,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #A7C7E7 0%, #B8D4E8 100%)',
              opacity: 0.55,
            }}
          />
        </div>

        {/* Instruction — vapor crossfade */}
        <div style={{ position: 'relative', minHeight: isMobile ? 36 : 48, marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AnimatePresence>
            <motion.div
              key={phase}
              initial={{ opacity: 0, filter: 'blur(8px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)', transition: { duration: 2.0, ease: 'easeOut' } }}
              exit={{ opacity: 0, filter: 'blur(6px)', transition: { duration: 1.6, ease: 'easeIn' } }}
              style={{
                position: 'absolute',
                fontFamily: 'var(--font-display)',
                fontSize: isMobile ? 22 : 28,
                fontStyle: 'italic',
                color: '#2C2C2A',
                whiteSpace: 'nowrap',
              }}
            >
              {PHASES[phase]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Validation — slower vapor, more ethereal */}
        <div style={{ position: 'relative', minHeight: isMobile ? 28 : 34, marginBottom: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AnimatePresence>
            <motion.div
              key={valid}
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)', transition: { duration: 2.8, ease: 'easeOut' } }}
              exit={{ opacity: 0, filter: 'blur(8px)', transition: { duration: 2.2, ease: 'easeIn' } }}
              style={{
                position: 'absolute',
                fontFamily: 'var(--font-display)',
                fontSize: isMobile ? 15 : 17,
                fontStyle: 'italic',
                color: '#57544E',
                whiteSpace: 'nowrap',
              }}
            >
              {VALIDATIONS[valid]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Buttons — appear fully after 1 cycle */}
        <motion.div
          animate={{ opacity: cycles >= 1 ? 1 : 0.3 }}
          transition={{ duration: 1 }}
          style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <button
            onClick={() => cycles >= 1 && router.push('/joven/modo')}
            disabled={cycles < 1}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 26px',
              borderRadius: 999,
              border: 'none',
              background: '#A7C7E7',
              color: '#2C2C2A',
              fontFamily: 'var(--font-body)',
              fontSize: 15,
              fontWeight: 600,
              cursor: cycles >= 1 ? 'pointer' : 'not-allowed',
              transition: 'filter 200ms ease',
            }}
            onMouseEnter={(e) => { if (cycles >= 1) e.currentTarget.style.filter = 'brightness(0.94)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
          >
            Continuar <ArrowRight size={16} />
          </button>

          <button
            onClick={() => router.push('/joven/regulacion')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 26px',
              borderRadius: 999,
              border: '1.5px solid rgba(44,44,42,0.2)',
              background: 'transparent',
              color: '#57544E',
              fontFamily: 'var(--font-body)',
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 200ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(44,44,42,0.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            Ver más métodos
          </button>
        </motion.div>

        {/* Cycle counter */}
        <div style={{
          marginTop: 24,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: '#8B8780',
          letterSpacing: '0.14em',
        }}>
          Ciclo {Math.max(1, cycles + 1)} de 2
        </div>
      </div>
    </div>
  );
}
