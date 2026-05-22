'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import AnaAvatar from '@/components/ana/AnaAvatar';
import AnaIntro from '@/components/ana/AnaIntro';
import { Send, Paperclip, Shield, X, Phone, ImagePlus } from 'lucide-react';
import { useAnclaStore } from '@/lib/store';
import { useInactivityTimer } from '@/hooks/useInactivityTimer';
import { sendMessageToAna } from '@/actions/ana';
import { startAnalysisJob } from '@/actions/analysis';

const ANA_GREETING =
  'Hola. Soy ANA. Estoy aquí para ayudarte a entender lo que está pasando. Nada de lo que compartas sale de aquí sin tu permiso. ¿Hay algo en una conversación que te haya hecho sentir incómodo/a?';

export default function ChatEscudoPage() {
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
    addAnalysisPatterns,
    setAnalysisJobId,
    setOcrText,
  } = useAnclaStore();

  const [showIntro, setShowIntro]   = useState(true);
  const [input, setInput]           = useState('');
  const [showCTA, setShowCTA]       = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [isOcrRunning, setIsOcrRunning] = useState(false);
  const [ocrLabel, setOcrLabel]         = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [isPending, startTransition]    = useTransition();
  const bodyRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef  = useRef<HTMLInputElement>(null);

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
    if (!text && !pendingImage) return;
    if (isPending || isOcrRunning) return;

    setInput('');

    // Capture the pending image before clearing it
    const imageFile = pendingImage ?? null;
    if (imageFile) clearPendingImage();

    // Add user message immediately so the chat feels responsive
    const displayContent = text
      ? text + (imageFile ? ' 📎' : '')
      : '📎 Adjunté una captura de pantalla';
    addChatMessage({ id: crypto.randomUUID(), role: 'user', content: displayContent, timestamp: new Date() });
    touchActivity();
    setAnaState('talking');

    // If there's an image: run OCR synchronously before sending to ANA.
    // ANA needs the text to apply the psychological protocol (ask context, etc.)
    let captureText = '';
    if (imageFile) {
      setIsOcrRunning(true);
      setOcrLabel('Leyendo captura…');
      try {
        const { extractTextFromImage } = await import('@/lib/ocr');
        captureText = await extractTextFromImage(imageFile);
        setOcrText(captureText);
        const wc = captureText.split(/\s+/).filter(Boolean).length;
        setOcrLabel(`Captura leída · ${wc} palabras`);
      } catch {
        setOcrLabel('No se pudo leer la imagen.');
      } finally {
        setIsOcrRunning(false);
      }
    }

    startTransition(async () => {
      try {
        const result = await sendMessageToAna({
          messages: useAnclaStore.getState().chatMessages,
          userInput: text || '(El joven compartió una captura de pantalla)',
          sessionToken,
          mode: 'escudo',
          captureText: captureText || undefined,
        });

        addChatMessage({ id: crypto.randomUUID(), role: 'ana', content: result.response, timestamp: new Date() });
        setOcrLabel(null); // ANA already processed the screenshot — clear the chip
        setRiskLevel(Math.min(100, Math.max(0, riskLevel + result.riskDelta)));

        if (result.isEmergency) {
          setIsEmergency(true);
          setAnaState('critical');
        } else {
          setAnaState('validating');
        }

        if (result.newPatterns.length > 0) addAnalysisPatterns(result.newPatterns);

        if (result.sugerirAnalisis) {
          setShowCTA(true);
          // ANA decided there's enough context — start analysis job now
          const textForJob = captureText || useAnclaStore.getState().ocrText || '';
          if (textForJob) {
            const context = `Nivel de riesgo: ${riskLevel}/100. Mensajes: ${chatMessages.length}.`;
            try {
              const { jobId } = await startAnalysisJob({ ocrText: textForJob, conversationContext: context, sessionToken });
              setAnalysisJobId(jobId);
            } catch (err) {
              console.error('[chat] startAnalysisJob:', err);
            }
          }
        }
      } catch {
        addChatMessage({ id: crypto.randomUUID(), role: 'ana', content: 'Hubo un problema de conexión. Sigo aquí — intenta de nuevo.', timestamp: new Date() });
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

  function setPendingFile(file: File) {
    if (pendingImageUrl) URL.revokeObjectURL(pendingImageUrl);
    setPendingImage(file);
    setPendingImageUrl(URL.createObjectURL(file));
  }

  function clearPendingImage() {
    if (pendingImageUrl) URL.revokeObjectURL(pendingImageUrl);
    setPendingImage(null);
    setPendingImageUrl(null);
  }



  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setPendingFile(file);
  }

  function handleInputPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) setPendingFile(file);
        return;
      }
    }
    // No image — let default text paste proceed normally
  }

  const statusLabel = {
    listening: 'Escuchando · tu ritmo manda',
    talking: 'Respondiendo',
    validating: 'Contigo · sin juicios',
    critical: 'Atención requerida',
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

            {/* Progress bar */}
            <div style={{ height: 3, background: 'var(--color-gray-100)' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: '33%' }} transition={{ duration: 0.8, delay: 0.2 }}
                style={{ height: '100%', background: 'var(--color-calm-400)', borderRadius: '0 2px 2px 0' }} />
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

              {/* CTA */}
              <AnimatePresence>
                {showCTA && !isEmergency && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                    <button
                      onClick={() => router.push('/joven/analisis')}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 999, background: 'var(--color-calm-500)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 600, boxShadow: '0 4px 16px rgba(91,129,168,0.35)' }}
                    >
                      Ver mi análisis →
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* OCR status chip */}
              <AnimatePresence>
                {ocrLabel && (
                  <motion.div
                    key="ocr"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ alignSelf: 'center', padding: '5px 12px', background: 'var(--color-calm-50)', border: '1px solid var(--color-calm-200)', borderRadius: 99, fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--color-calm-600)' }}
                  >
                    {ocrLabel}
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ height: 12 }} />
            </div>

            {/* Image preview — shown after paste/select, before user sends */}
            <AnimatePresence>
              {pendingImage && pendingImageUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ padding: '8px 16px 0', background: 'white', borderTop: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={pendingImageUrl} alt="Captura pendiente" style={{ height: 56, width: 'auto', borderRadius: 8, border: '1px solid var(--color-border)', objectFit: 'cover', display: 'block' }} />
                    <button
                      onClick={clearPendingImage}
                      style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: 'var(--color-text-primary)', border: 'none', cursor: 'pointer', color: 'white', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                    >×</button>
                  </div>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>
                    Captura lista · presiona enviar para procesar
                  </span>
                </motion.div>
              )}
            </AnimatePresence>



            {/* Input row */}
            <div style={{ padding: '10px 16px 14px', borderTop: '1px solid var(--color-border-subtle)', background: 'white', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
              {/* Hidden file input — OCR processes locally, image never leaves device */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={isOcrRunning || isPending}
                title={ocrLabel ?? 'Adjuntar captura de pantalla'}
                style={{ width: 38, height: 38, borderRadius: '50%', background: isOcrRunning ? 'var(--color-calm-50)' : 'var(--color-gray-100)', border: isOcrRunning ? '1px solid var(--color-calm-200)' : 'none', cursor: isOcrRunning ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 200ms' }}
              >
                {isOcrRunning
                  ? <Paperclip size={16} color="var(--color-calm-400)" style={{ animation: 'pulse 1s ease-in-out infinite' }} />
                  : <ImagePlus size={16} color="var(--color-text-tertiary)" />
                }
              </button>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handleInputPaste}
                disabled={isPending}
                placeholder={isPending ? 'ANA está respondiendo…' : 'Escribe o pega captura (Ctrl+V)…'}
                style={{ flex: 1, padding: '10px 16px', borderRadius: 999, border: '1.5px solid var(--color-border)', background: isPending ? 'var(--color-gray-100)' : 'var(--color-gray-50)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none', color: 'var(--color-text-primary)', transition: 'background 200ms' }}
              />
              <button
                onClick={handleSend}
                disabled={(!input.trim() && !pendingImage) || isPending}
                style={{ width: 38, height: 38, borderRadius: '50%', background: (input.trim() || pendingImage) && !isPending ? 'var(--color-calm-500)' : 'var(--color-gray-200)', border: 'none', cursor: (input.trim() || pendingImage) && !isPending ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 200ms' }}
              >
                <Send size={16} color={(input.trim() || pendingImage) && !isPending ? 'white' : 'var(--color-text-tertiary)'} />
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
