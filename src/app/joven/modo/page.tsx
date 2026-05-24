'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import JovenHeader from '@/components/joven/JovenHeader';
import { MessageCircle, Shield, Anchor } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type CardColor = 'calm' | 'sage';

interface ModeCard {
  id: string;
  label: string;
  route: string;
  icon: LucideIcon;
  color: CardColor;
  delay: number;
  title: string;
  description: string;
}

const CARDS: ModeCard[] = [
  {
    id: 'ana',
    label: 'ANA',
    route: '/joven/chat',
    icon: MessageCircle,
    color: 'calm',
    delay: 0.1,
    title: 'Quiero hablar con alguien',
    description: 'ANA te escucha sin juzgarte. Puedes contarle lo que está pasando y te orienta con calma.',
  },
  {
    id: 'escudo',
    label: 'Modo Escudo',
    route: '/joven/escudo',
    icon: Shield,
    color: 'calm',
    delay: 0.18,
    title: 'Algo en esta conversación me preocupa',
    description: 'Responde unas preguntas para saber si lo que estás viviendo tiene señales de grooming o sextorsión.',
  },
  {
    id: 'ancla',
    label: 'Modo Ancla',
    route: '/joven/ancla',
    icon: Anchor,
    color: 'sage',
    delay: 0.26,
    title: 'Quiero dejar un reporte',
    description: 'Si ya sabes lo que pasó y quieres dejarlo registrado, te guiamos paso a paso. Puede ser anónimo.',
  },
];

export default function ModoPage() {
  const router   = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-background)' }}>
      <JovenHeader title="" back="/joven/termometro" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '28px 20px 40px' : '40px 48px' }}>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 40, maxWidth: 520 }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 12 }}>
            Paso 2 — Tu situación
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 12 }}>
            ¿Cómo te podemos ayudar?
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
            Elige la opción que más se parezca a lo que necesitas ahora. Puedes cambiar cuando quieras.
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 520 }}>
          {CARDS.map(({ id, label, route, icon: Icon, color, delay, title, description }) => (
            <motion.button
              key={id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay }}
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(route)}
              style={{
                background: 'white',
                borderRadius: 20,
                padding: '28px 24px',
                border: `2px solid var(--color-${color}-200)`,
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: '0 4px 24px rgba(91,129,168,0.1)',
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
              }}
            >
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                background: `linear-gradient(90deg, var(--color-${color}-400), var(--color-${color}-600))`,
              }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `var(--color-${color}-50)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={26} color={`var(--color-${color}-500)`} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: 999, background: `var(--color-${color}-50)`, border: `1px solid var(--color-${color}-200)`, fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: `var(--color-${color}-600)`, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                    {label}
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6, lineHeight: 1.3 }}>
                    {title}
                  </h2>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    {description}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-text-tertiary)', marginTop: 32, textAlign: 'center' }}
        >
          No importa qué pasó. Aquí estás seguro/a.
        </motion.p>
      </div>
    </div>
  );
}
