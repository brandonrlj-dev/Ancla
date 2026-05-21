'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import AnaAvatar from '@/components/ana/AnaAvatar';
import AnaIntro from '@/components/ana/AnaIntro';
import { Send, Paperclip, Phone, X, ArrowRight } from 'lucide-react';
import { useAnclaStore } from '@/lib/store';
import { useInactivityTimer } from '@/hooks/useInactivityTimer';
import { sendMessageToAna } from '@/actions/ana';

const ANA_GREETING_SALVAVIDAS =
  'Estoy aquí. Antes de nada — ¿estás en un lugar físicamente seguro ahora mismo?';

export default function ChatSalvavidasPage() {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const {
    anaState,
    setAnaState,
    chatMessages,
    addChatMessage,
    riskLevel,
    setRiskLevel,
    sessionToken,
    touchActivity,
    setAnalysisPatterns,
  } = useAnclaStore();

  const [showIntro, setShowIntro] = useState(true);
  const [stabilized, setStabilized] = useState(false);
  const [input, setInput] = useState('');
  const [showCTA, setShowCTA] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [isPending, startTransition] = useTransition();
  const bodyRef = useRef<HTMLDivElement>(null);

  useInactivityTimer();

  // Seed greeting once chat becomes active
  useEffect(() => {
    if (stabilized && chatMessages.length === 0) {
      addChatMessage({
        id: crypto.randomUUID(),
        role: 'ana',
        content: ANA_GREETING_SALVAVIDAS,
        timestamp: new Date(),
      });
      setAnaState('listening');
    }
  }, [stabilized]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatMessages, isPending]);

  function handleSend() {
    const text = input.trim();
    if (!text || isPending) return;
    setInput('');

    addChatMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    });
    touchActivity();
    setAnaState('talking');

    startTransition(async () => {
      try {
        const result = await sendMessageToAna({
          messages: chatMessages,
          userInput: text,
          sessionToken,
          mode: 'salvavidas',
        });

        addChatMessage({
          id: crypto.randomUUID(),
          role: 'ana',
          content: result.response,
          timestamp: new Date(),
        });

        setRiskLevel(Math.min(100, Math.max(0, riskLevel + result.riskDelta)));

        if (result.isEmergency) {
          setIsEmergency(true);
          setAnaState('critical');
        } else {
          setAnaState('validating');
        }

        if (result.newPatterns.length > 0) setAnalysisPatterns(result.newPatterns);
        if (result.sugerirAnalisis) setShowCTA(true);
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const statusLabel = {
    listening: 'Escuchando · tu ritmo manda',
    talking: 'Respondiendo',
    validating: 'Contigo · sin juicios',
    critical: 'Atención requerida',
  }[anaState];

  /* ── STEP 1: Intro ─────────────────────────────────────────────────────── */
  if (showIntro) {
    return <AnaIntro onDone={() => setShowIntro(false)} />;
  }

  /* ── STEP 2: Stabilization breathing ───────────────────────────────────── */
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

        <div style={{ position: 'relative', width: 160, height: 160, marginBottom: 32 }}>
          {[0, 1].map((i) => (
            <motion.div key={i}
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

  /* ── STEP 3: Chat ───────────────────────────────────────────────────────── */
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

      {/* Progress */}
      <div style={{ height: 3, background: 'var(--color-gray-100)' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: '20%' }} transition={{ duration: 0.8 }}
          style={{ height: '100%', background: 'var(--color-terra-400)', borderRadius: '0 2px 2px 0' }} />
      </div>

      {/* Urgent 911 banner */}
      <button
        onClick={() => router.push('/joven/lineas')}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', background: isEmergency ? '#fef2f2' : 'var(--color-terra-50)', border: 'none', borderBottom: `1px solid ${isEmergency ? '#fca5a5' : 'var(--color-terra-200)'}`, cursor: 'pointer', flexShrink: 0, transition: 'background 300ms' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Phone size={14} color={isEmergency ? '#dc2626' : 'var(--color-terra-500)'} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: isEmergency ? '#dc2626' : 'var(--color-terra-600)', fontWeight: isEmergency ? 700 : 500 }}>
            {isEmergency ? 'EMERGENCIA — Llama al 800 911 2000 o al 911 ahora' : 'Llamar al 911 si hay peligro físico'}
          </span>
        </div>
        <ArrowRight size={13} color={isEmergency ? '#dc2626' : 'var(--color-terra-400)'} />
      </button>

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
                background: isAna ? 'white' : 'var(--color-terra-500)',
                color: isAna ? 'var(--color-text-primary)' : 'white',
                fontFamily: 'var(--font-body)', fontSize: '0.9rem', lineHeight: 1.6,
                boxShadow: isAna ? 'var(--shadow-sm)' : 'none',
                border: isAna ? '1px solid var(--color-border-subtle)' : 'none',
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
            <motion.div key="typing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} style={{ alignSelf: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 6, padding: '12px 16px', background: 'white', borderRadius: '18px 18px 18px 4px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-subtle)' }}>
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                    style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-terra-300)' }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
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
        <button
          title="Adjuntar captura (disponible en el análisis)"
          style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--color-gray-100)', border: 'none', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: 0.5 }}
        >
          <Paperclip size={16} color="var(--color-text-tertiary)" />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isPending}
          placeholder={isPending ? 'ANA está respondiendo…' : 'Escribe aquí o pega los mensajes…'}
          style={{ flex: 1, padding: '10px 16px', borderRadius: 999, border: '1.5px solid var(--color-border)', background: isPending ? 'var(--color-gray-100)' : 'var(--color-gray-50)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none', color: 'var(--color-text-primary)', transition: 'background 200ms' }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isPending}
          style={{ width: 38, height: 38, borderRadius: '50%', background: input.trim() && !isPending ? 'var(--color-terra-500)' : 'var(--color-gray-200)', border: 'none', cursor: input.trim() && !isPending ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 200ms' }}
        >
          <Send size={16} color={input.trim() && !isPending ? 'white' : 'var(--color-text-tertiary)'} />
        </button>
      </div>
    </div>
  );
}
