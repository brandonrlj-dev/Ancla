'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, CheckCircle, Phone, ArrowRight, Download, AlertTriangle, Shield, Users } from 'lucide-react';
import { useAnclaStore } from '@/lib/store';
import { submitReport } from '@/actions/report';

const PLATFORMS = [
  'Instagram', 'WhatsApp', 'TikTok', 'Facebook',
  'Snapchat', 'Telegram', 'Discord', 'Roblox',
  'Minecraft', 'Free Fire', 'Otra',
];

const PATTERN_LABELS: Record<string, string> = {
  love_bombing:           'Love bombing',
  aislamiento:            'Aislamiento',
  secretismo:             'Secretismo',
  gradualidad_sexual:     'Gradualidad sexual',
  solicitud_imagen:       'Solicitud de imágenes',
  amenaza_difusion:       'Amenaza de difusión',
  presion:                'Presión repetida',
  manipulacion_emocional: 'Manipulación emocional',
};

function labelFor(k: string) {
  return PATTERN_LABELS[k] ?? k.replace(/_/g, ' ');
}

function deriveAbuseType(patterns: string[]) {
  if (patterns.includes('amenaza_difusion') || patterns.includes('solicitud_imagen')) return 'Sextorsión'
  if (patterns.some((p) => ['gradualidad_sexual', 'love_bombing', 'secretismo'].includes(p))) return 'Grooming'
  return 'Acoso digital'
}

async function computeHash(input: string): Promise<{ folio: string; hex: string }> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  const hex = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  return { folio: 'A-' + hex.slice(0, 6).toUpperCase(), hex };
}

// ── Shared card style ─────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: 'white',
  borderRadius: 16,
  border: '1px solid var(--color-border-subtle)',
  padding: '18px 18px 16px',
  boxShadow: 'var(--shadow-sm)',
};

// ── Collapsible document summary ──────────────────────────────────────────────
function DocSummary({
  open, onToggle, folio, hashHex, allPatterns, today,
}: {
  open: boolean; onToggle: () => void;
  folio: string; hashHex: string; allPatterns: string[]; today: string;
}) {
  return (
    <div style={card}>
      <button
        onClick={onToggle}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>
          Resumen del documento
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-calm-500)' }}>
          {open ? 'Ocultar ▲' : 'Ver ▼'}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 14 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--color-calm-50)', border: '1px solid var(--color-calm-200)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-calm-600)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Folio</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>{folio || '…'}</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Hash de integridad</div>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.64rem', color: 'var(--color-text-secondary)', wordBreak: 'break-all' }}>
                  {hashHex ? `sha256:${hashHex.slice(0, 32)}…` : 'Calculando…'}
                </code>
              </div>
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
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--color-text-tertiary)', borderTop: '1px solid var(--color-border-subtle)', paddingTop: 8 }}>
                {today} · ancla.vercel.app
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Inline error ──────────────────────────────────────────────────────────────
function InlineError({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, padding: '10px 12px', borderRadius: 10, background: 'var(--color-terra-50)', border: '1px solid var(--color-terra-200)' }}>
      <AlertTriangle size={13} color="var(--color-terra-500)" style={{ flexShrink: 0, marginTop: 2 }} />
      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-terra-700)', lineHeight: 1.5 }}>{msg}</span>
    </div>
  );
}

// ── Primary button ────────────────────────────────────────────────────────────
function PrimaryBtn({ label, onClick, disabled, color = 'var(--color-calm-500)' }: {
  label: string; onClick: () => void; disabled?: boolean; color?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '14px 20px', borderRadius: 14, width: '100%',
        background: disabled ? 'var(--color-gray-300)' : color,
        color: 'white', border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 700,
        boxShadow: disabled ? 'none' : '0 2px 12px rgba(0,0,0,0.13)',
        transition: 'all 200ms',
      }}
    >
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ReportePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    analysisPatterns, analysisResult, riskLevel, sessionToken,
    folio: storedFolio, hashHex: storedHashHex, setReporteId,
  } = useAnclaStore();

  const [folio,   setFolio]   = useState(storedFolio);
  const [hashHex, setHashHex] = useState(storedHashHex);

  const allPatterns = Array.from(new Set([
    ...analysisPatterns,
    ...(analysisResult?.patrones_detectados ?? []),
  ]));
  const today = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    if (folio && hashHex) return;
    computeHash(sessionToken + analysisPatterns.join(',')).then(({ folio: f, hex }) => {
      setFolio(f); setHashHex(hex);
    });
  }, [sessionToken, analysisPatterns, folio, hashHex]);

  // ── Step state ──────────────────────────────────────────────────────────────
  const [step,      setStep]      = useState<0 | 1 | 2 | 3>(0);
  const [direction, setDirection] = useState(1);
  const [ruta,      setRuta]      = useState<'privado' | 'legal' | null>(null);

  // ── Form fields ─────────────────────────────────────────────────────────────
  const [plataforma,       setPlataforma]       = useState('');
  const [identificador,    setIdentificador]    = useState('');
  const [emailJoven,       setEmailJoven]       = useState('');
  const [nombreFamiliar,   setNombreFamiliar]   = useState('');
  const [contactoFamiliar, setContactoFamiliar] = useState('');
  const [summaryOpen,      setSummaryOpen]      = useState(false);
  const [error,            setError]            = useState('');

  function goTo(next: 0 | 1 | 2 | 3) {
    setDirection(next > step ? 1 : -1);
    setError('');
    setStep(next);
  }

  function pickRoute(r: 'privado' | 'legal') {
    setRuta(r);
    goTo(1);
  }

  function handleStep1Continue() {
    if (!plataforma) { setError('Selecciona la plataforma donde ocurrió la situación.'); return; }
    goTo(2);
  }

  function handleSend() {
    if (ruta === 'legal' && !contactoFamiliar.trim()) {
      setError('Ingresa el contacto de tu familiar para continuar.');
      return;
    }
    setError('');

    startTransition(async () => {
      try {
        const result = await submitReport({
          folio,
          hashSha256: hashHex ? `sha256:${hashHex}` : `sha256:${sessionToken}`,
          patterns: allPatterns,
          plataforma,
          identificador: identificador.trim() || undefined,
          tipoReporte: ruta!,
          contacto: ruta === 'privado' ? (emailJoven.trim() || undefined) : undefined,
          contactoFamiliar: ruta === 'legal' ? contactoFamiliar.trim() : undefined,
          nombreFamiliar: nombreFamiliar.trim() || undefined,
          sessionToken,
        });
        setReporteId(result.reporteId);
        goTo(3);
      } catch (err) {
        const msg = err instanceof Error ? err.message : '';
        if (msg.includes('duplicate') || msg.includes('unique')) {
          goTo(3);
        } else {
          setError('No pudimos enviar tu reporte. Intenta de nuevo en unos segundos.');
          console.error('[submitReport]', msg);
        }
      }
    });
  }

  // ── Top bar labels ───────────────────────────────────────────────────────────
  const topTitle = [
    'Tu denuncia',
    'Detalles del caso',
    ruta === 'legal' ? 'Datos del familiar' : 'Confirmar y enviar',
    ruta === 'legal' ? 'Ayuda en camino' : 'Reporte guardado',
  ][step];

  const stepVariants = {
    enter:  (d: number) => ({ opacity: 0, x: d * 28 }),
    center: { opacity: 1, x: 0 },
    exit:   (d: number) => ({ opacity: 0, x: d * -28 }),
  };

  // ── Shared step wrapper ──────────────────────────────────────────────────────
  const wrap = (content: React.ReactNode) => (
    <div style={{ flex: 1, padding: '28px 20px 40px', maxWidth: 540, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {content}
    </div>
  );

  return (
    <>
      <style>{`
        @media print {
          #reporte-app  { display: none !important; }
          #reporte-print { display: block !important; padding: 28px; font-family: serif; }
        }
        #reporte-print { display: none; }
      `}</style>

      <div id="reporte-app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-background)' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 56, borderBottom: '1px solid var(--color-border-subtle)', background: 'rgba(250,249,247,0.95)', backdropFilter: 'blur(12px)', flexShrink: 0 }}>
          <button
            onClick={() => step === 0 ? router.push('/joven/analisis') : goTo((step - 1) as 0 | 1 | 2 | 3)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', fontSize: '0.82rem', padding: 0, opacity: step === 3 ? 0 : 1, pointerEvents: step === 3 ? 'none' : 'auto' }}
          >
            <ChevronLeft size={16} /> {step === 0 ? 'Análisis' : 'Atrás'}
          </button>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {topTitle}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-text-tertiary)', letterSpacing: '0.05em', minWidth: 48, textAlign: 'right' }}>
            {step === 3 && folio ? `#${folio}` : (step > 0 && step < 3 ? `${step}/2` : '')}
          </div>
        </div>

        {/* Progress bar (steps 1–2 only) */}
        {step > 0 && step < 3 && (
          <div style={{ height: 2, background: 'var(--color-border-subtle)', flexShrink: 0 }}>
            <motion.div
              animate={{ width: `${(step / 2) * 100}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ height: '100%', background: 'var(--color-calm-400)' }}
            />
          </div>
        )}

        {/* Animated step content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >

              {/* ── STEP 0: Route selection ── */}
              {step === 0 && wrap(
                <>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.65, marginBottom: 4 }}>
                    Antes de enviar tu caso, dinos qué tipo de ayuda necesitas.
                  </p>

                  {/* Legal — recommended */}
                  <button
                    onClick={() => pickRoute('legal')}
                    style={{ ...card, border: '2px solid var(--color-calm-300)', background: 'var(--color-calm-50)', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-calm-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Users size={15} color="var(--color-calm-600)" />
                        </div>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--color-calm-800)' }}>
                          Quiero que alguien me ayude
                        </span>
                      </div>
                      <span style={{ padding: '3px 10px', borderRadius: 999, background: 'var(--color-calm-200)', fontFamily: 'var(--font-body)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-calm-700)', whiteSpace: 'nowrap' }}>
                        Recomendado
                      </span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-calm-700)', lineHeight: 1.6, margin: 0 }}>
                      Un agente de ANCLA va a hablar con tu familiar y juntos buscan cómo actuar. Vamos con cuidado — sabemos que esta conversación puede ser difícil.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--color-calm-600)', fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600 }}>
                      Elegir esta opción <ArrowRight size={14} />
                    </div>
                  </button>

                  {/* Private */}
                  <button
                    onClick={() => pickRoute('privado')}
                    style={{ ...card, cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Shield size={15} color="var(--color-text-tertiary)" />
                      </div>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        Solo quiero dejar registro
                      </span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                      Tu caso queda guardado de forma segura. Nadie te contacta. Puedes usar el folio después si en algún momento cambias de opinión.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>
                      Elegir esta opción <ArrowRight size={14} />
                    </div>
                  </button>
                </>
              )}

              {/* ── STEP 1: Details ── */}
              {step === 1 && wrap(
                <>
                  {/* Platform */}
                  <div style={card}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 10 }}>
                      ¿En qué plataforma ocurrió? <span style={{ color: 'var(--color-terra-500)' }}>*</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {PLATFORMS.map((p) => (
                        <button
                          key={p}
                          onClick={() => setPlataforma(p)}
                          style={{
                            padding: '6px 13px', borderRadius: 999, fontSize: '0.8rem',
                            fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all 150ms',
                            border: `1.5px solid ${plataforma === p ? 'var(--color-calm-400)' : 'var(--color-border)'}`,
                            background: plataforma === p ? 'var(--color-calm-50)' : 'transparent',
                            color: plataforma === p ? 'var(--color-calm-700)' : 'var(--color-text-secondary)',
                          }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Identifier */}
                  <div style={card}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 8 }}>
                      Usuario o identificador del agresor (opcional)
                    </div>
                    <input
                      value={identificador}
                      onChange={(e) => setIdentificador(e.target.value)}
                      placeholder="@usuario, número de teléfono, etc."
                      style={{ width: '100%', padding: '9px 13px', borderRadius: 10, border: '1.5px solid var(--color-border)', background: 'var(--color-gray-50)', fontFamily: 'var(--font-body)', fontSize: '0.85rem', outline: 'none', color: 'var(--color-text-primary)', boxSizing: 'border-box' }}
                    />
                  </div>

                  <InlineError msg={error} />

                  <PrimaryBtn label="Continuar →" onClick={handleStep1Continue} />
                </>
              )}

              {/* ── STEP 2a: Privado confirm ── */}
              {step === 2 && ruta === 'privado' && wrap(
                <>
                  <div style={{ ...card, background: 'var(--color-gray-50)', border: '1px solid var(--color-border-subtle)' }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: 0 }}>
                      Tu caso va a quedar registrado de forma segura. Nadie de ANCLA va a contactar a nadie — solo usamos tu reporte para identificar patrones y proteger a más jóvenes.
                    </p>
                  </div>

                  <div style={card}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 6 }}>
                      Tu correo (opcional)
                    </div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-tertiary)', lineHeight: 1.55, marginBottom: 10 }}>
                      Si en algún momento quieres que te escribamos.
                    </p>
                    <input
                      value={emailJoven}
                      onChange={(e) => setEmailJoven(e.target.value)}
                      placeholder="tu@correo.com"
                      type="email"
                      style={{ width: '100%', padding: '9px 13px', borderRadius: 10, border: '1.5px solid var(--color-border)', background: 'var(--color-gray-50)', fontFamily: 'var(--font-body)', fontSize: '0.85rem', outline: 'none', color: 'var(--color-text-primary)', boxSizing: 'border-box' }}
                    />
                  </div>

                  <DocSummary
                    open={summaryOpen} onToggle={() => setSummaryOpen((o) => !o)}
                    folio={folio} hashHex={hashHex} allPatterns={allPatterns} today={today}
                  />

                  <InlineError msg={error} />

                  <PrimaryBtn
                    label={isPending ? 'Guardando…' : 'Guardar mi reporte'}
                    onClick={handleSend}
                    disabled={isPending}
                    color="var(--color-text-primary)"
                  />

                  <button
                    onClick={() => window.print()}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 20px', borderRadius: 999, background: 'transparent', border: '1px solid var(--color-border)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}
                  >
                    <Download size={13} /> Guardar copia para tus registros
                  </button>
                </>
              )}

              {/* ── STEP 2b: Legal family contact ── */}
              {step === 2 && ruta === 'legal' && wrap(
                <>
                  <div style={{ ...card, background: 'var(--color-calm-50)', border: '1px solid var(--color-calm-200)' }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--color-calm-800)', lineHeight: 1.65, margin: 0 }}>
                      Un agente de ANCLA va a hablar con tu familiar. Vamos con cuidado — sabemos que esta conversación puede ser difícil y lo manejamos con respeto.
                    </p>
                  </div>

                  <div style={card}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 8 }}>
                      ¿Cómo se llama tu familiar? (opcional)
                    </div>
                    <input
                      value={nombreFamiliar}
                      onChange={(e) => setNombreFamiliar(e.target.value)}
                      placeholder="mamá, papá, tío Juan…"
                      style={{ width: '100%', padding: '9px 13px', borderRadius: 10, border: '1.5px solid var(--color-border)', background: 'var(--color-gray-50)', fontFamily: 'var(--font-body)', fontSize: '0.85rem', outline: 'none', color: 'var(--color-text-primary)', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={card}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 6 }}>
                      ¿Cómo podemos contactarlos? <span style={{ color: 'var(--color-terra-500)' }}>*</span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-tertiary)', lineHeight: 1.55, marginBottom: 10 }}>
                      Correo electrónico o número de teléfono. Solo lo usamos para que el agente de ANCLA se ponga en contacto.
                    </p>
                    <input
                      value={contactoFamiliar}
                      onChange={(e) => { setContactoFamiliar(e.target.value); if (error) setError(''); }}
                      placeholder="correo@ejemplo.com o 55 1234 5678"
                      style={{ width: '100%', padding: '9px 13px', borderRadius: 10, border: `1.5px solid ${error ? 'var(--color-terra-400)' : 'var(--color-border)'}`, background: 'var(--color-gray-50)', fontFamily: 'var(--font-body)', fontSize: '0.85rem', outline: 'none', color: 'var(--color-text-primary)', boxSizing: 'border-box', transition: 'border-color 150ms' }}
                    />
                  </div>

                  <DocSummary
                    open={summaryOpen} onToggle={() => setSummaryOpen((o) => !o)}
                    folio={folio} hashHex={hashHex} allPatterns={allPatterns} today={today}
                  />

                  <InlineError msg={error} />

                  <PrimaryBtn
                    label={isPending ? 'Enviando…' : 'Pedir ayuda de ANCLA'}
                    onClick={handleSend}
                    disabled={isPending}
                    color="var(--color-calm-500)"
                  />

                  <button
                    onClick={() => window.print()}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 20px', borderRadius: 999, background: 'transparent', border: '1px solid var(--color-border)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}
                  >
                    <Download size={13} /> Guardar copia para tus registros
                  </button>
                </>
              )}

              {/* ── STEP 3: Success ── */}
              {step === 3 && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                    style={{ maxWidth: 420, width: '100%' }}
                  >
                    <div style={{ width: 76, height: 76, borderRadius: '50%', background: ruta === 'legal' ? 'var(--color-calm-50)' : 'var(--color-gray-100)', border: `2px solid ${ruta === 'legal' ? 'var(--color-calm-300)' : 'var(--color-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>
                      <CheckCircle size={36} color={ruta === 'legal' ? 'var(--color-calm-500)' : 'var(--color-text-secondary)'} />
                    </div>

                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 12 }}>
                      {ruta === 'legal' ? 'Ayuda en camino' : 'Tu caso quedó registrado'}
                    </h1>

                    {ruta === 'legal' ? (
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.65, marginBottom: 16 }}>
                        El equipo de ANCLA ya tiene tu caso. Pronto un agente va a hablar con{' '}
                        {nombreFamiliar.trim() ? <strong>{nombreFamiliar.trim()}</strong> : 'tu familiar'} con cuidado y respeto.
                      </p>
                    ) : (
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.65, marginBottom: 16 }}>
                        Nadie va a contactar a nadie. Tu caso ya está guardado de forma segura y va a ayudar a proteger a otros jóvenes.
                      </p>
                    )}

                    {/* Folio */}
                    <div style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 12, background: 'white', border: '1px solid var(--color-border-subtle)', boxShadow: 'var(--shadow-sm)', marginBottom: 16 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Tu folio</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '0.05em' }}>{folio}</div>
                    </div>

                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-text-tertiary)', lineHeight: 1.6, marginBottom: 36 }}>
                      {ruta === 'legal'
                        ? 'Guarda este folio. Úsalo para dar seguimiento si lo necesitas.'
                        : 'Guarda este folio. Si en algún momento decides dar el siguiente paso, seguirá siendo tuyo.'}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <button
                        onClick={() => router.push('/joven/lineas')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 28px', borderRadius: 999, background: 'var(--color-terra-500)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600 }}
                      >
                        <Phone size={16} /> Ver líneas de atención
                      </button>
                      <button
                        onClick={() => router.push('/joven/regulacion')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 28px', borderRadius: 999, background: 'white', color: 'var(--color-text-secondary)', border: '1.5px solid var(--color-border)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}
                      >
                        Métodos para calmarme
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Print-only document (hidden, shown via @media print) */}
      <div id="reporte-print">
        <h1>ANCLA — {ruta === 'legal' ? 'Denuncia con seguimiento' : 'Reporte privado'} #{folio}</h1>
        <p>Fecha: {today}</p>
        <p>Hash de integridad: sha256:{hashHex}</p>
        <p>Plataforma: {plataforma || 'No especificada'}</p>
        <p>Tipo: {deriveAbuseType(allPatterns)}</p>
        <p>Tipo de reporte: {ruta === 'legal' ? 'Seguimiento legal' : 'Reporte privado'}</p>
        {allPatterns.length > 0 && (
          <>
            <p>Patrones detectados:</p>
            <ul>{allPatterns.map((p) => <li key={p}>{labelFor(p)}</li>)}</ul>
          </>
        )}
        {analysisResult?.resumen_comportamiento && (
          <p>Resumen: {analysisResult.resumen_comportamiento}</p>
        )}
        <p>ancla.vercel.app</p>
      </div>
    </>
  );
}
