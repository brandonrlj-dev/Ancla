'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import AnaAvatar from '@/components/ana/AnaAvatar';
import AnaIntro from '@/components/ana/AnaIntro';
import { Send, Shield, X, Phone, ArrowRight } from 'lucide-react';
import { useAnclaStore } from '@/lib/store';
import { useInactivityTimer } from '@/hooks/useInactivityTimer';
import { sendMessageToAna } from '@/actions/ana';

const ANA_GREETING =
  'Hola, soy ANA. Estoy aquí para escucharte y orientarte — lo que me cuentes es completamente confidencial. ¿Qué está pasando?';

type ActiveCta = 'escudo' | 'ancla' | 'regulacion' | null;

export default function ChatAnaPage() {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const {
    anaState,
    setAnaState,
    chatMessages,
    addChatMessage,
    sessionToken,
    touchActivity,
  } = useAnclaStore();

  const [showIntro, setShowIntro]       = useState(true);
  const [input, setInput]               = useState('');
  const [isEmergency, setIsEmergency]   = useState(false);
  const [activeCta, setActiveCta]       = useState<ActiveCta>(null);
  const [isPending, startTransition]    = useTransition();
  const bodyRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useInactivityTimer();

  // Seed the greeting on first load (after intro dismissal)
  useEffect(() => {
    if (!showIntro && chatMessages.length === 0) {
      addChatMessage({
        id: crypto.randomUUID(),
        role: 'ana',
        content: ANA_GREETING,
        timestamp: new Date(),
      });
      setAnaState('listening');
    }
  }, [showIntro]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to latest message
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatMessages, isPending]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isPending) return;

    setInput('');
    addChatMessage({ id: crypto.randomUUID(), role: 'user', content: text, timestamp: new Date() });
    touchActivity();
    setAnaState('talking');

    startTransition(async () => {
      try {
        const messagesForServer = useAnclaStore.getState().chatMessages.map(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ({ imageDataUrl: _, ...msg }) => msg,
        );
        const result = await sendMessageToAna({
          messages: messagesForServer,
          userInput: text,
          sessionToken,
        });

        if (result.response) {
          addChatMessage({ id: crypto.randomUUID(), role: 'ana', content: result.response, timestamp: new Date() });
        }

        if (result.hayEmergencia) {
          setIsEmergency(true);
          setAnaState('critical');
          setActiveCta(null);
          return;
        }

        setAnaState('validating');

        // Prioritize: regulacion > escudo > ancla (only one CTA at a time)
        if (result.sugerirRegulacion) setActiveCta('regulacion');
        else if (result.sugerirEscudo) setActiveCta('escudo');
        else if (result.sugerirAncla)  setActiveCta('ancla');

      } catch {
        addChatMessage({
          id: crypto.randomUUID(),
          role: 'ana',
          content: 'Hubo un problema de conexión. Sigo aquí — intenta de nuevo.',
          timestamp: new Date(),
        });
        setAnaState('listening');
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

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
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                  ANA
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: isPending ? '#f59e0b' : '#22c55e', transition: 'background 300ms' }} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-body)' }}>
                    {isPending ? 'ANA está escribiendo…' : statusLabel}
                  </span>
                </div>
              </div>
              <button
                onClick={() => router.push('/joven/silencioso')}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 999, background: 'var(--color-gray-100)', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}
              >
                <X size={13} /> Cierre rápido
              </button>
            </div>

            {/* Emergency banner */}
            <AnimatePresence>
              {isEmergency && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ background: '#fef2f2', borderBottom: '1px solid #fca5a5', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}
                >
                  <Phone size={14} color="#dc2626" />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#dc2626', fontWeight: 600 }}>
                    Línea de la Vida: 800 911 2000 &nbsp;·&nbsp; Emergencias: 911
                  </span>
                  <button
                    onClick={() => router.push('/joven/lineas')}
                    style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: 999, background: '#dc2626', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    Ver todas
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div ref={bodyRef} style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>

              {chatMessages.map((m) => {
                const isAna = m.role === 'ana';
                return (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ alignSelf: isAna ? 'flex-start' : 'flex-end', maxWidth: '80%' }}>
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: isAna ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                      background: isAna
                        ? (isEmergency && anaState === 'critical' ? '#fef2f2' : 'white')
                        : 'var(--color-calm-500)',
                      color: isAna ? 'var(--color-text-primary)' : 'white',
                      fontFamily: 'var(--font-body)', fontSize: '0.9rem', lineHeight: 1.6,
                      boxShadow: isAna ? 'var(--shadow-sm)' : 'none',
                      border: isAna
                        ? `1px solid ${isEmergency && anaState === 'critical' ? '#fca5a5' : 'var(--color-border-subtle)'}`
                        : 'none',
                    }}>
                      {m.content}
                      {isAna && (
                        <div style={{ marginTop: 6, paddingTop: 4, borderTop: '1px solid var(--color-border-subtle)', fontSize: '0.68rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
                          — ANA
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Typing indicator */}
              <AnimatePresence>
                {isPending && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    style={{ alignSelf: 'flex-start' }}
                  >
                    <div style={{ display: 'flex', gap: 6, padding: '12px 16px', background: 'white', borderRadius: '18px 18px 18px 4px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)' }}>
                      {[0, 1, 2].map((i) => (
                        <motion.div key={i}
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                          style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-calm-300)' }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Contextual CTA — one at a time, driven by ANA's suggestion */}
              <AnimatePresence>
                {activeCta && !isEmergency && !isPending && (
                  <motion.div
                    key={activeCta}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}
                  >
                    {activeCta === 'escudo' && (
                      <button
                        onClick={() => router.push('/joven/escudo')}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 999, background: 'var(--color-calm-500)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600, boxShadow: '0 4px 16px rgba(91,129,168,0.30)' }}
                      >
                        Analizar la situación <ArrowRight size={16} />
                      </button>
                    )}
                    {activeCta === 'ancla' && (
                      <button
                        onClick={() => router.push('/joven/ancla')}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 999, background: 'var(--color-calm-500)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600, boxShadow: '0 4px 16px rgba(91,129,168,0.30)' }}
                      >
                        Quiero reportarlo <ArrowRight size={16} />
                      </button>
                    )}
                    {activeCta === 'regulacion' && (
                      <button
                        onClick={() => router.push('/joven/regulacion')}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 999, background: 'var(--color-sage-500)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600, boxShadow: '0 4px 16px rgba(80,120,80,0.25)' }}
                      >
                        Técnica de respiración <ArrowRight size={16} />
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ height: 12 }} />
            </div>

            {/* Input row */}
            <div style={{ padding: '10px 16px 14px', borderTop: '1px solid var(--color-border-subtle)', background: 'white', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isPending}
                placeholder={isPending ? 'ANA está respondiendo…' : 'Escribe algo…'}
                style={{ flex: 1, padding: '10px 16px', borderRadius: 999, border: '1.5px solid var(--color-border)', background: isPending ? 'var(--color-gray-100)' : 'var(--color-gray-50)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none', color: 'var(--color-text-primary)', transition: 'background 200ms' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isPending}
                style={{ width: 38, height: 38, borderRadius: '50%', background: input.trim() && !isPending ? 'var(--color-calm-500)' : 'var(--color-gray-200)', border: 'none', cursor: input.trim() && !isPending ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 200ms' }}
              >
                <Send size={16} color={input.trim() && !isPending ? 'white' : 'var(--color-text-tertiary)'} />
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
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-body)', marginBottom: 10 }}>Privacidad</div>
                <div style={{ padding: '12px 14px', borderRadius: 12, background: 'white', border: '1px solid var(--color-border-subtle)', boxShadow: 'var(--shadow-sm)', fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', lineHeight: 1.55 }}>
                  Esta conversación vive solo en tu dispositivo. Nada se sube sin tu permiso. Tu identidad nunca se ve.
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
