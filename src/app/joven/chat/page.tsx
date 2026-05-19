'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import AnaAvatar from '@/components/ana/AnaAvatar';
import AnaIntro from '@/components/ana/AnaIntro';
import { Send, Paperclip, Shield, X } from 'lucide-react';

interface Msg {
  id: string;
  from: 'ana' | 'user' | 'system';
  text: string;
  calm?: boolean;
  typing?: boolean;
}

const CONVERSATION: Omit<Msg, 'id'>[] = [
  { from: 'ana',  text: 'Hola. Soy ANA. Estoy aquí para ayudarte a entender lo que está pasando. Nada de lo que compartas sale de aquí sin tu permiso.' },
  { from: 'ana',  text: '¿Hay algo en una conversación que te haya hecho sentir incómodo/a?' },
  { from: 'user', text: 'Conocí a alguien en un juego hace 3 semanas. Empezó muy lindo, decía cosas bonitas, pero ahora me pide cosas que me incomodan.' },
  { from: 'ana',  text: 'Gracias por contarme. Lo que sientes es válido. Cuando alguien empieza muy intenso y luego cambia, hay un patrón conocido detrás. ¿Puedes contarme qué tipo de cosas te pide?', calm: true },
  { from: 'user', text: 'Quiere que le mande fotos sin ropa. Dice que si lo quiero de verdad lo haría. Y que si lo cuento se va a enojar.' },
  { from: 'ana',  text: 'Lo que describes tiene un nombre. No es amor — es manipulación. Eso que sientes en el estómago tiene razón.', calm: true },
  { from: 'ana',  text: 'Para entender mejor el patrón, ¿puedes pegarme los mensajes o subir una captura? No te identifica a ti. Solo me ayuda a leer su forma de hablar.' },
  { from: 'system', text: 'Captura adjuntada · WhatsApp · 47 mensajes' },
  { from: 'ana',  text: 'Analizando los mensajes…', typing: true },
  { from: 'ana',  text: 'Listo. Detecté 3 patrones que aparecen en casos similares. ¿Quieres ver el análisis completo?' },
];

export default function ChatEscudoPage() {
  const router   = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [showIntro, setShowIntro] = useState(true);
  const [msgs, setMsgs]           = useState<Msg[]>([]);
  const [msgIdx, setMsgIdx]       = useState(0);
  const [showCTA, setShowCTA]     = useState(false);
  const [input, setInput]         = useState('');
  const [anaState, setAnaState]   = useState<'listening' | 'talking' | 'validating' | 'critical'>('talking');
  const bodyRef = useRef<HTMLDivElement>(null);

  /* Stage messages after intro */
  useEffect(() => {
    if (showIntro || msgIdx >= CONVERSATION.length) {
      if (msgIdx >= CONVERSATION.length) setShowCTA(true);
      return;
    }
    const m = CONVERSATION[msgIdx];
    const delay = m.from === 'user' ? 900 : m.typing ? 1400 : 1200;
    const t = setTimeout(() => {
      setMsgs((prev) => [...prev, { ...m, id: `m-${msgIdx}` }]);
      if (m.from === 'ana') setAnaState(m.calm ? 'validating' : 'talking');
      if (m.from === 'user') setAnaState('listening');
      setMsgIdx((i) => i + 1);
    }, 400 + (msgIdx === 0 ? 0 : delay));
    return () => clearTimeout(t);
  }, [showIntro, msgIdx]);

  /* Auto-scroll */
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs]);

  const statusLabel = {
    listening:  'Escuchando · tu ritmo manda',
    talking:    'Respondiendo',
    validating: 'Contigo · sin juicios',
    critical:   'Atención requerida',
  }[anaState];

  return (
    <>
      <AnimatePresence>
        {showIntro && <AnaIntro onDone={() => setShowIntro(false)} />}
      </AnimatePresence>

      {!showIntro && (
        <div style={{ height: '100vh', display: 'flex', overflow: 'hidden', background: 'var(--color-background)' }}>
          {/* Main chat column */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Header */}
            <div style={{ height: 64, padding: '0 20px', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(250,249,247,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--color-border-subtle)', flexShrink: 0 }}>
              <AnaAvatar state={anaState} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                    ANA · Modo Escudo
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, background: 'var(--color-calm-50)', border: '1px solid var(--color-calm-200)', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--color-calm-600)' }}>
                    Paso 1 de 3
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-body)' }}>{statusLabel}</span>
                </div>
              </div>
              <button
                onClick={() => router.push('/joven/silencioso')}
                title="Cierre rápido"
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 999, background: 'var(--color-gray-100)', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}
              >
                <X size={13} /> Cierre rápido
              </button>
            </div>

            {/* Progress bar */}
            <div style={{ height: 3, background: 'var(--color-gray-100)' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: '33%' }} transition={{ duration: 0.8, delay: 0.2 }}
                style={{ height: '100%', background: 'var(--color-calm-400)', borderRadius: '0 2px 2px 0' }} />
            </div>

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
                if (m.typing) {
                  return (
                    <div key={m.id} style={{ display: 'flex', gap: 6, padding: '12px 16px', background: 'white', borderRadius: '18px 18px 18px 4px', alignSelf: 'flex-start', boxShadow: 'var(--shadow-sm)' }}>
                      {[0,1,2].map((i) => (
                        <motion.div key={i} animate={{ y: [0,-5,0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                          style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-calm-300)' }} />
                      ))}
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
                      background: isAna ? (m.calm ? 'rgba(214,191,171,0.22)' : 'white') : 'var(--color-calm-500)',
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

              {/* CTA */}
              <AnimatePresence>
                {showCTA && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                    <button
                      onClick={() => router.push('/joven/analisis')}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 999, background: 'var(--color-calm-500)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 600, boxShadow: '0 4px 16px rgba(91,129,168,0.35)' }}
                    >
                      Ver mi análisis →
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              <div style={{ height: 12 }} />
            </div>

            {/* Input row */}
            <div style={{ padding: '10px 16px 14px', borderTop: '1px solid var(--color-border-subtle)', background: 'white', display: 'flex', gap: 8, alignItems: 'center' }}>
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
                style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--color-calm-500)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Send size={16} color="white" />
              </button>
            </div>
          </div>

          {/* Desktop side panel */}
          {!isMobile && (
            <motion.aside initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
              style={{ width: 272, borderLeft: '1px solid var(--color-border)', padding: '24px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20, background: 'var(--color-gray-50)', flexShrink: 0 }}>

              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-body)', marginBottom: 10 }}>Tips de seguridad</div>
                <div style={{ padding: '12px 14px', borderRadius: 12, background: 'white', border: '1px solid var(--color-border-subtle)', boxShadow: 'var(--shadow-sm)', fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', lineHeight: 1.55 }}>
                  <strong style={{ color: 'var(--color-text-primary)' }}>No borres los mensajes todavía.</strong> Aunque incomoden, son evidencia. ANA te dirá cuándo y cómo guardarlos.
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-body)', marginBottom: 10 }}>Tu progreso</div>
                <div style={{ padding: '12px 14px', borderRadius: 12, background: 'white', border: '1px solid var(--color-border-subtle)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { dot: 'var(--color-sage-500)', label: 'Contexto inicial', status: 'completo' },
                    { dot: 'var(--color-calm-500)', label: 'Compartir evidencia', status: 'en curso' },
                    { dot: 'var(--color-border)', label: 'Análisis y decisiones', status: '', dim: true },
                  ].map((s) => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: s.dim ? 0.45 : 1 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        {s.label}{s.status && <strong style={{ color: 'var(--color-text-primary)' }}> · {s.status}</strong>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-body)', marginBottom: 10 }}>Privacidad</div>
                <div style={{ padding: '12px 14px', borderRadius: 12, background: 'white', border: '1px solid var(--color-border-subtle)', boxShadow: 'var(--shadow-sm)', fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', lineHeight: 1.55 }}>
                  ANA procesa tus mensajes localmente. Nada se sube sin tu consentimiento explícito. Tu identidad nunca se ve.
                </div>
              </div>

              <div style={{ marginTop: 'auto' }}>
                <button onClick={() => router.push('/joven/lineas')}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', borderRadius: 999, background: 'var(--color-terra-50)', border: '1px solid var(--color-terra-200)', color: 'var(--color-terra-600)', fontFamily: 'var(--font-body)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500 }}>
                  <Shield size={13} /> Líneas de emergencia
                </button>
              </div>
            </motion.aside>
          )}
        </div>
      )}
    </>
  );
}
