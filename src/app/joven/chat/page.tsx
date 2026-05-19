'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import AnaAvatar from '@/components/ana/AnaAvatar';
import AnaIntro from '@/components/ana/AnaIntro';
import JovenHeader from '@/components/joven/JovenHeader';
import { mockAnaConversation } from '@/lib/mock-data';
import { useAnclaStore } from '@/lib/store';
import type { AnaState } from '@/lib/store';
import { Send, Shield, Phone, BookOpen } from 'lucide-react';

interface Msg { id: string; role: 'user' | 'ana'; content: string; }

/* Determine ANA state from message content */
function inferAnaState(msg: Msg | undefined): AnaState {
  if (!msg || msg.role === 'user') return 'listening';
  const content = msg.content.toLowerCase();
  if (content.includes('miedo') || content.includes('asustada') || content.includes('ayuda ahora')) return 'validating';
  if (content.includes('instinto') || content.includes('valiente') || content.includes('importante')) return 'validating';
  if (content.includes('grooming') || content.includes('amenaza') || content.includes('sextorsión')) return 'critical';
  return 'listening';
}

export default function ChatPage() {
  const isMobile     = useMediaQuery('(max-width: 768px)');
  const [showIntro, setShowIntro] = useState(true);
  const [isTyping, setIsTyping]   = useState(false);
  const [input, setInput]         = useState('');
  const messagesEndRef             = useRef<HTMLDivElement>(null);
  const { anaState, setAnaState } = useAnclaStore();

  /* Pre-load mock conversation */
  const [msgs, setMsgs] = useState<Msg[]>(() =>
    mockAnaConversation.map((m, i) => ({
      id: `init-${i}`,
      role: m.role,
      content: m.content,
    }))
  );

  /* Sync ANA header state with last message */
  useEffect(() => {
    const last = msgs[msgs.length - 1];
    setAnaState(inferAnaState(last));
  }, [msgs, setAnaState]);

  /* Auto-scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, isTyping]);

  const handleIntroDown = useCallback(() => setShowIntro(false), []);

  async function sendMessage() {
    const text = input.trim();
    if (!text) return;
    setInput('');

    const userMsg: Msg = { id: Date.now().toString(), role: 'user', content: text };
    setMsgs((prev) => [...prev, userMsg]);
    setAnaState('talking');
    setIsTyping(true);

    /* Simulate ANA response */
    await new Promise((r) => setTimeout(r, 2000 + Math.random() * 1000));
    setIsTyping(false);

    const anaResponses = [
      'Entiendo lo que me dices. ¿Puedes contarme un poco más sobre cómo te hizo sentir eso?',
      'Gracias por confiarme esto. Lo que describes es importante, y tus sentimientos son completamente válidos.',
      'Estoy aquí contigo. No tienes que enfrentar esto sola. ¿Quieres que hablemos de qué opciones tienes?',
      'Eso que sientes tiene mucho sentido dado lo que estás viviendo. No es tu culpa.',
    ];
    const anaMsg: Msg = {
      id: (Date.now() + 1).toString(),
      role: 'ana',
      content: anaResponses[Math.floor(Math.random() * anaResponses.length)],
    };
    setMsgs((prev) => [...prev, anaMsg]);
    setAnaState('listening');
  }

  return (
    <>
      {/* AnaIntro overlay */}
      <AnimatePresence>
        {showIntro && <AnaIntro onDone={handleIntroDown} />}
      </AnimatePresence>

      {/* Chat UI */}
      <AnimatePresence>
        {!showIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-background)' }}
          >
            {/* Header with ANA avatar */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                height: 64,
                padding: '0 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'rgba(250,249,247,0.92)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--color-border-subtle)',
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => setShowIntro(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
              >
                <AnaAvatar state={anaState} size={40} />
              </button>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                  ANA
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-calm-500)', fontFamily: 'var(--font-body)' }}>
                  {{
                    listening:  'Escuchando',
                    talking:    'Escribiendo...',
                    validating: 'Contigo',
                    critical:   'Atenta',
                  }[anaState]}
                </div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, background: 'var(--color-sage-50)', border: '1px solid var(--color-sage-200)' }}>
                  <Shield size={12} color="var(--color-sage-600, #4a6148)" />
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-sage-700)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                    Privado
                  </span>
                </div>
              </div>
            </motion.div>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {/* Messages */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '20px 20px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                {msgs.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i < 5 ? i * 0.15 : 0, duration: 0.4 }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      gap: 4,
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '78%',
                        padding: '12px 16px',
                        borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        background: msg.role === 'user' ? 'var(--color-calm-500)' : 'white',
                        color: msg.role === 'user' ? 'white' : 'var(--color-text-primary)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.92rem',
                        lineHeight: 1.55,
                        boxShadow: msg.role === 'ana' ? 'var(--shadow-sm)' : 'none',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {msg.content}
                      {msg.role === 'ana' && (
                        <div style={{
                          marginTop: 8,
                          paddingTop: 6,
                          borderTop: '1px solid var(--color-border-subtle)',
                          fontSize: '0.7rem',
                          color: 'var(--color-text-tertiary)',
                          fontFamily: 'var(--font-body)',
                          fontStyle: 'italic',
                        }}>
                          — ANA
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}
                    >
                      <div style={{ display: 'flex', gap: 4, padding: '12px 16px', background: 'white', borderRadius: '18px 18px 18px 4px', boxShadow: 'var(--shadow-sm)' }}>
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                            style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-calm-300)' }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} style={{ height: 20 }} />
              </div>

              {/* Desktop sidebar */}
              {!isMobile && (
                <motion.aside
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  style={{
                    width: 260,
                    borderLeft: '1px solid var(--color-border)',
                    padding: '24px 20px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 20,
                    background: 'var(--color-gray-50)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-body)', marginBottom: 10 }}>
                      Tu ANA de hoy
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <AnaAvatar state={anaState} size={56} />
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>ANA</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
                          Asistente empática
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ height: 1, background: 'var(--color-border)' }} />

                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-body)', marginBottom: 10 }}>
                      Recursos de apoyo
                    </div>
                    {[
                      { icon: Phone, label: 'Línea de crisis', desc: '800 290 0024', color: 'var(--color-terra-500)' },
                      { icon: Shield, label: 'Policía Cibernética', desc: '088', color: 'var(--color-calm-500)' },
                      { icon: BookOpen, label: 'Guía de seguridad', desc: 'Ver recursos', color: 'var(--color-sage-500)' },
                    ].map(({ icon: Icon, label, desc, color }) => (
                      <div
                        key={label}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '10px 12px',
                          borderRadius: 10,
                          marginBottom: 6,
                          background: 'white',
                          boxShadow: 'var(--shadow-sm)',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={15} color={color} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, fontFamily: 'var(--font-body)', color: 'var(--color-text-primary)' }}>{label}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>{desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 'auto', padding: '12px', borderRadius: 10, background: 'var(--color-sage-50)', border: '1px solid var(--color-sage-200)' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-sage-700)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
                      Tu conversación es confidencial. Solo se comparte información si hay riesgo para tu seguridad.
                    </p>
                  </div>
                </motion.aside>
              )}
            </div>

            {/* Input area */}
            <div
              style={{
                padding: '12px 20px 16px',
                borderTop: '1px solid var(--color-border-subtle)',
                background: 'white',
                display: 'flex',
                gap: 10,
                alignItems: 'flex-end',
              }}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Escribe aquí... (Enter para enviar)"
                rows={1}
                style={{
                  flex: 1,
                  resize: 'none',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: 20,
                  padding: '10px 16px',
                  fontSize: '0.92rem',
                  fontFamily: 'var(--font-body)',
                  outline: 'none',
                  background: 'var(--color-gray-50)',
                  color: 'var(--color-text-primary)',
                  lineHeight: 1.5,
                  maxHeight: 100,
                  transition: 'border-color 200ms',
                }}
                onFocus={(e) => { (e.currentTarget.style.borderColor = 'var(--color-calm-400)'); }}
                onBlur={(e) => { (e.currentTarget.style.borderColor = 'var(--color-border)'); }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                aria-label="Enviar mensaje"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: input.trim() ? 'var(--color-calm-500)' : 'var(--color-gray-200)',
                  border: 'none',
                  cursor: input.trim() ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 200ms',
                }}
              >
                <Send size={18} color={input.trim() ? 'white' : 'var(--color-gray-400)'} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
