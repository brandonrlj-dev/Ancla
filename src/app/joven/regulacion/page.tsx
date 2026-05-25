'use client';

import { useState, useEffect, Suspense, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import AnclaLogo from '@/components/brand/AnclaLogo';
import { ChevronLeft, ArrowRight, X } from 'lucide-react';

/* ── Triage categories ── */
const CATEGORIES = [
  {
    id: 'cuerpo',
    label: 'Calmar el cuerpo',
    hint: 'Cuando el corazón late rápido, la respiración se acelera o hay tensión física.',
    color: '#5b81a8',
    methods: [
      { name: 'Suspiro Fisiológico', desc: 'Dos inhalaciones seguidas y una exhalación larga activan el sistema parasimpático en segundos. La técnica más rápida contra el pánico agudo.', time: '< 2 MIN', fase: '1', color: '#5b81a8' },
      { name: 'Respiración Diafragmática', desc: 'Inhala despacio llevando el aire hacia el abdomen. Activa la respuesta de calma sin esfuerzo ni conteos complejos.', time: '~ 2 MIN', fase: '4', color: '#7299bc' },
      { name: 'Burbujas de Calma', desc: 'Toca las burbujas para soltarlas. Una distracción visual suave que ayuda a bajar la tensión sin esfuerzo.', time: '~ 2 MIN', fase: '9', color: '#89afd1' },
    ],
  },
  {
    id: 'presente',
    label: 'Volver al presente',
    hint: 'Cuando te sientes desconectado/a, ausente o como si nada fuera real.',
    color: '#6b7f5e',
    methods: [
      { name: '5-4-3-2-1 · Abrazo de Mariposa', desc: 'Ancla tus sentidos al presente nombrando lo que ves, escuchas y tocas. Interrumpe la disociación y te reconecta con tu cuerpo.', time: '~ 3 MIN', fase: '2', color: '#6b7f5e' },
      { name: 'Reacomodo Postural', desc: 'Cinco ajustes corporales simples para salir del encogimiento y volver a sentirte presente y seguro/a.', time: '< 1 MIN', fase: '5', color: '#8a9e7a' },
      { name: 'Frases de Anclaje', desc: 'Frases cortas para leer cuando sientes que no estás aquí o que lo que vives no está pasando de verdad.', time: '< 2 MIN', fase: '10', color: '#7a9570' },
      { name: 'Texturas de Anclaje', desc: 'Tocar algo cercano y notar sus cualidades físicas reconecta la mente con el cuerpo en segundos.', time: '< 2 MIN', fase: '11', color: '#6e8865' },
      { name: 'Olores de Anclaje', desc: 'Un olor familiar y seguro puede anclar la atención al presente cuando las otras técnicas no están disponibles.', time: '< 2 MIN', fase: '12', color: '#5e7855' },
    ],
  },
  {
    id: 'mente',
    label: 'Ordenar la mente',
    hint: 'Cuando los pensamientos no paran, hay confusión emocional o no sabes qué sientes.',
    color: '#c4a882',
    methods: [
      { name: 'Tapping EFT', desc: 'Toca puntos específicos en tu cara y cuerpo mientras repites frases que procesan la culpa. Reduce la activación emocional y restructura la narrativa.', time: '~ 5 MIN', fase: '3', color: '#c4a882' },
      { name: 'Etiquetado Emocional', desc: 'Ponerle nombre a lo que sientes ayuda al cerebro a bajar la intensidad emocional. Solo elige lo que más se parece.', time: '< 1 MIN', fase: '6', color: '#b8956f' },
      { name: 'Categorías Mentales', desc: 'Darle una tarea simple a la mente interrumpe los pensamientos repetitivos y la devuelve al presente.', time: '~ 2 MIN', fase: '7', color: '#a8855c' },
      { name: 'Conteo Hacia Atrás', desc: 'Contar hacia atrás desde 20 ocupa la mente activa y corta el ciclo de rumiación sin ninguna presión.', time: '~ 2 MIN', fase: '8', color: '#9a7650' },
    ],
  },
];

/* ── Blob animation configs ── */
const BLOB_FRAMES = [
  ['60% 40% 40% 60% / 60% 60% 40% 40%', '40% 60% 70% 30% / 30% 60% 40% 70%', '50% 50% 60% 40% / 50% 40% 60% 50%'],
  ['40% 60% 30% 70% / 70% 30% 70% 30%', '60% 40% 50% 50% / 40% 60% 50% 50%', '50% 50% 40% 60% / 60% 50% 40% 60%'],
  ['55% 45% 65% 35% / 45% 55% 35% 65%', '35% 65% 45% 55% / 65% 35% 55% 45%', '50% 50% 55% 45% / 50% 55% 45% 50%'],
];
const DURATIONS = [9.2, 8.4, 10.1];
const ROTATIONS = [2, -2, 1.5];

function BlobOrb({ color, idx }: { color: string; idx: number }) {
  const frames = BLOB_FRAMES[idx % 3];
  const dur    = DURATIONS[idx % 3];
  const rot    = ROTATIONS[idx % 3];
  return (
    <motion.div
      animate={{ borderRadius: frames, rotate: [0, rot, 0, -rot, 0] }}
      transition={{
        borderRadius: { duration: dur, repeat: Infinity, ease: 'easeInOut' },
        rotate:       { duration: dur * 1.3, repeat: Infinity, ease: 'easeInOut' },
      }}
      style={{
        width: 80, height: 80, borderRadius: frames[0],
        background: `radial-gradient(ellipse at 35% 30%, ${color}cc 0%, ${color} 60%, ${color}dd 100%)`,
        boxShadow: `0 8px 28px ${color}44, inset 0 -6px 14px rgba(0,0,0,0.12), inset 0 6px 12px rgba(255,255,255,0.28)`,
        position: 'relative', overflow: 'hidden', flexShrink: 0, opacity: 0.9,
      }}
    >
      <motion.div
        animate={{ x: [-10, 4, -10], y: [-8, 4, -8] }}
        transition={{ duration: dur * 0.7, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: 12, left: 14,
          width: 28, height: 16, borderRadius: '50%',
          background: 'rgba(255,255,255,0.45)',
          transform: 'rotate(-30deg)', pointerEvents: 'none',
        }}
      />
    </motion.div>
  );
}

/* ── Shared tokens ── */
const C = {
  bg:    '#F5F2EE',
  card:  '#FBF9F5',
  text:  '#2C2C2A',
  muted: '#57544E',
  faint: '#8B8780',
  body:  '#6a6560',
  bdr:   'rgba(44,44,42,0.07)',
};

function Btn({
  children, onClick, variant = 'primary',
}: { children: ReactNode; onClick: () => void; variant?: 'primary' | 'ghost' }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        padding: '14px 28px', borderRadius: 999, width: '100%',
        border: variant === 'primary' ? 'none' : '1px solid rgba(44,44,42,0.18)',
        background: variant === 'primary' ? C.text : 'transparent',
        color: variant === 'primary' ? C.bg : C.text,
        fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500,
        cursor: 'pointer', transition: 'opacity 200ms ease',
      }}
    >
      {children}
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════
   FASE 1 — Suspiro Fisiológico
═══════════════════════════════════════════════════════ */

type BreathPhase = 'inhale' | 'sip' | 'exhale';
const BREATH_SEQ: { phase: BreathPhase; ms: number; label: string }[] = [
  { phase: 'inhale', ms: 2000, label: 'Inhala...' },
  { phase: 'sip',    ms: 500,  label: 'Otro sorbito de aire...' },
  { phase: 'exhale', ms: 4000, label: 'Suelta lento...' },
];

function BreathBubble({ bp, color = '#5b81a8' }: { bp: BreathPhase; color?: string }) {
  const scale = bp === 'inhale' ? 1 : bp === 'sip' ? 1.12 : 0.7;
  const dur   = bp === 'inhale' ? 2 : bp === 'sip' ? 0.5 : 4;
  const light = color === '#5b81a8' ? '#7fa8c8' : '#9ab5d4';
  const dark  = color === '#5b81a8' ? '#4a6f95' : '#5b81a8';
  return (
    <motion.div
      animate={{ scale }}
      transition={{ duration: dur, ease: [0.4, 0, 0.2, 1] }}
      style={{
        width: 180, height: 180, borderRadius: '50%', flexShrink: 0,
        background: `radial-gradient(ellipse at 35% 30%, ${light} 0%, ${color} 60%, ${dark} 100%)`,
        boxShadow: `0 16px 50px ${color}60, inset 0 -10px 24px rgba(0,0,0,0.1), inset 0 10px 20px rgba(255,255,255,0.3)`,
        position: 'relative', overflow: 'hidden',
      }}
    >
      <motion.div
        animate={{ x: [-10, 4, -10], y: [-8, 4, -8] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: 38, left: 48,
          width: 52, height: 28, borderRadius: '50%',
          background: 'rgba(255,255,255,0.38)', transform: 'rotate(-30deg)',
        }}
      />
    </motion.div>
  );
}

function Phase1({ onDone }: { onDone: () => void }) {
  const [ui, setUi]     = useState<'breathing' | 'checkin' | 'tipp'>('breathing');
  const [step, setStep] = useState(0);

  const bp    = BREATH_SEQ[step % 3]?.phase ?? 'exhale';
  const label = BREATH_SEQ[step % 3]?.label ?? '';

  useEffect(() => {
    if (ui !== 'breathing') return;
    if (step >= 9) { setUi('checkin'); return; }
    const { ms, phase } = BREATH_SEQ[step % 3];
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (phase === 'inhale') navigator.vibrate(1800);
      if (phase === 'sip')    navigator.vibrate([200, 100, 200]);
      if (phase === 'exhale') navigator.vibrate([400, 200, 300, 300, 200]);
    }
    const t = setTimeout(() => setStep(s => s + 1), ms);
    return () => clearTimeout(t);
  }, [step, ui]);

  if (ui === 'tipp') return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, width: '100%', maxWidth: 460 }}>
      <div style={{ background: C.card, borderRadius: 22, border: `1px solid ${C.bdr}`, padding: '32px 28px', textAlign: 'center', width: '100%' }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>💧</div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, color: C.text, margin: '0 0 12px' }}>
          Temperatura — TIPP
        </h3>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: C.muted, lineHeight: 1.65, margin: '0 0 24px' }}>
          Coloca agua fría o hielo sobre tus sienes y pómulos por 30 segundos.
          Sostén la respiración mientras lo haces.
        </p>
        <Btn onClick={onDone}>Listo, continuar</Btn>
      </div>
    </motion.div>
  );

  if (ui === 'checkin') return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%', maxWidth: 320 }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, color: C.text, textAlign: 'center', margin: 0 }}>
        ¿Cómo te sientes?
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        <Btn onClick={onDone}>Un poco mejor</Btn>
        <Btn variant="ghost" onClick={() => { setStep(0); setUi('breathing'); }}>Necesito repetir</Btn>
        <Btn variant="ghost" onClick={() => setUi('tipp')}>Sigo muy asustado/a</Btn>
      </div>
    </motion.div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 }}>
      <BreathBubble bp={bp} />
      <AnimatePresence mode="wait">
        <motion.p key={label}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28 }}
          style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400, color: C.muted, textAlign: 'center', letterSpacing: '-0.01em', margin: 0 }}>
          {label}
        </motion.p>
      </AnimatePresence>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: C.faint, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
        Ciclo {Math.min(Math.floor(step / 3) + 1, 3)} de 3
      </p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   FASE 2 — Grounding + Abrazo de Mariposa
═══════════════════════════════════════════════════════ */

const GROUNDING = [
  { count: 5, prompt: 'Nombra 5 cosas que puedes VER ahora mismo' },
  { count: 4, prompt: 'Escucha. ¿Qué 4 sonidos hay a tu alrededor?' },
  { count: 3, prompt: 'Toca algo cerca. ¿Qué 3 texturas sientes?' },
  { count: 2, prompt: '¿Qué 2 olores puedes percibir?' },
  { count: 1, prompt: '¿Qué sabor tienes en la boca ahora?' },
];

function Phase2({ onDone }: { onDone: () => void }) {
  const [sub, setSub]         = useState<'grounding' | 'butterfly'>('grounding');
  const [screen, setScreen]   = useState(0);
  const [answers, setAnswers] = useState<string[][]>(GROUNDING.map(g => Array(g.count).fill('')));
  const [secs, setSecs]       = useState(60);
  const [done, setDone]       = useState(false);

  useEffect(() => {
    if (sub !== 'butterfly' || done) return;
    if (secs <= 0) { setDone(true); return; }
    const t = setTimeout(() => setSecs(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [sub, secs, done]);

  useEffect(() => {
    if (sub !== 'butterfly' || done) return;
    const id = setInterval(() => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([300, 200, 300]);
    }, 800);
    return () => {
      clearInterval(id);
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(0);
    };
  }, [sub, done]);

  if (sub === 'butterfly') return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, width: '100%', maxWidth: 400, textAlign: 'center' }}>
      <BlobOrb color="#6b7f5e" idx={1} />
      <div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, color: C.text, margin: '0 0 10px' }}>
          Abrazo de Mariposa
        </h3>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: C.muted, lineHeight: 1.65, margin: 0 }}>
          Cruza los brazos sobre tu pecho. Date golpecitos suaves alternados en los hombros siguiendo el ritmo.
        </p>
      </div>
      {!done ? (
        <div style={{ width: 80, height: 80, borderRadius: '50%', border: '2px solid rgba(107,127,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 26, color: '#6b7f5e' }}>{secs}</span>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500, color: C.text, margin: '0 0 4px' }}>
            ¿Sientes los pies en el piso? ¿Puedes ver la pantalla con claridad?
          </p>
          <Btn onClick={onDone}>Sí, estoy conectado/a</Btn>
          <Btn variant="ghost" onClick={() => { setSecs(60); setDone(false); }}>Quiero repetir</Btn>
        </motion.div>
      )}
    </motion.div>
  );

  const cur = GROUNDING[screen];
  return (
    <AnimatePresence mode="wait">
      <motion.div key={screen}
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 480, width: '100%', margin: '0 auto' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.faint, marginBottom: 8, marginTop: 0 }}>
            Pantalla {screen + 1} de 5
          </p>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 500, color: C.text, margin: 0 }}>
            {cur.prompt}
          </h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: cur.count }).map((_, i) => (
            <input key={i} value={answers[screen][i]}
              onChange={e => {
                const next = answers.map((row, si) =>
                  si === screen ? row.map((v, ii) => (ii === i ? e.target.value : v)) : row
                );
                setAnswers(next);
              }}
              placeholder={`${i + 1}.`}
              style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: C.text, background: C.card, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: '12px 16px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
            />
          ))}
        </div>
        <Btn onClick={() => screen < 4 ? setScreen(s => s + 1) : setSub('butterfly')}>
          {screen < 4 ? 'Continuar' : 'Siguiente técnica'}
        </Btn>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════
   FASE 3 — Tapping EFT + Psicoeducación
═══════════════════════════════════════════════════════ */

const EFT = [
  { label: 'ceja',          text: 'Aunque cometí un error al confiar...',                        cx: 100, cy: 88  },
  { label: 'lado del ojo',  text: '...hoy reconozco que soy la víctima de un engaño...',         cx: 174, cy: 101 },
  { label: 'bajo la nariz', text: '...lo que me hicieron se llama extorsión y es un delito...',  cx: 135, cy: 148 },
  { label: 'clavícula',     text: '...y elijo estar a salvo.',                                    cx: 95,  cy: 246 },
];

function FaceMap({ active, onTap }: { active: number; onTap: () => void }) {
  return (
    <svg viewBox="0 0 270 300" width={220} height={244} style={{ overflow: 'visible', flexShrink: 0 }}>
      <ellipse cx="135" cy="112" rx="58" ry="74" fill="#f0ece5" stroke="rgba(44,44,42,0.18)" strokeWidth="1.5" />
      <circle cx="114" cy="98" r="7" fill="rgba(44,44,42,0.07)" stroke="rgba(44,44,42,0.2)" strokeWidth="1.2" />
      <circle cx="156" cy="98" r="7" fill="rgba(44,44,42,0.07)" stroke="rgba(44,44,42,0.2)" strokeWidth="1.2" />
      <circle cx="114" cy="98" r="3" fill="rgba(44,44,42,0.32)" />
      <circle cx="156" cy="98" r="3" fill="rgba(44,44,42,0.32)" />
      <path d="M 131 118 Q 135 132 139 118" fill="none" stroke="rgba(44,44,42,0.18)" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M 120 142 Q 135 153 150 142" fill="none" stroke="rgba(44,44,42,0.22)" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="110" y1="183" x2="102" y2="218" stroke="rgba(44,44,42,0.14)" strokeWidth="1.5" />
      <line x1="160" y1="183" x2="168" y2="218" stroke="rgba(44,44,42,0.14)" strokeWidth="1.5" />
      <path d="M 40 290 Q 68 235 102 218 L 168 218 Q 202 235 230 290" fill="none" stroke="rgba(44,44,42,0.14)" strokeWidth="1.5" />
      <path d="M 102 228 Q 135 222 168 228" fill="none" stroke="rgba(44,44,42,0.1)" strokeWidth="1.2" strokeDasharray="3 3" />
      {EFT.map((pt, i) => {
        const isActive = i === active;
        const isDone   = i < active;
        return (
          <g key={pt.label} onClick={isActive ? onTap : undefined} style={{ cursor: isActive ? 'pointer' : 'default' }}>
            {isActive && (
              <motion.circle cx={pt.cx} cy={pt.cy} r={20} fill="none" stroke="#c4a882" strokeWidth={2}
                animate={{ opacity: [0.6, 0.08, 0.6] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            <circle cx={pt.cx} cy={pt.cy} r={12}
              fill={isActive ? '#c4a882' : isDone ? '#c4a88266' : C.card}
              stroke={isActive ? '#c4a882' : isDone ? '#c4a88288' : 'rgba(44,44,42,0.25)'}
              strokeWidth="1.5"
            />
            <text x={pt.cx} y={pt.cy + 4.5} textAnchor="middle"
              fill={isActive || isDone ? '#fff' : C.faint}
              fontSize="11" fontWeight="600"
              style={{ fontFamily: 'var(--font-mono)', pointerEvents: 'none' }}>
              {i + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Phase3({ router }: { router: ReturnType<typeof useRouter> }) {
  const [tStep, setTStep] = useState(0);
  const [ui, setUi]       = useState<'tapping' | 'psychoed'>('tapping');
  const round    = Math.floor(tStep / 4) + 1;
  const pointIdx = tStep % 4;
  const advance  = () => tStep < 7 ? setTStep(s => s + 1) : setUi('psychoed');

  if (ui === 'psychoed') return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: 520, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: C.muted, lineHeight: 1.8, margin: 0 }}>
        Esta angustia que sientes es una reacción natural de tu cuerpo ante una amenaza.
        No estás en peligro físico real en este momento.
        <br /><br />
        El engaño no es tu culpa. Fuiste manipulado/a por un adulto que usó tus emociones
        en tu contra. Lo que estás viviendo tiene nombre: se llama extorsión, y es un delito.
        <br /><br />
        Respira. Estás a salvo aquí.
      </p>
      <Btn onClick={() => router.push('/joven/chat')}>Regresar con ANA</Btn>
    </motion.div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.faint, margin: 0 }}>
        Ronda {round} de 2
      </p>
      <FaceMap active={pointIdx} onTap={advance} />
      <AnimatePresence mode="wait">
        <motion.p key={tStep}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.38 }}
          style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 400, color: C.text, textAlign: 'center', maxWidth: 360, lineHeight: 1.5, margin: 0 }}>
          {EFT[pointIdx].text}
        </motion.p>
      </AnimatePresence>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: C.faint, textAlign: 'center', margin: 0 }}>
        Toca el punto {pointIdx + 1} ({EFT[pointIdx].label}) en tu cuerpo
      </p>
      <div style={{ width: '100%', maxWidth: 280 }}>
        <Btn onClick={advance}>{tStep < 7 ? 'Siguiente punto' : 'Terminar'}</Btn>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   FASE 4 — Respiración Diafragmática Lenta
═══════════════════════════════════════════════════════ */

const DIAPHRAGM_SEQ: { phase: BreathPhase; ms: number; label: string }[] = [
  { phase: 'inhale', ms: 3500, label: 'Inhala lento...' },
  { phase: 'sip',    ms: 1500, label: 'Lleva el aire hacia tu abdomen...' },
  { phase: 'exhale', ms: 4000, label: 'Suelta despacio...' },
];
const DIAPHRAGM_CYCLES = 6;

function Phase4({ onDone }: { onDone: () => void }) {
  const [ui, setUi]     = useState<'breathing' | 'checkin'>('breathing');
  const [step, setStep] = useState(0);

  const seq   = DIAPHRAGM_SEQ[step % 3];
  const bp    = seq?.phase ?? 'exhale';
  const label = seq?.label ?? '';

  useEffect(() => {
    if (ui !== 'breathing') return;
    if (step >= DIAPHRAGM_CYCLES * 3) { setUi('checkin'); return; }
    const { ms } = DIAPHRAGM_SEQ[step % 3];
    const t = setTimeout(() => setStep(s => s + 1), ms);
    return () => clearTimeout(t);
  }, [step, ui]);

  if (ui === 'checkin') return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%', maxWidth: 320 }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, color: C.text, textAlign: 'center', margin: 0 }}>
        ¿Cómo te sientes?
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        <Btn onClick={onDone}>Un poco mejor</Btn>
        <Btn variant="ghost" onClick={() => { setStep(0); setUi('breathing'); }}>Repetir</Btn>
      </div>
    </motion.div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 }}>
      <BreathBubble bp={bp} color="#7299bc" />
      <AnimatePresence mode="wait">
        <motion.p key={label}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28 }}
          style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, color: C.muted, textAlign: 'center', letterSpacing: '-0.01em', margin: 0 }}>
          {label}
        </motion.p>
      </AnimatePresence>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: C.faint, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
        Ciclo {Math.min(Math.floor(step / 3) + 1, DIAPHRAGM_CYCLES)} de {DIAPHRAGM_CYCLES}
      </p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   FASE 5 — Reacomodo Postural
═══════════════════════════════════════════════════════ */

const POSTURE_STEPS = [
  'Pon ambos pies en el piso.',
  'Endereza un poco tu espalda.',
  'Relaja tus hombros.',
  'Levanta suavemente la mirada.',
  'Respira. Tu cuerpo puede volver a sentirse seguro.',
];

function Phase5({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const isLast = step === POSTURE_STEPS.length - 1;

  return (
    <AnimatePresence mode="wait">
      <motion.div key={step}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36, width: '100%', maxWidth: 380, textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: C.faint, letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
          {step + 1} de {POSTURE_STEPS.length}
        </p>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400, color: C.text, lineHeight: 1.5, margin: 0 }}>
          {POSTURE_STEPS[step]}
        </p>
        <div style={{ width: '100%', maxWidth: 280 }}>
          <Btn onClick={isLast ? onDone : () => setStep(s => s + 1)}>
            {isLast ? 'Listo' : 'Siguiente'}
          </Btn>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════
   FASE 6 — Etiquetado Emocional
═══════════════════════════════════════════════════════ */

const EMOTION_LABELS = ['Miedo', 'Vergüenza', 'Culpa', 'Asco', 'Enojo', 'Confusión', 'Tristeza', 'No sé'];

function Phase6({ onDone }: { onDone: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  if (selected) return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%', maxWidth: 400, textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500, color: C.text, margin: 0 }}>
        {selected}
      </p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: C.muted, lineHeight: 1.7, margin: 0 }}>
        Gracias. Ponerle nombre a lo que sientes puede ayudar a que tu cuerpo baje un poco la alarma.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 280 }}>
        <Btn onClick={onDone}>Continuar</Btn>
        <Btn variant="ghost" onClick={() => setSelected(null)}>Elegir otra</Btn>
      </div>
    </motion.div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%', maxWidth: 440 }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 500, color: C.text, textAlign: 'center', margin: 0 }}>
        ¿Qué nombre se parece más a lo que estás sintiendo?
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%' }}>
        {EMOTION_LABELS.map(e => (
          <motion.button key={e} whileTap={{ scale: 0.97 }} onClick={() => setSelected(e)}
            style={{
              padding: '18px 12px', borderRadius: 16,
              border: `1px solid ${C.bdr}`, background: C.card,
              fontFamily: 'var(--font-body)', fontSize: 16, color: C.text,
              cursor: 'pointer', textAlign: 'center',
            }}>
            {e}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   FASE 7 — Categorías Mentales Simples
═══════════════════════════════════════════════════════ */

const MIND_CATS = [
  { emoji: '🍕', label: 'Comidas' },
  { emoji: '🐾', label: 'Animales' },
  { emoji: '🎨', label: 'Colores' },
  { emoji: '🎵', label: 'Canciones' },
  { emoji: '🏡', label: 'Lugares seguros' },
];

function Phase7({ onDone }: { onDone: () => void }) {
  const [cat, setCat]         = useState<number | null>(null);
  const [answers, setAnswers] = useState<string[]>(Array(5).fill(''));
  const [done, setDone]       = useState(false);

  if (done) return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%', maxWidth: 320, textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, color: C.text, margin: 0 }}>
        Bien.
      </p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: C.muted, lineHeight: 1.65, margin: 0 }}>
        Tu mente acaba de volver un poco al presente.
      </p>
      <Btn onClick={onDone}>Continuar</Btn>
    </motion.div>
  );

  if (cat !== null) return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 480, width: '100%', margin: '0 auto' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.faint, marginBottom: 8, marginTop: 0 }}>
          Nombra 5
        </p>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 500, color: C.text, margin: 0 }}>
          {MIND_CATS[cat].emoji} {MIND_CATS[cat].label}
        </h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <input key={i} value={answers[i]}
            onChange={e => {
              const next = [...answers];
              next[i] = e.target.value;
              setAnswers(next);
            }}
            placeholder={`${i + 1}.`}
            style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: C.text, background: C.card, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: '12px 16px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
          />
        ))}
      </div>
      <Btn onClick={() => setDone(true)}>Terminé</Btn>
      <button onClick={() => { setCat(null); setAnswers(Array(5).fill('')); }}
        style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: C.faint, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3, padding: 0 }}>
        Elegir otra categoría
      </button>
    </motion.div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, width: '100%', maxWidth: 400 }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: C.muted, margin: '0 0 8px' }}>
          Vamos a darle una tarea simple a tu mente.
        </p>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, color: C.text, margin: 0 }}>
          Elige una categoría
        </h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        {MIND_CATS.map((c, i) => (
          <motion.button key={i} whileTap={{ scale: 0.97 }} onClick={() => setCat(i)}
            style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '18px 24px',
              borderRadius: 18, border: `1px solid ${C.bdr}`, background: C.card,
              cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 17, color: C.text,
              textAlign: 'left', width: '100%',
            }}>
            <span style={{ fontSize: 26 }}>{c.emoji}</span>
            {c.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   FASE 8 — Conteo Hacia Atrás Simple
═══════════════════════════════════════════════════════ */

function Phase8({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(20);

  if (count <= 0) return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%', maxWidth: 320, textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, color: C.text, margin: 0 }}>
        Llegaste.
      </p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: C.muted, lineHeight: 1.65, margin: 0 }}>
        Tu mente estuvo enfocada en algo concreto. Eso es suficiente.
      </p>
      <Btn onClick={onDone}>Continuar</Btn>
    </motion.div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36, width: '100%', maxWidth: 360 }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: C.faint, textAlign: 'center', margin: 0 }}>
        Vamos a contar hacia atrás, poco a poco.
      </p>
      <AnimatePresence mode="wait">
        <motion.p key={count}
          initial={{ opacity: 0, scale: 0.82 }} animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.12 }} transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(72px, 22vw, 96px)', fontWeight: 300, color: C.text, margin: 0, letterSpacing: '-0.04em', lineHeight: 1 }}>
          {count}
        </motion.p>
      </AnimatePresence>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 280 }}>
        <Btn onClick={() => setCount(c => c - 1)}>Siguiente número</Btn>
        <Btn variant="ghost" onClick={onDone}>Esto no me ayuda</Btn>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   FASE 9 — Burbujas de Calma
═══════════════════════════════════════════════════════ */

const BUBBLE_WORDS = ['Suelta', 'Respira', 'Aquí', 'Ahora', 'Poco a poco', 'Calma', 'Presente', 'Seguro'];

function Phase9({ onDone }: { onDone: () => void }) {
  const [popped, setPopped] = useState<Set<number>>(new Set());
  const allPopped = popped.size === BUBBLE_WORDS.length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, width: '100%' }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: C.faint, textAlign: 'center', margin: 0 }}>
        Toca las burbujas para soltarlas.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center', minHeight: 260 }}>
        <AnimatePresence>
          {BUBBLE_WORDS.map((word, i) =>
            !popped.has(i) ? (
              <motion.button
                key={i}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(80);
                  setPopped(p => new Set([...p, i]));
                }}
                style={{
                  width: 100, height: 100, borderRadius: '50%',
                  background: 'radial-gradient(ellipse at 35% 30%, #a0c4e2cc 0%, #7299bc 60%, #5b81a8dd 100%)',
                  boxShadow: '0 8px 28px rgba(91,129,168,0.22), inset 0 -4px 10px rgba(0,0,0,0.08), inset 0 6px 12px rgba(255,255,255,0.3)',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 400,
                  color: 'rgba(255,255,255,0.92)', textAlign: 'center', padding: 8, lineHeight: 1.3,
                }}
              >
                {word}
              </motion.button>
            ) : null
          )}
        </AnimatePresence>
      </div>
      {allPopped ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', maxWidth: 280 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 400, color: C.muted, textAlign: 'center', margin: 0 }}>
            Bien. Soltaste todo.
          </p>
          <Btn onClick={onDone}>Continuar</Btn>
        </motion.div>
      ) : (
        <div style={{ width: '100%', maxWidth: 280 }}>
          <Btn variant="ghost" onClick={onDone}>Terminar</Btn>
        </div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   FASE 10 — Frases de Anclaje al Presente
═══════════════════════════════════════════════════════ */

const ANCHOR_PHRASES = [
  'Estoy aquí.',
  'Este es el presente.',
  'Mis pies están tocando el piso.',
  'Estoy respirando.',
  'Ahora puedo ir paso a paso.',
];

function Phase10({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const isLast = step === ANCHOR_PHRASES.length - 1;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40, width: '100%', maxWidth: 400 }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.faint, margin: 0 }}>
        {step + 1} de {ANCHOR_PHRASES.length}
      </p>
      <AnimatePresence mode="wait">
        <motion.p key={step}
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, color: C.text, textAlign: 'center', lineHeight: 1.45, margin: 0 }}>
          {ANCHOR_PHRASES[step]}
        </motion.p>
      </AnimatePresence>
      <div style={{ width: '100%', maxWidth: 280 }}>
        <Btn onClick={isLast ? onDone : () => setStep(s => s + 1)}>
          {isLast ? 'Terminar' : 'Siguiente frase'}
        </Btn>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   FASE 11 — Texturas de Anclaje
═══════════════════════════════════════════════════════ */

const TEXTURE_STEPS = [
  'Toca algo cerca de ti.',
  'Nota si está frío o tibio.',
  'Nota si es suave, duro, áspero o liso.',
  'Presiona un poco y siente que estás aquí.',
];
const TEXTURE_TAGS = ['Frío', 'Tibio', 'Suave', 'Duro', 'Áspero', 'Liso'];

function Phase11({ onDone }: { onDone: () => void }) {
  const [ui, setUi]           = useState<'steps' | 'tags' | 'done'>('steps');
  const [step, setStep]       = useState(0);
  const [selected, setSelected] = useState<string[]>([]);

  if (ui === 'done') return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%', maxWidth: 320, textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, color: C.text, margin: 0 }}>Bien.</p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: C.muted, lineHeight: 1.65, margin: 0 }}>
        Tu cuerpo registró algo real. Sigues aquí.
      </p>
      <Btn onClick={onDone}>Continuar</Btn>
    </motion.div>
  );

  if (ui === 'tags') return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%', maxWidth: 400 }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400, color: C.text, textAlign: 'center', margin: 0 }}>
        ¿Cómo describirías lo que estás tocando?
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
        {TEXTURE_TAGS.map(tag => {
          const isOn = selected.includes(tag);
          return (
            <motion.button key={tag} whileTap={{ scale: 0.97 }}
              onClick={() => setSelected(p => isOn ? p.filter(t => t !== tag) : [...p, tag])}
              style={{
                padding: '12px 22px', borderRadius: 999,
                border: isOn ? 'none' : `1px solid ${C.bdr}`,
                background: isOn ? C.text : C.card,
                color: isOn ? C.bg : C.text,
                fontFamily: 'var(--font-body)', fontSize: 15,
                cursor: 'pointer', transition: 'all 200ms ease',
              }}>
              {tag}
            </motion.button>
          );
        })}
      </div>
      <div style={{ width: '100%', maxWidth: 280 }}>
        <Btn onClick={() => setUi('done')}>Listo</Btn>
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div key={step}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36, width: '100%', maxWidth: 360, textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.faint, margin: 0 }}>
          {step + 1} de {TEXTURE_STEPS.length}
        </p>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400, color: C.text, lineHeight: 1.5, margin: 0 }}>
          {TEXTURE_STEPS[step]}
        </p>
        <div style={{ width: '100%', maxWidth: 280 }}>
          <Btn onClick={() => step < TEXTURE_STEPS.length - 1 ? setStep(s => s + 1) : setUi('tags')}>
            {step < TEXTURE_STEPS.length - 1 ? 'Siguiente' : 'Continuar'}
          </Btn>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════
   FASE 12 — Olores de Anclaje
═══════════════════════════════════════════════════════ */

const SMELL_SUGGESTIONS = ['Café', 'Jabón', 'Crema', 'Ropa limpia', 'Shampoo', 'Comida', 'Perfume suave'];
const SMELL_STEPS = [
  'Acércalo un poco.',
  'Inhala suavemente.',
  'Nota si el olor es dulce, fresco, fuerte o familiar.',
  'Vuelve a mirar la pantalla cuando estés listo/a.',
];

function Phase12({ onDone, onFallback }: { onDone: () => void; onFallback: (fase: number) => void }) {
  const [ui, setUi]   = useState<'intro' | 'steps' | 'fallback' | 'done'>('intro');
  const [step, setStep] = useState(0);

  if (ui === 'done') return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%', maxWidth: 320, textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, color: C.text, margin: 0 }}>Bien.</p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: C.muted, lineHeight: 1.65, margin: 0 }}>
        Un olor familiar puede ser un ancla poderosa.
      </p>
      <Btn onClick={onDone}>Continuar</Btn>
    </motion.div>
  );

  if (ui === 'fallback') return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%', maxWidth: 360, textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, color: C.text, margin: 0 }}>
        Sin problema.
      </p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: C.muted, margin: 0 }}>
        Puedes probar con una de estas:
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 300 }}>
        <Btn onClick={() => onFallback(11)}>Texturas de Anclaje</Btn>
        <Btn variant="ghost" onClick={() => onFallback(10)}>Frases de Anclaje al Presente</Btn>
      </div>
    </motion.div>
  );

  if (ui === 'steps') return (
    <AnimatePresence mode="wait">
      <motion.div key={step}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36, width: '100%', maxWidth: 360, textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.faint, margin: 0 }}>
          {step + 1} de {SMELL_STEPS.length}
        </p>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400, color: C.text, lineHeight: 1.5, margin: 0 }}>
          {SMELL_STEPS[step]}
        </p>
        <div style={{ width: '100%', maxWidth: 280 }}>
          <Btn onClick={() => step < SMELL_STEPS.length - 1 ? setStep(s => s + 1) : setUi('done')}>
            {step < SMELL_STEPS.length - 1 ? 'Siguiente' : 'Listo'}
          </Btn>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, width: '100%', maxWidth: 440 }}>
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, color: C.text, margin: '0 0 10px' }}>
          Busca un olor seguro cerca de ti.
        </h3>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: C.faint, margin: 0 }}>
          Puede ser cualquiera de estos:
        </p>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        {SMELL_SUGGESTIONS.map(s => (
          <span key={s} style={{ padding: '8px 16px', borderRadius: 999, background: C.card, border: `1px solid ${C.bdr}`, fontFamily: 'var(--font-body)', fontSize: 14, color: C.muted }}>
            {s}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
        <Btn onClick={() => setUi('steps')}>Ya lo tengo</Btn>
        <Btn variant="ghost" onClick={() => setUi('fallback')}>No tengo nada cerca</Btn>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   Vista de selección — agrupada por categoría
═══════════════════════════════════════════════════════ */

function SelectionView({ isMobile, router }: { isMobile: boolean; router: ReturnType<typeof useRouter> }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
        style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8B8780', marginBottom: 10 }}>
        Basados en investigación científica
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
        style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? '1.9rem' : 'clamp(36px, 3.6vw, 48px)', fontWeight: 600, color: '#2C2C2A', margin: '0 0 10px' }}>
        Métodos para calmarte
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}
        style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? 15 : 17, color: '#57544E', marginBottom: 40 }}>
        Elige según lo que estás sintiendo ahora.
      </motion.p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
        {(() => {
          let gi = 0;
          return CATEGORIES.map(cat => {
            const catStart = gi;
            return (
              <div key={cat.id}>
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + catStart * 0.03 }}
                  style={{ marginBottom: 20, paddingBottom: 14, borderBottom: `1px solid ${C.bdr}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: C.text, margin: 0 }}>
                      {cat.label}
                    </h2>
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: C.faint, margin: '0 0 0 18px', lineHeight: 1.5 }}>
                    {cat.hint}
                  </p>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
                  {cat.methods.map(m => {
                    const cardIdx = gi++;
                    const hk = `${cat.id}-${m.fase}`;
                    const isHovered = hovered === hk;
                    return (
                      <motion.div
                        key={m.name}
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 + cardIdx * 0.05, duration: 0.45 }}
                        onMouseEnter={() => setHovered(hk)}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => router.push(`/joven/regulacion?fase=${m.fase}`)}
                        style={{
                          background: '#FBF9F5', borderRadius: 22,
                          border: '1px solid rgba(44,44,42,0.07)', padding: 28, cursor: 'pointer',
                          transition: 'transform 250ms ease, box-shadow 250ms ease',
                          transform: isHovered ? 'translateY(-3px)' : 'none',
                          boxShadow: isHovered
                            ? '0 2px 6px rgba(44,44,42,0.05), 0 12px 30px rgba(44,44,42,0.08)'
                            : '0 1px 3px rgba(44,44,42,0.04)',
                          display: 'flex', flexDirection: 'column', gap: 0,
                        }}
                      >
                        <div style={{ marginBottom: 18 }}>
                          <BlobOrb color={m.color} idx={cardIdx} />
                        </div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 500, color: '#2C2C2A', margin: '0 0 8px', lineHeight: 1.25 }}>
                          {m.name}
                        </h3>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, color: '#6a6560', lineHeight: 1.6, margin: '0 0 18px', flex: 1 }}>
                          {m.desc}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B8780' }}>
                            {m.time}
                          </span>
                          <button
                            onClick={e => { e.stopPropagation(); router.push(`/joven/regulacion?fase=${m.fase}`); }}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              padding: '8px 16px', borderRadius: 999,
                              border: '1px solid rgba(44,44,42,0.18)', background: 'transparent',
                              cursor: 'pointer', fontFamily: 'var(--font-body)',
                              fontSize: 13, fontWeight: 500, color: '#2C2C2A',
                              transition: 'background 200ms ease',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(44,44,42,0.05)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            Practicar <ArrowRight size={13} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          });
        })()}
      </div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        style={{ marginTop: 40, padding: '16px 20px', borderRadius: 16, background: 'rgba(167,199,231,0.12)', border: '1px solid rgba(167,199,231,0.35)', maxWidth: 540 }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#57544E', lineHeight: 1.65, margin: 0 }}>
          Si en este momento te sientes en crisis o no puedes usar estas herramientas,{' '}
          <button
            onClick={() => router.push('/joven/chat')}
            style={{ color: '#5b81a8', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', textDecoration: 'underline', textUnderlineOffset: 3, padding: 0 }}>
            habla con ANA ahora
          </button>.
        </p>
      </motion.div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   Vista de fase (ejercicio activo)
═══════════════════════════════════════════════════════ */

const PHASE_META = [
  { eyebrow: 'Descompresión Fisiológica', color: '#5b81a8', time: '< 2 min' },
  { eyebrow: 'Grounding y Reconexión',    color: '#6b7f5e', time: '~ 3 min' },
  { eyebrow: 'Procesamiento Cognitivo',   color: '#c4a882', time: '~ 5 min' },
  { eyebrow: 'Respiración Diafragmática', color: '#7299bc', time: '~ 2 min' },
  { eyebrow: 'Reacomodo Postural',        color: '#8a9e7a', time: '< 1 min' },
  { eyebrow: 'Etiquetado Emocional',      color: '#b8956f', time: '< 1 min' },
  { eyebrow: 'Categorías Mentales',       color: '#a8855c', time: '~ 2 min' },
  { eyebrow: 'Conteo Hacia Atrás',        color: '#9a7650', time: '~ 2 min' },
  { eyebrow: 'Burbujas de Calma',         color: '#89afd1', time: '~ 2 min' },
  { eyebrow: 'Frases de Anclaje',         color: '#7a9570', time: '< 2 min' },
  { eyebrow: 'Texturas de Anclaje',       color: '#6e8865', time: '< 2 min' },
  { eyebrow: 'Olores de Anclaje',         color: '#5e7855', time: '< 2 min' },
];

type FaseNum = 1|2|3|4|5|6|7|8|9|10|11|12;

function PhaseView({ fase, router, isMobile }: { fase: FaseNum; router: ReturnType<typeof useRouter>; isMobile: boolean }) {
  const m = PHASE_META[fase - 1];
  const handleDone = () => router.push('/joven/regulacion');

  return (
    <>
      <div style={{ marginBottom: isMobile ? 28 : 36 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8B8780', marginBottom: 6 }}>
          {m.eyebrow}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B8780' }}>
            {m.time}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={fase}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 20 }}
        >
          {fase === 1  && <Phase1 onDone={handleDone} />}
          {fase === 2  && <Phase2 onDone={handleDone} />}
          {fase === 3  && <Phase3 router={router} />}
          {fase === 4  && <Phase4 onDone={handleDone} />}
          {fase === 5  && <Phase5 onDone={handleDone} />}
          {fase === 6  && <Phase6 onDone={handleDone} />}
          {fase === 7  && <Phase7 onDone={handleDone} />}
          {fase === 8  && <Phase8 onDone={handleDone} />}
          {fase === 9  && <Phase9 onDone={handleDone} />}
          {fase === 10 && <Phase10 onDone={handleDone} />}
          {fase === 11 && <Phase11 onDone={handleDone} />}
          {fase === 12 && <Phase12 onDone={handleDone} onFallback={f => router.push(`/joven/regulacion?fase=${f}`)} />}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   Main
═══════════════════════════════════════════════════════ */

const VALID_FASES = ['1','2','3','4','5','6','7','8','9','10','11','12'];

function RegulacionInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const isMobile     = useMediaQuery('(max-width: 768px)');

  const fp   = searchParams.get('fase');
  const fase = VALID_FASES.includes(fp ?? '') ? (Number(fp) as FaseNum) : null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F5F2EE' }}>

      {/* Top bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center',
        padding: isMobile ? '14px 18px' : '16px 32px',
        borderBottom: '1px solid rgba(44,44,42,0.08)',
        background: 'rgba(245,242,238,0.92)', backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button
          onClick={() => fase ? router.push('/joven/regulacion') : router.back()}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#8B8780', fontFamily: 'var(--font-body)',
            fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: 0,
          }}
        >
          <ChevronLeft size={14} /> {fase ? 'Métodos' : 'Atrás'}
        </button>
        <AnclaLogo size="sm" color="#2C2C2A" />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {fase && (
            <button
              onClick={() => router.push('/joven/silencioso')}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#8B8780', fontFamily: 'var(--font-body)',
                fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: 0,
              }}
            >
              Salir <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1, maxWidth: 1200, width: '100%', margin: '0 auto',
        padding: isMobile ? '28px 18px 48px' : '50px 60px 80px',
      }}>
        {fase
          ? <PhaseView fase={fase} router={router} isMobile={isMobile} />
          : <SelectionView isMobile={isMobile} router={router} />
        }
      </div>

      {/* Footer — solo durante fase activa */}
      {fase && (
        <div style={{ padding: isMobile ? '12px 18px' : '14px 32px', borderTop: '1px solid rgba(44,44,42,0.06)', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#8B8780', letterSpacing: '0.04em', margin: 0 }}>
            Nada de lo que hagas aquí se guarda en tu dispositivo.
          </p>
        </div>
      )}
    </div>
  );
}

export default function RegulacionPage() {
  return (
    <Suspense>
      <RegulacionInner />
    </Suspense>
  );
}
