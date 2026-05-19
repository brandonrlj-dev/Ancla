'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import JovenHeader from '@/components/joven/JovenHeader';
import { Phone, ExternalLink, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const CARDS = [
  {
    n: '01',
    title: 'No pagues ni cedas',
    body: 'Aunque te prometan dejarte en paz, el 90% de los extorsionadores sigue pidiendo más después del primer pago. Pagar les confirma que la presión funciona.',
    callout: 'El silencio que ellos exigen es su única herramienta. En el momento que reportas, esa herramienta se rompe.',
    extra: null,
  },
  {
    n: '02',
    title: 'No borres nada todavía',
    body: 'Cada mensaje, captura y perfil suyo es evidencia. ANA ya empezó a guardarlo todo de forma segura con su hash de integridad. Tú solo necesitas no borrar.',
    callout: 'Si ya borraste algo, no pasa nada. ANA ya capturó lo que compartiste. Sigamos.',
    extra: null,
  },
  {
    n: '03',
    title: 'Cómo bloquear sin empeorar',
    body: 'Primero descarga las conversaciones (ANA te muestra cómo). Después restringe el perfil. Solo bloquea al final — bloquear antes de tener evidencia puede provocar que envíe el material antes.',
    callout: 'Orden correcto: 1) descargar, 2) restringir, 3) bloquear.',
    extra: null,
  },
  {
    n: '04',
    title: 'Detén la propagación',
    body: 'Si las imágenes ya existen, sube los hashes a StopNCII.org. Es gratis, anónimo, y bloquea automáticamente el material en Instagram, Facebook, TikTok y otras plataformas globales.',
    callout: 'Tus imágenes nunca salen de tu dispositivo. Solo se sube una huella digital — como una huella dactilar — que las plataformas reconocen y bloquean.',
    extra: 'https://stopncii.org',
  },
] as const;

export default function AccionesPage() {
  const router   = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [idx, setIdx] = useState(0);
  const card = CARDS[idx];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-background)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 56, borderBottom: '1px solid var(--color-border-subtle)', background: 'rgba(250,249,247,0.95)', backdropFilter: 'blur(12px)', flexShrink: 0 }}>
        <button onClick={() => router.push('/joven/chat-salvavidas')}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', fontSize: '0.82rem', padding: 0 }}>
          <ChevronLeft size={16} /> Atrás
        </button>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Lo que debes hacer ahora
        </div>
        <button onClick={() => router.push('/joven/lineas')}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 999, background: 'var(--color-terra-500)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 500 }}>
          <Phone size={13} /> Llamar al 911
        </button>
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', padding: '10px 24px', borderBottom: '1px solid var(--color-border-subtle)' }}>
        Paso 2 de 5
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: isMobile ? '24px 20px' : '32px 48px', maxWidth: 720, margin: '0 auto', width: '100%' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.28 }}
            style={{ flex: 1 }}
          >
            {/* Card */}
            <div style={{ background: 'white', borderRadius: 20, padding: isMobile ? '28px 24px' : '40px 40px', boxShadow: '0 4px 32px rgba(0,0,0,0.06)', border: '1px solid var(--color-border-subtle)', marginBottom: 24 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: 700, color: 'var(--color-border)', lineHeight: 1, marginBottom: 20 }}>
                {card.n}
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem, 3vw, 1.7rem)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 16, lineHeight: 1.3 }}>
                {card.title}
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
                {card.body}
              </p>

              <div style={{ padding: '16px 18px', borderRadius: 12, background: 'var(--color-calm-50)', border: '1px solid var(--color-calm-200)', marginBottom: card.extra ? 16 : 0 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-calm-600)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Por qué</div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--color-text-primary)', lineHeight: 1.6 }}>
                  {card.callout}
                </p>
              </div>

              {card.extra && (
                <button
                  style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 999, background: 'white', border: '1.5px solid var(--color-border)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}
                >
                  <ExternalLink size={14} /> Abrir StopNCII.org
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <button
            onClick={() => setIdx(Math.max(0, idx - 1))}
            disabled={idx === 0}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '10px 20px', borderRadius: 999, background: 'white', border: '1.5px solid var(--color-border)', cursor: idx === 0 ? 'default' : 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', opacity: idx === 0 ? 0.4 : 1, transition: 'opacity 200ms' }}
          >
            <ChevronLeft size={16} /> Anterior
          </button>

          {/* Dots */}
          <div style={{ display: 'flex', gap: 8 }}>
            {CARDS.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                style={{ width: i === idx ? 20 : 8, height: 8, borderRadius: 4, background: i < idx ? 'var(--color-calm-400)' : i === idx ? 'var(--color-text-primary)' : 'var(--color-border)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 250ms' }}
              />
            ))}
          </div>

          {idx < CARDS.length - 1 ? (
            <button
              onClick={() => setIdx(idx + 1)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '10px 20px', borderRadius: 999, background: 'var(--color-calm-500)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 500 }}
            >
              Ya lo hice <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => router.push('/joven/reporte')}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '10px 20px', borderRadius: 999, background: 'var(--color-calm-500)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 500 }}
            >
              Ver mi reporte <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
