'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import JovenHeader from '@/components/joven/JovenHeader';
import { Shield, LifeBuoy } from 'lucide-react';

export default function ModoPage() {
  const router   = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-background)' }}>
      <JovenHeader title="" back="/joven/termometro" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '28px 20px 40px' : '40px 48px' }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 40, maxWidth: 520 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 12 }}>
            Paso 2 — Tu situación
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 12 }}>
            ¿Qué te trae aquí?
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
            Elige la opción que más se parezca a lo que sientes ahora. Puedes cambiar de modo cuando quieras.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, width: '100%', maxWidth: 760 }}>
          {/* Modo Escudo */}
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02, translateY: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/joven/chat')}
            style={{
              background: 'white',
              borderRadius: 20,
              padding: '32px 28px',
              border: '2px solid var(--color-calm-200)',
              cursor: 'pointer',
              textAlign: 'left',
              boxShadow: '0 4px 24px rgba(91,129,168,0.12)',
              transition: 'box-shadow 200ms',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 4,
              background: 'linear-gradient(90deg, var(--color-calm-400), var(--color-calm-600))',
            }} />
            <div style={{ display: 'inline-flex', padding: '6px 12px', borderRadius: 999, background: 'var(--color-calm-50)', border: '1px solid var(--color-calm-200)', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-calm-600)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 20 }}>
              Modo Escudo
            </div>

            <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--color-calm-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Shield size={30} color="var(--color-calm-500)" />
            </div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 10, lineHeight: 1.3 }}>
              Algo en esta conversación me preocupa
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Quiero entender si lo que está pasando es serio antes de tomar decisiones. ANA analizará la conversación contigo.
            </p>
          </motion.button>

          {/* Modo Salvavidas */}
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            whileHover={{ scale: 1.02, translateY: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/joven/chat-salvavidas')}
            style={{
              background: 'white',
              borderRadius: 20,
              padding: '32px 28px',
              border: '2px solid var(--color-terra-200)',
              cursor: 'pointer',
              textAlign: 'left',
              boxShadow: '0 4px 24px rgba(193,122,94,0.12)',
              transition: 'box-shadow 200ms',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 4,
              background: 'linear-gradient(90deg, var(--color-terra-400), var(--color-terra-600))',
            }} />
            <div style={{ display: 'inline-flex', padding: '6px 12px', borderRadius: 999, background: 'var(--color-terra-50)', border: '1px solid var(--color-terra-200)', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-terra-600)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 20 }}>
              Modo Salvavidas
            </div>

            <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--color-terra-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <LifeBuoy size={30} color="var(--color-terra-500)" />
            </div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 10, lineHeight: 1.3 }}>
              Estoy en una situación difícil ahora mismo
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Necesito saber qué hacer ya. ANA te guiará paso a paso para detener la propagación y proteger tu información.
            </p>
          </motion.button>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-text-tertiary)', marginTop: 32, textAlign: 'center' }}
        >
          No importa qué pasó. Aquí estás seguro/a.
        </motion.p>
      </div>
    </div>
  );
}
