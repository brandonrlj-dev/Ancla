'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import AnaAvatar from '@/components/ana/AnaAvatar';
import JovenHeader from '@/components/joven/JovenHeader';
import { useAnclaStore } from '@/lib/store';
import { analyzeEscudo } from '@/actions/escudo';
import type { EscudoResult } from '@/actions/escudo';
import {
  Upload, X, CheckCircle2, ArrowRight, MessageCircle,
  ShieldCheck, AlertTriangle, Info, Loader2,
} from 'lucide-react';

// ── Static data ───────────────────────────────────────────────────────────────

const PLATFORMS = [
  'WhatsApp', 'Instagram', 'TikTok', 'Discord',
  'Roblox', 'Minecraft', 'Telegram', 'Facebook', 'Otro',
]

const TIEMPO_OPTIONS = [
  { id: 'hoy',    label: 'Hoy' },
  { id: 'semana', label: 'Esta semana' },
  { id: 'mes',    label: 'Este mes' },
  { id: 'mas',    label: 'Más de un mes' },
]

interface Comportamiento {
  id: string
  label: string
}

const COMPORTAMIENTOS: Comportamiento[] = [
  { id: 'secreto',      label: 'Me pidió que no le contara a nadie que hablamos' },
  { id: 'love_bombing', label: 'Me hizo sentir especial muy rápido, como si me conociera de siempre' },
  { id: 'fotos',        label: 'Me pidió fotos o videos' },
  { id: 'dinero',       label: 'Me ofreció dinero, regalos o seguidores' },
  { id: 'amenaza',      label: 'Me amenazó o me presionó con algo' },
  { id: 'presencia',    label: 'Me pidió que nos viéramos en persona' },
  { id: 'sexual',       label: 'Me habló de temas sexuales' },
  { id: 'edad_falsa',   label: 'Me dijo que era menor pero luego resultó ser mayor' },
]

const PATTERN_LABELS: Record<string, string> = {
  secretismo:          'Secretismo',
  love_bombing:        'Love bombing',
  solicitud_imagen:    'Solicitud de imágenes',
  incentivos:          'Incentivos / regalos',
  amenaza_difusion:    'Amenaza o presión',
  encuentro_personal:  'Cita en persona',
  gradualidad_sexual:  'Escalada sexual',
  identidad_falsa:     'Identidad falsa',
}

// ── Shared style helpers ──────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: 'white',
  borderRadius: 16,
  border: '1px solid var(--color-border-subtle)',
  padding: '20px',
  boxShadow: 'var(--shadow-sm)',
}

const slideVariants = {
  enter: { opacity: 0, x: 32 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -32 },
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function EscudoPage() {
  const router = useRouter()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { setEscudoResult } = useAnclaStore()

  const [step, setStep] = useState(0)   // 0–6

  // Collected data
  const [plataforma, setPlataforma]         = useState('')
  const [tiempoContacto, setTiempoContacto] = useState('')
  const [comportamientos, setComportamientos] = useState<string[]>([])
  const [ocrText, setLocalOcrText]          = useState('')
  const [identificador, setIdentificador]   = useState('')

  // Evidence step
  const [imageFile, setImageFile]       = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [isOcrRunning, setIsOcrRunning] = useState(false)
  const [ocrWordCount, setOcrWordCount] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  // Result
  const [result, setResult] = useState<EscudoResult | null>(null)
  const [isPending, startTransition] = useTransition()

  // ── Step helpers ─────────────────────────────────────────────────────────────

  function next() { setStep((s) => s + 1) }

  function toggleComportamiento(id: string) {
    setComportamientos((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    )
  }

  async function handleImageSelect(file: File) {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
    setImageFile(file)
    setImagePreviewUrl(URL.createObjectURL(file))
    setIsOcrRunning(true)
    try {
      const { extractTextFromImage } = await import('@/lib/ocr')
      const text = await extractTextFromImage(file)
      setLocalOcrText(text)
      setOcrWordCount(text.split(/\s+/).filter(Boolean).length)
    } catch {
      setLocalOcrText('')
    } finally {
      setIsOcrRunning(false)
    }
  }

  function clearImage() {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
    setImageFile(null)
    setImagePreviewUrl(null)
    setLocalOcrText('')
    setOcrWordCount(0)
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) { e.target.value = ''; handleImageSelect(file) }
  }

  function runAnalysis() {
    setStep(5)
    startTransition(async () => {
      try {
        const res = await analyzeEscudo({
          plataforma,
          tiempoContacto,
          comportamientos,
          ocrText: ocrText || undefined,
          identificador: identificador || undefined,
        })
        setResult(res)
        setEscudoResult({
          nivelRiesgo: res.nivelRiesgo,
          score: res.score,
          patronesDetectados: res.patronesDetectados,
          plataforma,
          identificador: identificador || undefined,
          ocrText: ocrText || undefined,
        })
        setStep(6)
      } catch {
        setResult({
          nivelRiesgo: 'BAJO',
          score: 0,
          patronesDetectados: [],
          analisisTexto: 'No pude completar el análisis. Intenta de nuevo o habla con ANA.',
        })
        setStep(6)
      }
    })
  }

  // ── ANA messages per step ────────────────────────────────────────────────────

  const ANA_MESSAGES = [
    'No te preocupes, esto es solo para entender mejor la situación.',
    'Cualquier respuesta está bien — solo elige lo que más se parezca a lo que pasó.',
    'Tómate el tiempo que necesites. No hay respuestas correctas o incorrectas.',
    'Las imágenes solo las lee tu dispositivo. Nunca se suben a ningún servidor.',
    'Con lo que tengas es suficiente. Si no tienes nada, no hay problema.',
    '',
    '',
  ]

  const ANA_STATES: ('listening' | 'talking' | 'validating' | 'critical')[] = [
    'listening', 'listening', 'validating', 'listening', 'listening', 'talking', 'talking',
  ]

  // ── Risk level UI helpers ─────────────────────────────────────────────────────

  function riskColor(nivel: EscudoResult['nivelRiesgo']) {
    if (nivel === 'ALTO')  return { bg: 'var(--color-terra-50)',  border: 'var(--color-terra-300)',  text: 'var(--color-terra-700)',  label: 'Alto' }
    if (nivel === 'MEDIO') return { bg: 'var(--color-sand-50)',   border: 'var(--color-sand-300)',   text: 'var(--color-sand-700)',   label: 'Medio' }
    return                        { bg: 'var(--color-sage-50)',   border: 'var(--color-sage-300)',   text: 'var(--color-sage-700)',   label: 'Bajo' }
  }

  function riskAnaMessage(nivel: EscudoResult['nivelRiesgo']) {
    if (nivel === 'ALTO')  return 'Lo que describes tiene características serias. No estás solo/a — hay personas capacitadas para ayudarte.'
    if (nivel === 'MEDIO') return 'Algunos patrones que describes merecen atención. No estás exagerando al preocuparte.'
    return 'Por ahora no veo señales claras de alarma, pero confía en tu instinto. Puedes volver aquí si algo cambia.'
  }

  // ── Progress bar width ────────────────────────────────────────────────────────

  const progress = Math.round((Math.min(step, 5) / 5) * 100)

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-background)' }}>
      <JovenHeader title="Modo Escudo" back="/joven/modo" />

      {/* Progress bar */}
      <div style={{ height: 3, background: 'var(--color-gray-100)' }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ height: '100%', background: 'var(--color-calm-400)', borderRadius: '0 2px 2px 0' }}
        />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: isMobile ? '24px 20px 40px' : '32px 24px 48px' }}>
        <div style={{ width: '100%', maxWidth: 560 }}>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: 'easeInOut' }}
            >

              {/* ── Steps 0-4: Questionnaire ─────────────────────────────── */}
              {step < 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

                  {/* ANA header */}
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <AnaAvatar state={ANA_STATES[step]} size={56} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)', marginBottom: 4 }}>
                        ANA
                      </div>
                      {ANA_MESSAGES[step] && (
                        <motion.p
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}
                        >
                          {ANA_MESSAGES[step]}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  {/* Step content */}
                  <div style={card}>

                    {/* PASO 1 — Plataforma */}
                    {step === 0 && (
                      <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--color-text-primary)', marginBottom: 20 }}>
                          ¿En qué app o juego conociste a esta persona?
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                          {PLATFORMS.map((p) => (
                            <button
                              key={p}
                              onClick={() => { setPlataforma(p); next() }}
                              style={{
                                padding: '9px 18px',
                                borderRadius: 999,
                                border: `1.5px solid ${plataforma === p ? 'var(--color-calm-500)' : 'var(--color-border)'}`,
                                background: plataforma === p ? 'var(--color-calm-50)' : 'white',
                                color: plataforma === p ? 'var(--color-calm-700)' : 'var(--color-text-primary)',
                                fontFamily: 'var(--font-body)',
                                fontSize: '0.9rem',
                                fontWeight: plataforma === p ? 600 : 400,
                                cursor: 'pointer',
                                transition: 'all 150ms',
                              }}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* PASO 2 — Tiempo de contacto */}
                    {step === 1 && (
                      <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--color-text-primary)', marginBottom: 20 }}>
                          ¿Hace cuánto tiempo empezaron a hablar?
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                          {TIEMPO_OPTIONS.map((t) => (
                            <button
                              key={t.id}
                              onClick={() => { setTiempoContacto(t.label); next() }}
                              style={{
                                padding: '9px 22px',
                                borderRadius: 999,
                                border: `1.5px solid ${tiempoContacto === t.label ? 'var(--color-calm-500)' : 'var(--color-border)'}`,
                                background: tiempoContacto === t.label ? 'var(--color-calm-50)' : 'white',
                                color: tiempoContacto === t.label ? 'var(--color-calm-700)' : 'var(--color-text-primary)',
                                fontFamily: 'var(--font-body)',
                                fontSize: '0.9rem',
                                fontWeight: tiempoContacto === t.label ? 600 : 400,
                                cursor: 'pointer',
                                transition: 'all 150ms',
                              }}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* PASO 3 — Comportamientos */}
                    {step === 2 && (
                      <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--color-text-primary)', marginBottom: 18 }}>
                          ¿Ha hecho alguna de estas cosas?
                        </p>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-text-tertiary)', marginBottom: 16 }}>
                          Selecciona todo lo que aplique
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {COMPORTAMIENTOS.map((c) => {
                            const checked = comportamientos.includes(c.id)
                            return (
                              <label
                                key={c.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: 12,
                                  padding: '12px 14px',
                                  borderRadius: 10,
                                  border: `1.5px solid ${checked ? 'var(--color-calm-400)' : 'var(--color-border-subtle)'}`,
                                  background: checked ? 'var(--color-calm-50)' : 'white',
                                  cursor: 'pointer',
                                  transition: 'all 150ms',
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleComportamiento(c.id)}
                                  style={{ marginTop: 2, accentColor: 'var(--color-calm-500)', flexShrink: 0 }}
                                />
                                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                                  {c.label}
                                </span>
                              </label>
                            )
                          })}
                        </div>
                        <button
                          onClick={next}
                          style={{ marginTop: 20, width: '100%', padding: '12px', borderRadius: 999, background: 'var(--color-calm-500)', color: 'white', border: 'none', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        >
                          {comportamientos.length === 0 ? 'Ninguna de estas' : `Continuar (${comportamientos.length} seleccionadas)`}
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    )}

                    {/* PASO 4 — Evidencia */}
                    {step === 3 && (
                      <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--color-text-primary)', marginBottom: 8 }}>
                          ¿Tienes capturas de pantalla de sus mensajes o su perfil?
                        </p>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-text-tertiary)', marginBottom: 20, lineHeight: 1.6 }}>
                          Las imágenes solo las lee tu dispositivo — nunca se envían a ningún servidor.
                        </p>

                        {/* Upload zone */}
                        {!imageFile ? (
                          <div
                            onClick={() => fileRef.current?.click()}
                            style={{ border: '2px dashed var(--color-border)', borderRadius: 12, padding: '28px 20px', textAlign: 'center', cursor: 'pointer', background: 'var(--color-gray-50)', transition: 'border-color 150ms' }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--color-calm-400)')}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)')}
                          >
                            <Upload size={24} color="var(--color-text-tertiary)" style={{ margin: '0 auto 10px' }} />
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                              Toca para elegir una imagen
                            </p>
                          </div>
                        ) : (
                          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1.5px solid var(--color-border-subtle)' }}>
                            <img
                              src={imagePreviewUrl!}
                              alt="Captura adjunta"
                              style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }}
                            />
                            <button
                              onClick={clearImage}
                              style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <X size={14} color="white" />
                            </button>
                            {isOcrRunning && (
                              <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <Loader2 size={18} color="var(--color-calm-500)" style={{ animation: 'spin 1s linear infinite' }} />
                                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-calm-600)' }}>Leyendo captura…</span>
                              </div>
                            )}
                            {!isOcrRunning && ocrWordCount > 0 && (
                              <div style={{ padding: '8px 12px', background: 'var(--color-calm-50)', borderTop: '1px solid var(--color-calm-100)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <CheckCircle2 size={13} color="var(--color-calm-500)" />
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-calm-600)' }}>
                                  {ocrWordCount} palabras leídas
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileInput} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                          {imageFile && !isOcrRunning && (
                            <button
                              onClick={next}
                              style={{ width: '100%', padding: '12px', borderRadius: 999, background: 'var(--color-calm-500)', color: 'white', border: 'none', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                            >
                              Continuar <ArrowRight size={16} />
                            </button>
                          )}
                          <button
                            onClick={next}
                            style={{ width: '100%', padding: '11px', borderRadius: 999, background: 'transparent', color: 'var(--color-text-secondary)', border: '1.5px solid var(--color-border)', fontFamily: 'var(--font-body)', fontSize: '0.88rem', cursor: 'pointer' }}
                          >
                            No tengo capturas
                          </button>
                        </div>
                      </div>
                    )}

                    {/* PASO 5 — Identificador */}
                    {step === 4 && (
                      <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--color-text-primary)', marginBottom: 8 }}>
                          ¿Sabes cómo identificar a esta persona?
                        </p>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-text-tertiary)', marginBottom: 16, lineHeight: 1.6 }}>
                          Usuario, número de teléfono, nombre — lo que tengas.
                        </p>
                        <input
                          type="text"
                          value={identificador}
                          onChange={(e) => setIdentificador(e.target.value)}
                          placeholder="@usuario, número, nombre..."
                          style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--color-border)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--color-text-primary)', background: 'white', outline: 'none', boxSizing: 'border-box' }}
                          onFocus={(e) => (e.target.style.borderColor = 'var(--color-calm-400)')}
                          onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
                          onKeyDown={(e) => { if (e.key === 'Enter') runAnalysis() }}
                          autoFocus
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                          <button
                            onClick={runAnalysis}
                            disabled={isPending}
                            style={{ width: '100%', padding: '12px', borderRadius: 999, background: 'var(--color-calm-500)', color: 'white', border: 'none', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.95rem', cursor: isPending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: isPending ? 0.6 : 1 }}
                          >
                            Ver análisis <ArrowRight size={16} />
                          </button>
                          <button
                            onClick={() => { setIdentificador(''); runAnalysis() }}
                            style={{ width: '100%', padding: '11px', borderRadius: 999, background: 'transparent', color: 'var(--color-text-secondary)', border: '1.5px solid var(--color-border)', fontFamily: 'var(--font-body)', fontSize: '0.88rem', cursor: 'pointer' }}
                          >
                            No sé / prefiero no decir
                          </button>
                        </div>
                      </div>
                    )}

                  </div>{/* end card */}

                </div>
              )}

              {/* ── Step 5: Loading ──────────────────────────────────────── */}
              {step === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, paddingTop: 48 }}>
                  <AnaAvatar state="talking" size={88} />
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.1rem', color: 'var(--color-text-primary)', marginBottom: 8 }}>
                      Analizando la situación…
                    </p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                      Estoy revisando lo que me contaste para darte una evaluación honesta.
                    </p>
                  </div>
                  <Loader2 size={28} color="var(--color-calm-400)" style={{ animation: 'spin 1s linear infinite' }} />
                </div>
              )}

              {/* ── Step 6: Resultado ────────────────────────────────────── */}
              {step === 6 && result && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                  {/* ANA header with result message */}
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <AnaAvatar state="validating" size={56} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)', marginBottom: 4 }}>
                        ANA
                      </div>
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}
                      >
                        {riskAnaMessage(result.nivelRiesgo)}
                      </motion.p>
                    </div>
                  </div>

                  {/* Risk level badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    style={{ ...card, background: riskColor(result.nivelRiesgo).bg, border: `1.5px solid ${riskColor(result.nivelRiesgo).border}`, display: 'flex', alignItems: 'center', gap: 14 }}
                  >
                    {result.nivelRiesgo === 'ALTO' && <AlertTriangle size={22} color="var(--color-terra-600)" />}
                    {result.nivelRiesgo === 'MEDIO' && <Info size={22} color="var(--color-sand-600)" />}
                    {result.nivelRiesgo === 'BAJO'  && <ShieldCheck size={22} color="var(--color-sage-600)" />}
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: riskColor(result.nivelRiesgo).text, fontWeight: 700, marginBottom: 2 }}>
                        Nivel de riesgo
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: riskColor(result.nivelRiesgo).text }}>
                        {riskColor(result.nivelRiesgo).label}
                      </div>
                    </div>
                  </motion.div>

                  {/* Analysis paragraph */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    style={card}
                  >
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--color-text-primary)', lineHeight: 1.7, margin: 0 }}>
                      {result.analisisTexto}
                    </p>
                  </motion.div>

                  {/* Pattern chips */}
                  {result.patronesDetectados.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                    >
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                        Patrones detectados
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {result.patronesDetectados.map((p) => (
                          <motion.span
                            key={p}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ padding: '5px 14px', borderRadius: 999, background: 'var(--color-terra-100)', color: 'var(--color-terra-700)', border: '1px solid var(--color-terra-200)', fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 500 }}
                          >
                            ⚠ {PATTERN_LABELS[p] ?? p.replace(/_/g, ' ')}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* CTAs */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                  >
                    {(result.nivelRiesgo === 'ALTO' || result.nivelRiesgo === 'MEDIO') && (
                      <button
                        onClick={() => router.push('/joven/ancla')}
                        style={{ width: '100%', padding: '13px', borderRadius: 999, background: 'var(--color-calm-500)', color: 'white', border: 'none', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: 'var(--shadow-calm)' }}
                      >
                        <ShieldCheck size={18} />
                        Quiero reportar este caso
                      </button>
                    )}
                    <button
                      onClick={() => router.push('/joven/chat')}
                      style={{ width: '100%', padding: '12px', borderRadius: 999, background: 'transparent', color: 'var(--color-calm-700)', border: '1.5px solid var(--color-calm-300)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                      <MessageCircle size={16} />
                      Hablar con ANA
                    </button>
                    {result.nivelRiesgo === 'BAJO' && (
                      <button
                        onClick={() => router.push('/joven/ancla')}
                        style={{ width: '100%', padding: '11px', borderRadius: 999, background: 'transparent', color: 'var(--color-text-tertiary)', border: '1.5px solid var(--color-border)', fontFamily: 'var(--font-body)', fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        Reportar de todas formas
                      </button>
                    )}
                  </motion.div>

                </div>
              )}

            </motion.div>
          </AnimatePresence>

        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
