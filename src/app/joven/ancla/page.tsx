'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import AnaAvatar from '@/components/ana/AnaAvatar';
import JovenHeader from '@/components/joven/JovenHeader';
import { useAnclaStore } from '@/lib/store';
import { submitReport } from '@/actions/report';
import type { AnaState } from '@/lib/store';
import {
  ArrowRight, Shield, Users, CheckCircle, Phone,
  Upload, X, CheckCircle2, Loader2, Download, AlertTriangle,
} from 'lucide-react';

// ── Static data ───────────────────────────────────────────────────────────────

const PLATFORMS = [
  'WhatsApp', 'Instagram', 'TikTok', 'Facebook',
  'Snapchat', 'Telegram', 'Discord', 'Roblox',
  'Minecraft', 'Free Fire', 'Otra',
]

const TIPO_ABUSO_OPTIONS = [
  { id: 'grooming',    label: 'Grooming',    desc: 'Manipulación para ganarse mi confianza' },
  { id: 'sextorsion',  label: 'Sextorsión',  desc: 'Me pidieron imágenes o me amenazaron' },
  { id: 'acoso',       label: 'Acoso',       desc: 'Mensajes repetidos no deseados' },
  { id: 'otro',        label: 'Otro',        desc: 'Algo que no encaja en las anteriores' },
]

const PATTERN_LABELS: Record<string, string> = {
  love_bombing:          'Love bombing',
  secretismo:            'Secretismo',
  solicitud_imagen:      'Solicitud de imágenes',
  amenaza_difusion:      'Amenaza de difusión',
  presion:               'Presión repetida',
  manipulacion_emocional:'Manipulación emocional',
  incentivos:            'Incentivos / regalos',
  encuentro_personal:    'Cita en persona',
  gradualidad_sexual:    'Escalada sexual',
  identidad_falsa:       'Identidad falsa',
  aislamiento:           'Aislamiento',
}

function labelFor(k: string) { return PATTERN_LABELS[k] ?? k.replace(/_/g, ' ') }

function derivePatternsFromTypes(tipos: string[]): string[] {
  const result: string[] = []
  if (tipos.includes('grooming'))   result.push('love_bombing', 'secretismo')
  if (tipos.includes('sextorsion')) result.push('solicitud_imagen', 'amenaza_difusion')
  if (tipos.includes('acoso'))      result.push('presion', 'manipulacion_emocional')
  return result
}

async function computeHash(input: string): Promise<{ folio: string; hex: string }> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  const hex = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
  return { folio: 'A-' + hex.slice(0, 6).toUpperCase(), hex }
}

// ── Shared style helpers ──────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: 'white',
  borderRadius: 16,
  border: '1px solid var(--color-border-subtle)',
  padding: '18px',
  boxShadow: 'var(--shadow-sm)',
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InlineError({ msg }: { msg: string }) {
  if (!msg) return null
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, padding: '10px 12px', borderRadius: 10, background: 'var(--color-terra-50)', border: '1px solid var(--color-terra-200)' }}>
      <AlertTriangle size={13} color="var(--color-terra-500)" style={{ flexShrink: 0, marginTop: 2 }} />
      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-terra-700)', lineHeight: 1.5 }}>{msg}</span>
    </div>
  )
}

function DocSummary({
  open, onToggle, folio, hashHex, allPatterns, plataforma, today,
}: {
  open: boolean; onToggle: () => void
  folio: string; hashHex: string; allPatterns: string[]; plataforma: string; today: string
}) {
  return (
    <div style={card}>
      <button onClick={onToggle} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>Resumen del documento</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-calm-500)' }}>{open ? 'Ocultar ▲' : 'Ver ▼'}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 14 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--color-calm-50)', border: '1px solid var(--color-calm-200)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-calm-600)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Folio</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>{folio || '…'}</div>
              </div>
              {plataforma && (
                <div style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--color-gray-50)', border: '1px solid var(--color-border-subtle)', fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  Plataforma: <strong>{plataforma}</strong>
                </div>
              )}
              {allPatterns.length > 0 && (
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Patrones</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {allPatterns.map((p) => (
                      <span key={p} style={{ padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', fontFamily: 'var(--font-body)', background: 'var(--color-terra-100)', color: 'var(--color-terra-700)', border: '1px solid var(--color-terra-200)' }}>
                        {labelFor(p)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-text-tertiary)', marginBottom: 2 }}>
                Hash: <span style={{ wordBreak: 'break-all' }}>{hashHex ? `sha256:${hashHex.slice(0, 24)}…` : 'Calculando…'}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--color-text-tertiary)', borderTop: '1px solid var(--color-border-subtle)', paddingTop: 8 }}>
                {today} · ancla.vercel.app
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AnclaPage() {
  const router = useRouter()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { escudoResult, sessionToken, setReporteId, setFolio: storeFolio, setHashHex: storeHashHex } = useAnclaStore()

  // ── Step state ───────────────────────────────────────────────────────────────
  // Steps: 0=ruta, 1=plataforma, 2=tipo, 3=agresor, 4=evidencia, 5=familiar(legal), 6=confirmar, 7=éxito
  const [step, setStep]           = useState(0)
  const [direction, setDirection] = useState(1)
  const [avatarState, setAvatarState] = useState<AnaState>('listening')

  // ── Form state — preloaded from Escudo result if available ───────────────────
  const [ruta,             setRuta]             = useState<'privado' | 'legal' | null>(null)
  const [plataforma,       setPlataforma]       = useState(escudoResult?.plataforma ?? '')
  const [tipoAbuso,        setTipoAbuso]        = useState<string[]>([])
  const [identificador,    setIdentificador]    = useState(escudoResult?.identificador ?? '')
  const [municipio,        setMunicipio]        = useState('')
  const [localOcrText,     setLocalOcrText]     = useState(escudoResult?.ocrText ?? '')
  const [imageFile,        setImageFile]        = useState<File | null>(null)
  const [imagePreviewUrl,  setImagePreviewUrl]  = useState<string | null>(null)
  const [isOcrRunning,     setIsOcrRunning]     = useState(false)
  const [ocrWordCount,     setOcrWordCount]     = useState(
    escudoResult?.ocrText ? escudoResult.ocrText.split(/\s+/).filter(Boolean).length : 0,
  )
  const [nombreFamiliar,   setNombreFamiliar]   = useState('')
  const [contactoFamiliar, setContactoFamiliar] = useState('')
  const [folio,            setFolio]            = useState('')
  const [hashHex,          setHashHex]          = useState('')
  const [summaryOpen,      setSummaryOpen]      = useState(false)
  const [error,            setError]            = useState('')
  const [nombreFamiliarSent, setNombreFamiliarSent] = useState('')
  const [isPending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  const today = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })

  // Merge patterns from escudoResult + tipo abuso selection
  const allPatterns = Array.from(new Set([
    ...(escudoResult?.patronesDetectados ?? []),
    ...derivePatternsFromTypes(tipoAbuso),
  ]))

  // ── Navigation helpers ───────────────────────────────────────────────────────

  function goTo(next: number) {
    setDirection(next > step ? 1 : -1)
    setError('')
    setStep(next)
  }

  function handleNext() {
    if (step === 0) { /* route selection handles navigation itself */ return }
    if (step === 1 && !plataforma) { setError('Selecciona la plataforma donde ocurrió.'); return }
    if (step === 4) {
      // After evidence: skip familiar step if privado
      goTo(ruta === 'legal' ? 5 : 6)
      ensureHash()
      return
    }
    if (step === 5 && ruta === 'legal' && !contactoFamiliar.trim()) {
      setError('Ingresa el contacto de tu familiar para continuar.')
      return
    }
    goTo(step + 1)
    if (step === 5) ensureHash()
  }

  function handleBack() {
    if (step === 6 && ruta === 'privado') { goTo(4); return }
    if (step > 0) goTo(step - 1)
    else router.push('/joven/modo')
  }

  async function ensureHash() {
    if (folio && hashHex) return
    const input = sessionToken + allPatterns.join(',')
    const { folio: f, hex } = await computeHash(input)
    setFolio(f); setHashHex(hex)
    storeFolio(f); storeHashHex(hex)
  }

  // ── Evidence / OCR ───────────────────────────────────────────────────────────

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
      /* OCR failed silently — evidence still attached */
    } finally {
      setIsOcrRunning(false)
    }
  }

  function clearImage() {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
    setImageFile(null)
    setImagePreviewUrl(null)
    // Don't clear localOcrText if it came from escudoResult
    if (!escudoResult?.ocrText) { setLocalOcrText(''); setOcrWordCount(0) }
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  function handleSubmit() {
    if (ruta === 'legal' && !contactoFamiliar.trim()) {
      setError('Ingresa el contacto de tu familiar para continuar.')
      return
    }
    setError('')
    setAvatarState('talking')
    setNombreFamiliarSent(nombreFamiliar)

    startTransition(async () => {
      try {
        let f = folio; let h = hashHex
        if (!f || !h) {
          const result = await computeHash(sessionToken + allPatterns.join(','))
          f = result.folio; h = result.hex
          setFolio(f); setHashHex(h); storeFolio(f); storeHashHex(h)
        }

        const result = await submitReport({
          folio: f,
          hashSha256: `sha256:${h}`,
          patterns: allPatterns,
          plataforma,
          identificador: identificador.trim() || undefined,
          municipio: municipio || undefined,
          tipoReporte: ruta!,
          contactoFamiliar: ruta === 'legal' ? contactoFamiliar.trim() : undefined,
          nombreFamiliar: nombreFamiliar.trim() || undefined,
          sessionToken,
        })
        setReporteId(result.reporteId)
        setAvatarState('validating')
        goTo(7)
      } catch (err) {
        const msg = err instanceof Error ? err.message : ''
        if (msg.includes('duplicate') || msg.includes('unique')) {
          goTo(7)
        } else {
          setError('No pudimos enviar tu reporte. Intenta de nuevo en unos segundos.')
          setAvatarState('listening')
        }
      }
    })
  }

  // ── Render helpers ────────────────────────────────────────────────────────────

  const progress = Math.max(0, Math.min(100, (step / 6) * 100))

  const ANA_MESSAGES: Record<number, string> = {
    0: 'Aquí decides cómo quieres continuar. No hay una opción incorrecta.',
    1: 'Saber dónde pasó nos ayuda a encontrar patrones.',
    2: 'Puedes seleccionar más de una si aplica.',
    3: 'Con lo que tengas es suficiente. Si no sabes nada, puedes dejarlo vacío.',
    4: 'Las imágenes solo las lee tu dispositivo — nunca se envían a ningún servidor.',
    5: 'Vamos con cuidado. Sabemos que esta parte puede ser difícil.',
    6: 'Revisa que todo esté bien antes de enviar.',
  }

  const stepVariants = {
    enter:  (d: number) => ({ opacity: 0, x: d * 24 }),
    center: { opacity: 1, x: 0 },
    exit:   (d: number) => ({ opacity: 0, x: d * -24 }),
  }

  const hasPrecargaOcr = Boolean(escudoResult?.ocrText) && !imageFile

  return (
    <>
      <style>{`
        @media print {
          #ancla-app { display: none !important; }
          #ancla-print { display: block !important; padding: 28px; font-family: serif; }
        }
        #ancla-print { display: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div id="ancla-app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-background)' }}>

        <JovenHeader
          title="Modo Ancla"
          back={step === 0 ? '/joven/modo' : undefined}
          showBack={step < 7}
          rightSlot={step > 0 && step < 7 ? (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-text-tertiary)' }}>
              {step}/6
            </span>
          ) : undefined}
        />

        {/* Override JovenHeader back behavior for multi-step flow */}
        {step > 0 && step < 7 && (
          <style>{`
            /* handled via JovenHeader back prop — no override needed */
          `}</style>
        )}

        {/* Progress bar */}
        {step > 0 && step < 7 && (
          <div style={{ height: 3, background: 'var(--color-gray-100)', flexShrink: 0 }}>
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ height: '100%', background: 'var(--color-calm-400)' }}
            />
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: isMobile ? '20px 20px 40px' : '28px 24px 48px' }}
            >
              <div style={{ width: '100%', maxWidth: 540, display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* ANA header — shown on steps 0-6 */}
                {step < 7 && (
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 4 }}>
                    <AnaAvatar state={avatarState} size={44} />
                    <div style={{ flex: 1, paddingTop: 4 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text-primary)', marginBottom: 2 }}>
                        ANA
                      </div>
                      {ANA_MESSAGES[step] && (
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                          {ANA_MESSAGES[step]}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* ── STEP 0: Ruta ─────────────────────────────────────── */}
                {step === 0 && (
                  <>
                    <button
                      onClick={() => { setRuta('legal'); goTo(1) }}
                      style={{ ...card, border: '2px solid var(--color-calm-300)', background: 'var(--color-calm-50)', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-calm-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={15} color="var(--color-calm-600)" />
                          </div>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-calm-800)' }}>
                            Quiero acompañamiento
                          </span>
                        </div>
                        <span style={{ padding: '3px 10px', borderRadius: 999, background: 'var(--color-calm-200)', fontFamily: 'var(--font-body)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-calm-700)', whiteSpace: 'nowrap' }}>
                          Recomendado
                        </span>
                      </div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.83rem', color: 'var(--color-calm-700)', lineHeight: 1.6, margin: 0 }}>
                        Un agente de la Policía Cibernética va a contactar a tu familiar. Ellos deciden juntos cómo proceder. Vamos con cuidado.
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--color-calm-600)', fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600 }}>
                        Elegir esta opción <ArrowRight size={14} />
                      </div>
                    </button>

                    <button
                      onClick={() => { setRuta('privado'); goTo(1) }}
                      style={{ ...card, cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Shield size={15} color="var(--color-text-tertiary)" />
                        </div>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          Solo quiero dejar registro
                        </span>
                      </div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.83rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                        Tu reporte queda guardado de forma anónima. Nadie te contacta. Ayuda a identificar patrones de agresores y puedes usarlo como referencia si en algún momento decides dar el siguiente paso.
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>
                        Elegir esta opción <ArrowRight size={14} />
                      </div>
                    </button>
                  </>
                )}

                {/* ── STEP 1: Plataforma ───────────────────────────────── */}
                {step === 1 && (
                  <div style={card}>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--color-text-primary)', marginBottom: 16 }}>
                      ¿En qué app o red ocurrió la situación?
                      {escudoResult?.plataforma && (
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-calm-600)', marginLeft: 8 }}>
                          (precargado de tu análisis)
                        </span>
                      )}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {PLATFORMS.map((p) => (
                        <button
                          key={p}
                          onClick={() => setPlataforma(p)}
                          style={{ padding: '8px 18px', borderRadius: 999, border: `1.5px solid ${plataforma === p ? 'var(--color-calm-500)' : 'var(--color-border)'}`, background: plataforma === p ? 'var(--color-calm-50)' : 'white', color: plataforma === p ? 'var(--color-calm-700)' : 'var(--color-text-primary)', fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: plataforma === p ? 600 : 400, cursor: 'pointer', transition: 'all 150ms' }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── STEP 2: Tipo de abuso ────────────────────────────── */}
                {step === 2 && (
                  <div style={card}>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--color-text-primary)', marginBottom: 6 }}>
                      ¿Qué tipo de situación fue?
                    </p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text-tertiary)', marginBottom: 16 }}>
                      Selecciona todo lo que aplique
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {TIPO_ABUSO_OPTIONS.map((t) => {
                        const checked = tipoAbuso.includes(t.id)
                        return (
                          <label
                            key={t.id}
                            style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${checked ? 'var(--color-calm-400)' : 'var(--color-border-subtle)'}`, background: checked ? 'var(--color-calm-50)' : 'white', cursor: 'pointer', transition: 'all 150ms' }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => setTipoAbuso((prev) => prev.includes(t.id) ? prev.filter((x) => x !== t.id) : [...prev, t.id])}
                              style={{ marginTop: 3, accentColor: 'var(--color-calm-500)', flexShrink: 0 }}
                            />
                            <div>
                              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{t.label}</div>
                              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text-tertiary)', marginTop: 2 }}>{t.desc}</div>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* ── STEP 3: Agresor ──────────────────────────────────── */}
                {step === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={card}>
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--color-text-primary)', marginBottom: 6 }}>
                        ¿Sabes cómo identificar a esta persona?
                        {escudoResult?.identificador && (
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-calm-600)', marginLeft: 8 }}>
                            (precargado)
                          </span>
                        )}
                      </p>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text-tertiary)', marginBottom: 14, lineHeight: 1.6 }}>
                        Usuario, número de teléfono, nombre — lo que tengas. Este campo es opcional.
                      </p>
                      <input
                        type="text"
                        value={identificador}
                        onChange={(e) => setIdentificador(e.target.value)}
                        placeholder="@usuario, número, nombre..."
                        style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--color-border)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--color-text-primary)', background: 'white', outline: 'none', boxSizing: 'border-box' }}
                        onFocus={(e) => (e.target.style.borderColor = 'var(--color-calm-400)')}
                        onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
                      />
                    </div>
                    <div style={card}>
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--color-text-primary)', marginBottom: 6 }}>
                        ¿En qué municipio ocurrió?
                      </p>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text-tertiary)', marginBottom: 14, lineHeight: 1.6 }}>
                        Opcional. Ayuda a identificar patrones geográficos.
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {[
                          'Tepic, Nayarit', 'Bahía de Banderas, Nayarit', 'Xalisco, Nayarit',
                          'Compostela, Nayarit', 'Santiago Ixcuintla, Nayarit', 'San Blas, Nayarit',
                          'Tecuala, Nayarit', 'Acaponeta, Nayarit', 'Ruiz, Nayarit',
                          'Rosamorada, Nayarit', 'Tuxpan, Nayarit', 'Huajicori, Nayarit',
                          'Ixtlán del Río, Nayarit', 'Ahuacatlán, Nayarit', 'Jala, Nayarit',
                          'Amatlán de Cañas, Nayarit', 'San Pedro Lagunillas, Nayarit',
                          'Santa María del Oro, Nayarit', 'La Yesca, Nayarit', 'Del Nayar, Nayarit',
                        ].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setMunicipio(municipio === m ? '' : m)}
                            style={{ padding: '7px 16px', borderRadius: 999, border: `1.5px solid ${municipio === m ? 'var(--color-calm-500)' : 'var(--color-border)'}`, background: municipio === m ? 'var(--color-calm-50)' : 'white', color: municipio === m ? 'var(--color-calm-700)' : 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: municipio === m ? 600 : 400, cursor: 'pointer', transition: 'all 150ms' }}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 4: Evidencia ────────────────────────────────── */}
                {step === 4 && (
                  <div style={card}>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--color-text-primary)', marginBottom: 6 }}>
                      ¿Tienes capturas de pantalla de sus mensajes o perfil?
                    </p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text-tertiary)', marginBottom: 16, lineHeight: 1.6 }}>
                      Las imágenes solo las lee tu dispositivo — nunca se envían a ningún servidor.
                    </p>

                    {/* Preloaded OCR from Escudo */}
                    {hasPrecargaOcr && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'var(--color-calm-50)', border: '1px solid var(--color-calm-200)', marginBottom: 14 }}>
                        <CheckCircle2 size={15} color="var(--color-calm-500)" />
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-calm-700)' }}>
                          Evidencia cargada desde tu análisis · {ocrWordCount} palabras
                        </span>
                      </div>
                    )}

                    {/* New upload zone */}
                    {!imageFile ? (
                      <div
                        onClick={() => fileRef.current?.click()}
                        style={{ border: '2px dashed var(--color-border)', borderRadius: 12, padding: '24px 20px', textAlign: 'center', cursor: 'pointer', background: 'var(--color-gray-50)', transition: 'border-color 150ms' }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--color-calm-400)')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)')}
                      >
                        <Upload size={22} color="var(--color-text-tertiary)" style={{ margin: '0 auto 8px' }} />
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                          {hasPrecargaOcr ? 'Agregar más capturas' : 'Toca para elegir una imagen'}
                        </p>
                      </div>
                    ) : (
                      <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1.5px solid var(--color-border-subtle)', marginBottom: 4 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imagePreviewUrl!} alt="Captura adjunta" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block' }} />
                        <button onClick={clearImage} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <X size={14} color="white" />
                        </button>
                        {isOcrRunning && (
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <Loader2 size={16} color="var(--color-calm-500)" style={{ animation: 'spin 1s linear infinite' }} />
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-calm-600)' }}>Leyendo…</span>
                          </div>
                        )}
                        {!isOcrRunning && ocrWordCount > 0 && (
                          <div style={{ padding: '6px 12px', background: 'var(--color-calm-50)', borderTop: '1px solid var(--color-calm-100)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CheckCircle2 size={12} color="var(--color-calm-500)" />
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-calm-600)' }}>{ocrWordCount} palabras leídas</span>
                          </div>
                        )}
                      </div>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) { e.target.value = ''; handleImageSelect(f) } }} />
                  </div>
                )}

                {/* ── STEP 5: Familiar (legal only) ───────────────────── */}
                {step === 5 && ruta === 'legal' && (
                  <>
                    <div style={{ ...card, background: 'var(--color-calm-50)', border: '1px solid var(--color-calm-200)' }}>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--color-calm-800)', lineHeight: 1.65, margin: 0 }}>
                        La Policía Cibernética va a contactar a tu familiar para que juntos puedan decidir cómo actuar. Manejamos esta información con respeto y cuidado.
                      </p>
                    </div>
                    <div style={card}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 8 }}>
                        ¿Cómo se llama tu familiar? (opcional)
                      </div>
                      <input value={nombreFamiliar} onChange={(e) => setNombreFamiliar(e.target.value)} placeholder="mamá, papá, tío Juan…" style={{ width: '100%', padding: '10px 13px', borderRadius: 10, border: '1.5px solid var(--color-border)', background: 'var(--color-gray-50)', fontFamily: 'var(--font-body)', fontSize: '0.88rem', outline: 'none', color: 'var(--color-text-primary)', boxSizing: 'border-box' }} />
                    </div>
                    <div style={card}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 6 }}>
                        ¿Cómo podemos contactarlos? <span style={{ color: 'var(--color-terra-500)' }}>*</span>
                      </div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-tertiary)', lineHeight: 1.55, marginBottom: 10 }}>
                        Correo electrónico o número de teléfono.
                      </p>
                      <input value={contactoFamiliar} onChange={(e) => { setContactoFamiliar(e.target.value); if (error) setError('') }} placeholder="correo@ejemplo.com o 55 1234 5678" style={{ width: '100%', padding: '10px 13px', borderRadius: 10, border: `1.5px solid ${error ? 'var(--color-terra-400)' : 'var(--color-border)'}`, background: 'var(--color-gray-50)', fontFamily: 'var(--font-body)', fontSize: '0.88rem', outline: 'none', color: 'var(--color-text-primary)', boxSizing: 'border-box', transition: 'border-color 150ms' }} />
                    </div>
                  </>
                )}

                {/* ── STEP 6: Confirmar ────────────────────────────────── */}
                {step === 6 && (
                  <>
                    <DocSummary open={summaryOpen} onToggle={() => setSummaryOpen((o) => !o)} folio={folio} hashHex={hashHex} allPatterns={allPatterns} plataforma={plataforma} today={today} />
                    <InlineError msg={error} />
                    <button
                      onClick={handleSubmit}
                      disabled={isPending}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 20px', borderRadius: 14, width: '100%', background: isPending ? 'var(--color-gray-300)' : 'var(--color-calm-500)', color: 'white', border: 'none', cursor: isPending ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 700, boxShadow: isPending ? 'none' : '0 2px 12px rgba(0,0,0,0.13)', transition: 'all 200ms' }}
                    >
                      {isPending ? 'Enviando…' : (ruta === 'legal' ? 'Pedir ayuda de ANCLA' : 'Guardar mi reporte')}
                    </button>
                    <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 20px', borderRadius: 999, background: 'transparent', border: '1px solid var(--color-border)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      <Download size={13} /> Guardar copia PDF
                    </button>
                  </>
                )}

                {/* ── STEP 7: Éxito ────────────────────────────────────── */}
                {step === 7 && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16, paddingTop: 20 }}>
                    <div style={{ width: 76, height: 76, borderRadius: '50%', background: ruta === 'legal' ? 'var(--color-calm-50)' : 'var(--color-gray-100)', border: `2px solid ${ruta === 'legal' ? 'var(--color-calm-300)' : 'var(--color-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle size={36} color={ruta === 'legal' ? 'var(--color-calm-500)' : 'var(--color-text-secondary)'} />
                    </div>
                    <div>
                      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem, 4vw, 1.75rem)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 10 }}>
                        {ruta === 'legal' ? 'Ayuda en camino' : 'Tu caso quedó registrado'}
                      </h1>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.65, maxWidth: 380 }}>
                        {ruta === 'legal'
                          ? <>Tu reporte quedó registrado. La Policía Cibernética va a contactar a{' '}{nombreFamiliarSent.trim() ? <strong>{nombreFamiliarSent.trim()}</strong> : 'tu familiar'} para que juntos decidan cómo proceder.</>
                          : 'Tu reporte quedó guardado de forma anónima. Ayuda a identificar agresores con patrones similares.'}
                      </p>
                    </div>
                    <div style={{ display: 'inline-block', padding: '10px 22px', borderRadius: 12, background: 'white', border: '1px solid var(--color-border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Tu folio</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '0.05em' }}>{folio}</div>
                    </div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text-tertiary)', lineHeight: 1.6 }}>
                      {ruta === 'legal' ? 'Guarda este folio para dar seguimiento.' : 'Guarda este folio por si en algún momento decides dar el siguiente paso.'}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 360 }}>
                      <button onClick={() => router.push('/joven/lineas')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 28px', borderRadius: 999, background: 'var(--color-terra-500)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600 }}>
                        <Phone size={16} /> Ver líneas de atención
                      </button>
                      <button onClick={() => router.push('/joven/regulacion')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 28px', borderRadius: 999, background: 'white', color: 'var(--color-text-secondary)', border: '1.5px solid var(--color-border)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>
                        Métodos para calmarme
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── Navigation buttons (steps 1–6) ──────────────────── */}
                {step >= 1 && step <= 6 && step !== 6 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <InlineError msg={error} />
                    <button
                      onClick={step === 4 ? handleNext : (step === 5 ? handleNext : handleNext)}
                      disabled={isPending || (step === 4 && isOcrRunning)}
                      style={{ width: '100%', padding: '12px', borderRadius: 999, background: 'var(--color-calm-500)', color: 'white', border: 'none', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                      {step === 5 ? 'Revisar y enviar' : 'Continuar'} <ArrowRight size={16} />
                    </button>
                    {(step === 2 || step === 3 || step === 4) && (
                      <button
                        onClick={handleNext}
                        style={{ width: '100%', padding: '10px', borderRadius: 999, background: 'transparent', color: 'var(--color-text-tertiary)', border: '1.5px solid var(--color-border)', fontFamily: 'var(--font-body)', fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        {step === 2 ? 'No lo sé / ninguna' : step === 3 ? 'No tengo datos del agresor' : 'No tengo capturas'}
                      </button>
                    )}
                    <button onClick={handleBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text-tertiary)', padding: '4px 0' }}>
                      ← Atrás
                    </button>
                  </div>
                )}

              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Print-only document */}
      <div id="ancla-print">
        <h1>ANCLA — {ruta === 'legal' ? 'Reporte con acompañamiento' : 'Reporte anónimo'} #{folio}</h1>
        <p>Fecha: {today}</p>
        <p>Hash de integridad: sha256:{hashHex}</p>
        <p>Plataforma: {plataforma || 'No especificada'}</p>
        <p>Tipo de reporte: {ruta === 'legal' ? 'Seguimiento legal' : 'Reporte privado'}</p>
        {allPatterns.length > 0 && (
          <><p>Patrones detectados:</p><ul>{allPatterns.map((p) => <li key={p}>{labelFor(p)}</li>)}</ul></>
        )}
        <p>ancla.vercel.app</p>
      </div>
    </>
  )
}
