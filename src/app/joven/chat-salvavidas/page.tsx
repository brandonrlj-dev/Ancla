'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import AnaAvatar from '@/components/ana/AnaAvatar';
import AnaIntro from '@/components/ana/AnaIntro';
import { Send, Paperclip, Phone, X, ArrowRight } from 'lucide-react';

interface Msg {
  id: string;
  from: 'ana' | 'user' | 'system';
  text: string;
  calm?: boolean;
  typing?: boolean;
}

const CONVERSATION: Omit<Msg, 'id'>[] = [
  { from: 'ana',  text: 'Estoy aquí. Antes de nada — ¿estás en un lugar físicamente seguro ahora mismo?' },
  { from: 'user', text: 'Sí, estoy en mi cuarto.' },
  { from: 'ana',  text: 'Bien. Quiero que sepas algo: lo que está pasando no es tu culpa. Las personas que extorsionan son criminales. Tú no hiciste nada para merecer esto.', calm: true },
  { from: 'ana',  text: 'Vamos paso a paso. ¿En qué plataforma te están contactando?' },
  { from: 'user', text: 'Instagram. Y ahora también WhatsApp.' },
  { from: 'ana',  text: '¿Qué tienen ellos? ¿Imágenes, videos, conversaciones?' },
  { from: 'user', text: 'Tienen fotos mías. Quieren dinero o las van a mandar a mis contactos.' },
  { from: 'ana',  text: 'Entiendo. Esto se llama sextorsión y es un delito grave. Yo te voy a guiar para detener la propagación, proteger lo que ya está, y darte opciones reales.', calm: true },
  { from: 'ana',  text: '¿Puedes compartirme capturas de los mensajes donde te piden dinero? Eso me ayuda a preparar tu reporte.' },
  { from: 'system', text: 'Capturas adjuntadas · 6 archivos' },
  { from: 'ana',  text: 'Recibido. Voy a preparar tus pasos. No te vayas de aquí.', typing: false },
];

export default function ChatSalvavidasPage() {
  const router   = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [showIntro, setShowIntro]       = useState(true);
  const [stabilized, setStabilized]     = useState(false);
  const [msgs, setMsgs]                 = useState<Msg[]>([]);
  const [msgIdx, setMsgIdx]             = useState(0);
  const [showCTA, setShowCTA]           = useState(false);
  const [input, setInput]               = useState('');
  const [anaState, setAnaState]         = useState<'listening' | 'talking' | 'validating' | 'critical'>('talking');
  const bodyRef = useRef<HTMLDivElement>(null);

  /* Stage messages after stabilization */
  useEffect(() => {
    if (!stabilized || msgIdx >= CONVERSATION.length) {
      if (stabilized && msgIdx >= CONVERSATION.length) setShowCTA(true);
      return;
    }
    const m = CONVERSATION[msgIdx];
    const delay = m.from === 'user' ? 900 : 1200;
    const t = setTimeout(() => {
      setMsgs((prev) => [...prev, { ...m, id: `m-${msgIdx}` }]);
      if (m.from === 'ana') setAnaState(m.calm ? 'validating' : 'talking');
      if (m.from === 'user') setAnaState('listening');
      setMsgIdx((i) => i + 1);
    }, 400 + (msgIdx === 0 ? 0 : delay));
    return () => clearTimeout(t);
  }, [stabilized, msgIdx]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs]);

  /* STEP 1 — Intro */
  if (showIntro) {
    return <AnaIntro onDone={() => setShowIntro(false)} />;
  }

  /* STEP 2 — Stabilization breathing */
  if (!stabilized) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-background)', padding: '40px 24px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-terra-500)', marginBottom: 12 }}>
            Modo Salvavidas · Antes de continuar
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--color-text-secondary)', lineHeight: 1.65, maxWidth: 380 }}>
            Lo que sientes ahora es real. Vamos a tomarlo paso a paso. Primero un ciclo de respiración, y después ANA te acompaña.
          </p>
        </motion.div>

        {/* Breathing circle */}
        <div style={{ position: 'relative', width: 160, height: 160, marginBottom: 32 }}>
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.7, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, delay: i * 2, ease: 'easeInOut' }}
              style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--color-terra-300)', pointerEvents: 'none' }}
            />
          ))}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', inset: 20, borderRadius: '50%', background: 'radial-gradient(ellipse at 35% 35%, var(--color-terra-300), var(--color-terra-500))', boxShadow: '0 8px 32px rgba(193,122,94,0.4)' }}
          />
        </div>

        <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 4, repeat: Infinity }}
          style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 32 }}>
          Respira. Estamos aquí.
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setStabilized(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 999, background: 'var(--color-terra-500)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 600, boxShadow: '0 4px 16px rgba(193,122,94,0.35)' }}
        >
          Continuar con ANA <ArrowRight size={18} />
        </motion.button>
      </div>
    );
  }

  /* STEP 3 — Chat */
  const statusLabel = {
    listening:  'Escuchando · tu ritmo manda',
    talking:    'Respondiendo',
    validating: 'Contigo · sin juicios',
    critical:   'Atención requerida',
  }[anaState];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-background)' }}>
      {/* Header */}
      <div style={{ height: 64, padding: '0 20px', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(250,249,247,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--color-border-subtle)', flexShrink: 0 }}>
        <AnaAvatar state={anaState} size={40} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
              ANA · Modo Salvavidas
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, background: 'var(--color-terra-50)', border: '1px solid var(--color-terra-200)', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--color-terra-600)' }}>
              Paso 1 de 5
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-body)' }}>{statusLabel}</span>
          </div>
        </div>
        <button
          onClick={() => router.push('/joven/silencioso')}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 999, background: 'var(--color-gray-100)', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}
        >
          <X size={13} /> Cierre rápido
        </button>
      </div>

      {/* Progress */}
      <div style={{ height: 3, background: 'var(--color-gray-100)' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: '20%' }} transition={{ duration: 0.8 }}
          style={{ height: '100%', background: 'var(--color-terra-400)', borderRadius: '0 2px 2px 0' }} />
      </div>

      {/* Urgent 911 banner */}
      <button
        onClick={() => router.push('/joven/lineas')}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', background: 'var(--color-terra-50)', border: 'none', borderBottom: '1px solid var(--color-terra-200)', cursor: 'pointer', flexShrink: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Phone size={14} color="var(--color-terra-500)" />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-terra-600)', fontWeight: 500 }}>
            Llamar al 911 ahora si hay peligro físico
          </span>
        </div>
        <ArrowRight size={13} color="var(--color-terra-400)" />
      </button>

      {/* Messages */}
      <div ref={bodyRef} style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {msgs.map((m) => {
          if (m.from === 'system') {
            return (
              <div key={m.id} style={{ textAlign: 'center', padding: '6px 14px', background: 'var(--color-gray-100)', borderRadius: 99, fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)', alignSelf: 'center' }}>
                {m.text}
              </div>
            );
          }
          const isAna = m.from === 'ana';
          return (
            <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ alignSelf: isAna ? 'flex-start' : 'flex-end', maxWidth: '80%' }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: isAna ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                background: isAna ? (m.calm ? 'rgba(214,191,171,0.22)' : 'white') : 'var(--color-terra-500)',
                color: isAna ? 'var(--color-text-primary)' : 'white',
                fontFamily: 'var(--font-body)', fontSize: '0.9rem', lineHeight: 1.6,
                boxShadow: isAna ? 'var(--shadow-sm)' : 'none',
                border: isAna ? (m.calm ? '1px solid rgba(201,163,106,0.35)' : '1px solid var(--color-border-subtle)') : 'none',
              }}>
                {m.text}
                {isAna && <div style={{ marginTop: 6, paddingTop: 4, borderTop: '1px solid var(--color-border-subtle)', fontSize: '0.68rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>— ANA</div>}
              </div>
            </motion.div>
          );
        })}

        <AnimatePresence>
          {showCTA && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
              <button
                onClick={() => router.push('/joven/acciones')}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 999, background: 'var(--color-terra-500)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 600, boxShadow: '0 4px 16px rgba(193,122,94,0.35)' }}
              >
                Ver qué hacer ahora →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <div style={{ height: 12 }} />
      </div>

      {/* Input row */}
      <div style={{ padding: '10px 16px 14px', borderTop: '1px solid var(--color-border-subtle)', background: 'white', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <button style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--color-gray-100)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Paperclip size={16} color="var(--color-text-tertiary)" />
        </button>
        <input
          value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe aquí o pega los mensajes…"
          style={{ flex: 1, padding: '10px 16px', borderRadius: 999, border: '1.5px solid var(--color-border)', background: 'var(--color-gray-50)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none', color: 'var(--color-text-primary)' }}
        />
        <button
          onClick={() => { if (!input.trim()) return; setInput(''); }}
          style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--color-terra-500)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Send size={16} color="white" />
        </button>
      </div>
    </div>
  );
}
