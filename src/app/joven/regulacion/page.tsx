'use client';

import { useState, useEffect, useRef, useMemo, Suspense, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import AnclaLogo from '@/components/brand/AnclaLogo';
import { ChevronLeft, X } from 'lucide-react';

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
      { name: 'Tensión y Liberación', desc: 'Aprieta los puños, sostén la tensión y suéltala. Una descarga física rápida para ansiedad intensa, enojo o sensación de que te vas a desbordar.', time: '< 2 MIN', fase: '13', color: '#6a8aaa' },
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
      { name: 'Pesca de Frases', desc: 'Saca peces del agua. Cada uno trae consigo una frase que tu mente puede llevarse.', time: '~ 3 MIN', fase: '14', color: '#b89a72' },
      { name: 'Etiquetado Emocional', desc: 'Ponerle nombre a lo que sientes ayuda al cerebro a bajar la intensidad emocional. Solo elige lo que más se parece.', time: '< 1 MIN', fase: '6', color: '#b8956f' },
      { name: 'Categorías Mentales', desc: 'Darle una tarea simple a la mente interrumpe los pensamientos repetitivos y la devuelve al presente.', time: '~ 2 MIN', fase: '7', color: '#a8855c' },
      { name: 'Conteo Hacia Atrás', desc: 'Contar hacia atrás desde 20 ocupa la mente activa y corta el ciclo de rumiación sin ninguna presión.', time: '~ 2 MIN', fase: '8', color: '#9a7650' },
    ],
  },
];

/* ── Global CSS keyframes (injected once in RegulacionInner) ── */
const GLOBAL_CSS = `
@keyframes ancla-blob-0 {
  0%,100% { border-radius: 62% 38% 55% 45% / 50% 60% 40% 50%; transform: translate(-50%,-50%) rotate(var(--rot0)) scale(1); }
  33%     { border-radius: 45% 55% 60% 40% / 55% 45% 60% 45%; transform: translate(-50%,-50%) rotate(calc(var(--rot0) + 12deg)) scale(1.03); }
  66%     { border-radius: 55% 45% 40% 60% / 45% 60% 50% 55%; transform: translate(-50%,-50%) rotate(calc(var(--rot0) - 10deg)) scale(0.98); }
}
@keyframes ancla-blob-1 {
  0%,100% { border-radius: 50% 50% 65% 35% / 60% 40% 55% 45%; transform: translate(-50%,-50%) rotate(var(--rot0)) scale(1.01); }
  25%     { border-radius: 65% 35% 40% 60% / 45% 55% 40% 60%; transform: translate(-50%,-50%) rotate(calc(var(--rot0) + 18deg)) scale(1); }
  50%     { border-radius: 40% 60% 55% 45% / 65% 35% 60% 40%; transform: translate(-50%,-50%) rotate(calc(var(--rot0) - 8deg)) scale(1.04); }
  75%     { border-radius: 55% 45% 50% 50% / 40% 60% 45% 55%; transform: translate(-50%,-50%) rotate(calc(var(--rot0) + 4deg)) scale(0.99); }
}
@keyframes ancla-blob-2 {
  0%,100% { border-radius: 58% 42% 45% 55% / 55% 50% 50% 45%; transform: translate(-50%,-50%) rotate(var(--rot0)) scale(1); }
  40%     { border-radius: 42% 58% 60% 40% / 40% 60% 40% 60%; transform: translate(-50%,-50%) rotate(calc(var(--rot0) + 14deg)) scale(1.05); }
  70%     { border-radius: 55% 45% 35% 65% / 65% 35% 55% 45%; transform: translate(-50%,-50%) rotate(calc(var(--rot0) - 12deg)) scale(0.97); }
}
@keyframes ancla-highlight {
  0%,100% { transform: translate(-50%,-50%) translate(-22%,-28%); opacity: .65; }
  50%     { transform: translate(-50%,-50%) translate(18%,12%);   opacity: .35; }
}
@keyframes ancla-fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes ancla-bar {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
@keyframes ancla-face-in {
  from { opacity: 0; transform: translateY(2px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes ancla-shake {
  from { transform: translateX(-1.5px) translateY(0.5px) rotate(-0.3deg); }
  to   { transform: translateX(1.5px) translateY(-0.5px) rotate(0.3deg); }
}
@keyframes ancla-wobble {
  from { transform: translateY(-1px) rotate(-0.6deg); }
  to   { transform: translateY(1px) rotate(0.6deg); }
}
@keyframes ancla-droplet-wobble {
  0%,100% { border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%; }
  18%     { border-radius: 56% 44% 48% 52% / 46% 54% 50% 50%; }
  36%     { border-radius: 47% 53% 56% 44% / 53% 47% 45% 55%; }
  55%     { border-radius: 52% 48% 45% 55% / 56% 44% 53% 47%; }
  74%     { border-radius: 45% 55% 53% 47% / 47% 53% 56% 44%; }
}
@keyframes ancla-caustic-a {
  0%,100% { transform: translate(0,0) scale(1);      opacity: 0.9; }
  33%     { transform: translate(8%,12%) scale(1.1);  opacity: 0.7; }
  66%     { transform: translate(-6%,4%) scale(0.95); opacity: 1; }
}
@keyframes ancla-caustic-b {
  0%,100% { transform: translate(0,0) scale(1.05);       opacity: 0.6; }
  40%     { transform: translate(-10%,-6%) scale(0.9);    opacity: 0.9; }
  70%     { transform: translate(4%,-12%) scale(1.15);    opacity: 0.4; }
}
@keyframes ancla-bubble-wobble-0 {
  0%,100% { border-radius: 50%; transform: scale(1); }
  33%     { border-radius: 56% 44% 48% 52% / 46% 54% 50% 50%; transform: scale(1.03); }
  66%     { border-radius: 47% 53% 56% 44% / 53% 47% 45% 55%; transform: scale(0.98); }
}
@keyframes ancla-bubble-wobble-1 {
  0%,100% { border-radius: 50%; transform: scale(1.01); }
  25%     { border-radius: 45% 55% 55% 45% / 55% 45% 50% 50%; transform: scale(0.97); }
  50%     { border-radius: 52% 48% 45% 55% / 56% 44% 53% 47%; transform: scale(1.04); }
  75%     { border-radius: 55% 45% 50% 50% / 45% 55% 48% 52%; transform: scale(1); }
}
@keyframes ancla-bubble-wobble-2 {
  0%,100% { border-radius: 50%; transform: scale(1); }
  40%     { border-radius: 58% 42% 53% 47% / 47% 53% 56% 44%; transform: scale(1.05); }
  70%     { border-radius: 44% 56% 47% 53% / 52% 48% 44% 56%; transform: scale(0.96); }
}
@keyframes ancla-bubble-shine {
  0%,100% { transform: translate(0,0) scale(1); opacity: 0.85; }
  35%     { transform: translate(18%,24%) scale(0.85); opacity: 0.5; }
  70%     { transform: translate(-8%,14%) scale(1.1); opacity: 0.7; }
}
@keyframes ancla-bubble-burst {
  0%   { transform: scale(1) skew(0deg); opacity: 1; }
  40%  { transform: scale(1.35,0.7) skew(-4deg); opacity: 0.85; }
  70%  { transform: scale(0.6,1.6) skew(6deg); opacity: 0.35; }
  100% { transform: scale(0.2) skew(0deg); opacity: 0; }
}
@keyframes ancla-bubble-flash {
  0%   { transform: scale(0.6); opacity: 0; }
  30%  { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1.6); opacity: 0; }
}
@keyframes ancla-bubble-shock {
  0%   { transform: scale(1);   opacity: 0.9; }
  100% { transform: scale(2.2); opacity: 0; }
}
@keyframes ancla-droplet-fly {
  0%   { transform: translate(0,0) scale(0.4); opacity: 0; }
  15%  { opacity: 1; }
  70%  { opacity: 1; }
  100% { transform: translate(var(--dx),var(--dy)) scale(1); opacity: 0; }
}
@keyframes ancla-frase-aura {
  0%,100% { transform: scale(1); opacity: 1; }
  50%     { transform: scale(1.08); opacity: 0.7; }
}
@keyframes ancla-frase-mote {
  0%,100% { transform: translate(0,0) scale(1); opacity: 0.6; }
  33%     { transform: translate(4px,-8px) scale(1.2); opacity: 0.9; }
  66%     { transform: translate(-6px,4px) scale(0.8); opacity: 0.4; }
}
@keyframes ancla-lake-ambient {
  0%   { transform: scale(1); opacity: 0.9; }
  100% { transform: scale(1.18); opacity: 0; }
}
@keyframes ancla-lake-click {
  0%   { transform: scale(1); opacity: 0.9; }
  100% { transform: scale(1.5); opacity: 0; }
}
@keyframes ancla-bfly-float {
  0%,100% { transform: translateY(0) rotate(-2deg); }
  50%     { transform: translateY(-4px) rotate(2deg); }
}
@keyframes ancla-bfly-flap-l {
  0%,100% { transform: scaleX(1); }
  50%     { transform: scaleX(0.18); }
}
@keyframes ancla-bfly-flap-r {
  0%,100% { transform: scaleX(1); }
  50%     { transform: scaleX(0.18); }
}
@keyframes ancla-guide-bob {
  0%,100% { transform: translateY(0); }
  50%     { transform: translateY(-6px); }
}
@keyframes ancla-bubble-in {
  0%   { opacity: 0; transform: scale(0.92) translateY(4px); }
  60%  { opacity: 1; transform: scale(1.02) translateY(0); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes ancla-fish-wag {
  0%,100% { transform: rotate(-12deg); }
  50%     { transform: rotate(12deg); }
}
@keyframes ancla-fish-swim-l {
  0%   { transform: translateX(-18%); }
  100% { transform: translateX(118%); }
}
@keyframes ancla-fish-swim-r {
  0%   { transform: translateX(118%); }
  100% { transform: translateX(-18%); }
}
@keyframes ancla-fish-hooked {
  0%   { transform: translateX(48%) translateY(0) rotate(0deg); }
  40%  { transform: translateX(48%) translateY(-90px) rotate(-15deg); }
  70%  { transform: translateX(48%) translateY(-160px) rotate(8deg); }
  100% { transform: translateX(48%) translateY(-220px) rotate(-4deg); opacity: 0; }
}
@keyframes ancla-fish-float {
  0%,100% { transform: translateY(0); }
  50%     { transform: translateY(-8px); }
}
@keyframes ancla-bubble-rise {
  0%   { transform: translateY(0); opacity: 0.5; }
  100% { transform: translateY(-60px); opacity: 0; }
}
@keyframes ancla-bubble-appear {
  from { opacity: 0; transform: scale(0.3); }
  to   { opacity: 1; transform: scale(1); }
}
`;

/* ── BlobOrb — CSS-based, 3 variants ── */
function BlobOrb({ color = '#5b81a8', idx = 0, size = 80, style: extraStyle }: {
  color?: string; idx?: number; size?: number; style?: React.CSSProperties;
}) {
  const variant = idx % 3;
  const speeds  = [9.6, 10.1, 8.4];
  const dur     = speeds[variant];
  const rot0    = (idx * 23) % 360;

  const blob = {
    position: 'absolute' as const,
    left: '50%', top: '50%',
    width: '100%', height: '100%',
    background: `radial-gradient(circle at 35% 30%, ${color}f2, ${color} 55%, ${color}cc 100%)`,
    boxShadow: `0 4px 14px ${color}55, 0 1px 2px rgba(0,0,0,0.08), inset -4px -6px 14px ${color}44, inset 4px 4px 14px rgba(255,255,255,0.18)`,
    animation: `ancla-blob-${variant} ${dur}s ease-in-out infinite`,
    willChange: 'border-radius, transform' as const,
    '--rot0': `${rot0}deg`,
  } as React.CSSProperties;

  const hi = {
    position: 'absolute' as const,
    left: '35%', top: '30%', width: '32%', height: '24%',
    background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.85), rgba(255,255,255,0) 70%)',
    filter: 'blur(2px)',
    animation: `ancla-highlight ${dur * 1.3}s ease-in-out infinite`,
    pointerEvents: 'none' as const,
  };

  return (
    <div style={{ position: 'relative', width: size, height: size, flex: '0 0 auto', ...(extraStyle || {}) }} aria-hidden="true">
      <div style={blob} />
      <div style={hi} />
    </div>
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

/* ── Shared primitives ── */
const buzz = (pattern: number | number[]) => {
  try { if (navigator.vibrate) navigator.vibrate(pattern as number); } catch (_) {}
};

function Btn({ children, onClick, variant = 'primary', disabled, style: extraStyle }: {
  children: ReactNode; onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'quiet';
  disabled?: boolean; style?: React.CSSProperties;
}) {
  const base: React.CSSProperties = {
    width: '100%', padding: '14px 28px', borderRadius: 999,
    fontFamily: 'var(--font-body)', fontSize: variant === 'quiet' ? 13.5 : 15,
    fontWeight: 500, letterSpacing: '0.005em',
    transition: 'transform .15s ease, background .2s ease, opacity .2s',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  };
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: '#2C2C2A', color: '#F5F2EE', border: '1px solid #2C2C2A' },
    ghost:   { background: 'transparent', color: '#2C2C2A', border: '1px solid rgba(44,44,42,0.18)' },
    quiet:   { background: 'transparent', color: '#57544E', border: '1px solid transparent' },
  };
  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseDown={e => { if (!disabled) (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)'; }}
      onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
      onTouchStart={e => { if (!disabled) (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)'; }}
      onTouchEnd={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
      style={{ ...base, ...variants[variant], ...(extraStyle || {}) }}
    >
      {children}
    </button>
  );
}

function Counter({ current, total, color }: { current: number; total: number; color: string }) {
  return (
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em',
      textTransform: 'uppercase', color: C.faint,
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, opacity: 0.7, flexShrink: 0 }} />
      {current} / {total}
    </div>
  );
}

function FadeKey({ k, children, dur = 0.55 }: { k: string | number; children: ReactNode; dur?: number }) {
  return (
    <div key={String(k)} style={{ animation: `ancla-fade-up ${dur}s cubic-bezier(.4,0,.2,1) both` }}>
      {children}
    </div>
  );
}

function CenteredFlow({ children }: { children: ReactNode }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 22, padding: '8px 4px 32px',
      width: '100%', maxWidth: 480, margin: '0 auto', textAlign: 'center',
    }}>
      {children}
    </div>
  );
}

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)', fontWeight: 400,
  fontSize: 'clamp(26px, 5vw, 36px)', lineHeight: 1.18,
  color: C.text, letterSpacing: '-0.015em', margin: 0,
};
const instructionStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(22px, 4.4vw, 30px)',
  lineHeight: 1.3, fontWeight: 400, color: C.text, margin: 0,
};
const mutedTextStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)', fontSize: 15,
  lineHeight: 1.55, color: C.body, margin: '8px 0 0', maxWidth: 420,
};

const bubbleEyebrow: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em',
  textTransform: 'uppercase', color: C.faint, margin: '0 0 8px', fontWeight: 500,
};
const bubbleTitle: React.CSSProperties = {
  fontFamily: 'var(--font-display)', fontWeight: 400,
  fontSize: 'clamp(18px, 3.5vw, 22px)', lineHeight: 1.35,
  color: C.text, margin: '0 0 6px',
};
const bubbleBody: React.CSSProperties = {
  fontFamily: 'var(--font-body)', fontSize: 14,
  lineHeight: 1.5, color: C.body, margin: '6px 0 0',
};
const microStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em',
  textTransform: 'uppercase', color: C.faint, margin: 0,
};
const categoryRowStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '16px 20px', borderRadius: 16, background: C.card,
  border: `1px solid ${C.bdr}`, color: C.text, textAlign: 'left' as const,
  cursor: 'pointer', width: '100%', transition: 'background .2s ease',
};

/* ── AuraPhrase ─────────────────────────────────────── */
function AuraPhrase({ color, k, eyebrow, title, body, italic = false }: {
  color: string; k: string | number; eyebrow?: string; title: string; body?: string; italic?: boolean;
}) {
  return (
    <div style={{
      position: 'relative', width: '100%', maxWidth: 540,
      minHeight: 'clamp(220px, 32vh, 280px)', padding: '24px', margin: '8px 0 32px',
      display: 'grid', placeItems: 'center',
    }}>
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 70% 55% at center, ${color}28, ${color}10 45%, transparent 72%)`,
        filter: 'blur(28px)', animation: 'ancla-frase-aura 7s ease-in-out infinite', pointerEvents: 'none',
      }} />
      <span aria-hidden="true" style={{
        position: 'absolute', left: '12%', top: '34%', width: 4, height: 4, borderRadius: '50%',
        background: color, boxShadow: `0 0 12px ${color}, 0 0 24px ${color}55`,
        animation: 'ancla-frase-mote 5s ease-in-out infinite',
      }} />
      <span aria-hidden="true" style={{
        position: 'absolute', right: '14%', bottom: '30%', width: 5, height: 5, borderRadius: '50%',
        background: '#fff', boxShadow: `0 0 14px ${color}cc, 0 0 28px ${color}66`,
        animation: 'ancla-frase-mote 6s ease-in-out infinite', animationDelay: '-2s',
      }} />
      <FadeKey key={String(k)} k={k} dur={0.75}>
        <div style={{ textAlign: 'center', position: 'relative' }}>
          {eyebrow && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.faint, margin: '0 0 14px', fontWeight: 500 }}>{eyebrow}</p>
          )}
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 400,
            fontStyle: italic ? 'italic' : 'normal',
            fontSize: 'clamp(28px, 6vw, 44px)', lineHeight: 1.3, letterSpacing: '0.018em',
            color: C.text, margin: 0, textWrap: 'balance' as React.CSSProperties['textWrap'],
          }}>{title}</h2>
          {body && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15.5, lineHeight: 1.6, color: C.body, margin: '14px auto 0', maxWidth: 420 }}>{body}</p>
          )}
        </div>
      </FadeKey>
    </div>
  );
}

/* ── LakeButton ─────────────────────────────────────── */
function LakeButton({ color, onClick, children, disabled }: {
  color: string; onClick?: () => void; children: ReactNode; disabled?: boolean;
}) {
  const [pulses, setPulses] = useState<number[]>([]);
  const handleClick = () => {
    if (disabled) return;
    const id = Date.now() + Math.random();
    setPulses(p => [...p, id]);
    setTimeout(() => setPulses(p => p.filter(x => x !== id)), 1300);
    if (onClick) onClick();
  };
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 360, isolation: 'isolate' }}>
      {!disabled && (
        <>
          <span aria-hidden="true" style={{ position: 'absolute', inset: 0, borderRadius: 999, border: `1px solid ${color}55`, animation: 'ancla-lake-ambient 5s ease-out infinite', pointerEvents: 'none', zIndex: 0 }} />
          <span aria-hidden="true" style={{ position: 'absolute', inset: 0, borderRadius: 999, border: `1px solid ${color}33`, animation: 'ancla-lake-ambient 5s ease-out infinite', animationDelay: '-2.5s', pointerEvents: 'none', zIndex: 0 }} />
        </>
      )}
      {pulses.map(id => (
        <span key={id} aria-hidden="true" style={{ position: 'absolute', inset: 0, borderRadius: 999, border: `1.5px solid ${color}`, animation: 'ancla-lake-click 1.3s cubic-bezier(.4,0,.2,1) forwards', pointerEvents: 'none', zIndex: 0 }} />
      ))}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Btn onClick={handleClick} disabled={disabled}>{children}</Btn>
      </div>
    </div>
  );
}

/* ── ModeCard ───────────────────────────────────────── */
function ModeCard({ color, title, desc, onClick }: { color: string; title: string; desc: string; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8,
        padding: '20px 22px', borderRadius: 18, background: C.card,
        border: `1px solid ${hover ? color + '88' : C.bdr}`, textAlign: 'left', cursor: 'pointer',
        transition: 'border-color .2s ease, transform .25s cubic-bezier(.4,0,.2,1), box-shadow .25s ease',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hover ? `0 10px 26px ${color}22, 0 1px 3px rgba(44,44,42,0.04)` : '0 1px 3px rgba(44,44,42,0.04)',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 0 3px ${color}22` }} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, letterSpacing: '-0.012em', color: C.text }}>{title}</span>
      </div>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.5, color: C.body }}>{desc}</span>
    </button>
  );
}

/* ── GuideFace ──────────────────────────────────────── */
function GuideFace({ expression, color }: { expression: string; color: string }) {
  switch (expression) {
    case 'hello': return (
      <g style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        <circle cx="-14" cy="-6" r="3.6" fill="#2C2C2A" /><circle cx="14" cy="-6" r="3.6" fill="#2C2C2A" />
        <circle cx="-12.5" cy="-7.5" r="1.1" fill="#FBF9F5" /><circle cx="15.5" cy="-7.5" r="1.1" fill="#FBF9F5" />
        <path d="M -10 12 Q 0 20 10 12" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      </g>
    );
    case 'curious': return (
      <g style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        <path d="M -22 -16 Q -14 -19 -8 -16" stroke="#2C2C2A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M 8 -16 Q 14 -19 22 -16" stroke="#2C2C2A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <circle cx="-14" cy="-6" r="3.6" fill="#2C2C2A" /><circle cx="14" cy="-6" r="3.6" fill="#2C2C2A" />
        <circle cx="-12.5" cy="-7.5" r="1.1" fill="#FBF9F5" /><circle cx="15.5" cy="-7.5" r="1.1" fill="#FBF9F5" />
        <ellipse cx="0" cy="14" rx="3.5" ry="4.5" fill="#2C2C2A" />
      </g>
    );
    case 'listening': return (
      <g style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        <path d="M -20 -6 Q -14 -1 -8 -6" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <path d="M 8 -6 Q 14 -1 20 -6" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <path d="M -8 11 Q 0 16 8 11" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <g opacity="0.7" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none">
          <path d="M -40 -22 L -40 -12" /><ellipse cx="-42" cy="-11" rx="3" ry="2" fill={color} stroke="none" />
          <path d="M 38 -28 L 38 -18" /><ellipse cx="36" cy="-17" rx="2.5" ry="1.8" fill={color} stroke="none" />
        </g>
      </g>
    );
    case 'touchy': return (
      <g style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        <circle cx="-13" cy="-5" r="3.2" fill="#2C2C2A" /><circle cx="13" cy="-5" r="3.2" fill="#2C2C2A" />
        <circle cx="-11.5" cy="-6.5" r="1" fill="#FBF9F5" /><circle cx="14.5" cy="-6.5" r="1" fill="#FBF9F5" />
        <path d="M -10 11 Q 0 17 10 11" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      </g>
    );
    case 'sniff': return (
      <g style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        <circle cx="-14" cy="-6" r="3.6" fill="#2C2C2A" /><circle cx="14" cy="-6" r="3.6" fill="#2C2C2A" />
        <circle cx="-12.5" cy="-7.5" r="1.1" fill="#FBF9F5" /><circle cx="15.5" cy="-7.5" r="1.1" fill="#FBF9F5" />
        <ellipse cx="0" cy="14" rx="4.5" ry="5.5" fill="#2C2C2A" />
        <g opacity="0.6" stroke={color} strokeWidth="1.7" strokeLinecap="round" fill="none">
          <path d="M -34 -8 Q -38 -16 -32 -22" /><path d="M 34 -8 Q 38 -16 32 -22" />
        </g>
      </g>
    );
    case 'taste': return (
      <g style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        <path d="M -19 -5 Q -14 -1 -9 -5" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <circle cx="14" cy="-6" r="3.6" fill="#2C2C2A" /><circle cx="15.5" cy="-7.5" r="1.1" fill="#FBF9F5" />
        <path d="M -8 11 Q 0 17 8 11" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <ellipse cx="2" cy="18" rx="3.5" ry="3" fill="#c97a7a" />
      </g>
    );
    case 'happy': return (
      <g style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        <path d="M -20 -6 Q -14 -1 -8 -6" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <path d="M 8 -6 Q 14 -1 20 -6" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <path d="M -12 11 Q 0 22 12 11" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      </g>
    );
    case 'miedo': return (
      <g style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        <path d="M -22 -16 Q -16 -22 -10 -18" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <path d="M 10 -18 Q 16 -22 22 -16" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <circle cx="-14" cy="-3" r="5" fill="#FBF9F5" stroke="#2C2C2A" strokeWidth="1.6" />
        <circle cx="-14" cy="-2" r="2.6" fill="#2C2C2A" />
        <circle cx="14" cy="-3" r="5" fill="#FBF9F5" stroke="#2C2C2A" strokeWidth="1.6" />
        <circle cx="14" cy="-2" r="2.6" fill="#2C2C2A" />
        <ellipse cx="0" cy="16" rx="3.2" ry="6.5" fill="#2C2C2A" />
        <path d="M 28 -10 Q 30 -6 28 -2 Q 26 -6 28 -10 Z" fill={color} opacity="0.7" />
      </g>
    );
    case 'verguenza': return (
      <g style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        <path d="M -22 -14 Q -16 -18 -8 -16" stroke="#2C2C2A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M 8 -16 Q 16 -18 22 -14" stroke="#2C2C2A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M -19 -3 Q -14 1 -9 -3" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M 9 -3 Q 14 1 19 -3" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <circle cx="-22" cy="6" r="11" fill="#e89090" opacity="0.7" />
        <circle cx="22" cy="6" r="11" fill="#e89090" opacity="0.7" />
        <path d="M -6 13 Q -2 16 2 13 Q 5 11 8 13" stroke="#2C2C2A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      </g>
    );
    case 'culpa': return (
      <g style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        <path d="M -22 -12 L -8 -16" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M 22 -12 L 8 -16" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M -18 -3 Q -13 1 -8 -3" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M 8 -3 Q 13 1 18 -3" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M -7 14 Q 0 11 7 14" stroke="#2C2C2A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      </g>
    );
    case 'asco': return (
      <g style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        <path d="M -22 -16 Q -16 -10 -8 -14" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <path d="M 8 -14 Q 16 -10 22 -16" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <path d="M -19 -4 Q -14 -8 -9 -4" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M 9 -4 Q 14 -8 19 -4" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M -5 3 Q 0 1 5 3" stroke="#2C2C2A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M -6 6 Q 0 4 6 6" stroke="#2C2C2A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M -14 17 Q -8 12 0 13 Q 8 12 14 17" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      </g>
    );
    case 'enojo': return (
      <g style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        <path d="M -22 -16 L -8 -10" stroke="#2C2C2A" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M 22 -16 L 8 -10" stroke="#2C2C2A" strokeWidth="2.8" strokeLinecap="round" />
        <circle cx="-13" cy="-3" r="2.8" fill="#2C2C2A" />
        <circle cx="13" cy="-3" r="2.8" fill="#2C2C2A" />
        <path d="M -8 15 Q 0 12 8 15" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      </g>
    );
    case 'confusion': return (
      <g style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        <path d="M -22 -18 Q -14 -22 -6 -16" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M 6 -14 L 22 -12" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="-13" cy="-5" r="3.2" fill="#2C2C2A" /><circle cx="13" cy="-5" r="3.2" fill="#2C2C2A" />
        <circle cx="-11.5" cy="-6.5" r="1" fill="#FBF9F5" /><circle cx="14.5" cy="-6.5" r="1" fill="#FBF9F5" />
        <path d="M -8 14 Q -4 17 0 14 Q 4 11 8 14" stroke="#2C2C2A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      </g>
    );
    case 'tristeza': return (
      <g style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        <path d="M -22 -8 L -8 -16" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M 22 -8 L 8 -16" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M -20 -2 Q -14 -7 -8 -2" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M 8 -2 Q 14 -7 20 -2" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M -10 16 Q 0 22 10 16" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <path d="M 14 4 Q 13 10 14 18 Q 17 14 16 8 Q 15 4 14 4 Z" fill={color} opacity="0.8">
          <animate attributeName="opacity" values="0;0.85;0" dur="3s" repeatCount="indefinite" />
        </path>
      </g>
    );
    case 'nose': return (
      <g style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        <path d="M -22 -14 Q -14 -17 -6 -14" stroke="#2C2C2A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M 6 -14 Q 14 -17 22 -14" stroke="#2C2C2A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <circle cx="-13" cy="-5" r="2.6" fill="#2C2C2A" /><circle cx="13" cy="-5" r="2.6" fill="#2C2C2A" />
        <path d="M -8 14 L 8 14" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" />
        <text x="34" y="-18" fontFamily="serif" fontSize="22" fontWeight="500" fill={color} opacity="0.85">?</text>
      </g>
    );
    default: return null;
  }
}

/* ── GuideCharacter ─────────────────────────────────── */
function GuideCharacter({ expression = 'hello', color = '#5b81a8', size = 130 }: { expression?: string; color?: string; size?: number }) {
  return (
    <div style={{ width: size, height: size * 1.08, flex: '0 0 auto', animation: 'ancla-guide-bob 4.5s ease-in-out infinite' }}>
      <svg viewBox="-60 -62 120 130" width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="guide-head" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" /><stop offset="60%" stopColor="#FBF9F5" /><stop offset="100%" stopColor="#EDE7DC" />
          </radialGradient>
        </defs>
        <ellipse cx="0" cy="56" rx="34" ry="4" fill="rgba(44,44,42,0.12)" />
        <ellipse cx="0" cy="0" rx="46" ry="50" fill="url(#guide-head)" stroke="rgba(44,44,42,0.18)" strokeWidth="1.5" />
        <circle cx="-26" cy="8" r="7" fill="#e8a8a8" opacity="0.4" />
        <circle cx="26" cy="8" r="7" fill="#e8a8a8" opacity="0.4" />
        <GuideFace expression={expression} color={color} />
      </svg>
    </div>
  );
}

/* ── SpeechBubble ───────────────────────────────────── */
function SpeechBubble({ children, k }: { children: ReactNode; k: string | number }) {
  return (
    <div key={String(k)} style={{
      position: 'relative', flex: '1 1 0', maxWidth: 420, minWidth: 0,
      background: '#FFFFFF', border: '1.5px solid #2C2C2A', borderRadius: 22,
      padding: '18px 22px', boxShadow: '4px 4px 0 rgba(44,44,42,0.14)',
      animation: 'ancla-bubble-in 0.45s cubic-bezier(.4,0,.2,1) both', textAlign: 'left',
    }}>
      <svg width="22" height="26" style={{ position: 'absolute', left: -15, top: 28, overflow: 'visible' }} viewBox="0 0 22 26" aria-hidden="true">
        <path d="M 1 13 L 21 1 L 21 25 Z" fill="#FFFFFF" stroke="#2C2C2A" strokeWidth="1.5" strokeLinejoin="round" />
        <rect x="20" y="2" width="3" height="22" fill="#FFFFFF" />
      </svg>
      {children}
    </div>
  );
}

/* ── GuideScene ─────────────────────────────────────── */
function GuideScene({ expression = 'hello', color, bubbleKey, children }: { expression?: string; color: string; bubbleKey: string | number; children: ReactNode }) {
  return (
    <div style={{ width: '100%', maxWidth: 560, display: 'flex', alignItems: 'center', gap: 12, animation: 'ancla-fade-up 0.5s both' }}>
      <GuideCharacter expression={expression} color={color} size={110} />
      <SpeechBubble key={String(bubbleKey)} k={bubbleKey}>{children}</SpeechBubble>
    </div>
  );
}

/* ── Butterfly ──────────────────────────────────────── */
function Butterfly({ color, size = 64, flapping = true }: { color: string; size?: number; flapping?: boolean }) {
  const gradId = `bfly-wing-${color.replace('#', '')}`;
  return (
    <svg viewBox="0 0 80 60" width={size} height={size * 0.75} style={{ overflow: 'visible', animation: flapping ? 'ancla-bfly-float 1.4s ease-in-out infinite' : 'none' }} aria-hidden="true">
      <defs>
        <radialGradient id={gradId} cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="40%" stopColor={color} stopOpacity="0.92" />
          <stop offset="100%" stopColor={color} stopOpacity="0.98" />
        </radialGradient>
      </defs>
      <g style={{ transformOrigin: '40px 30px', animation: flapping ? 'ancla-bfly-flap-l 0.55s ease-in-out infinite' : 'none' }}>
        <path d="M 38 22 C 22 4, 4 8, 8 22 C 6 30, 18 32, 38 30 Z" fill={`url(#${gradId})`} stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M 38 32 C 22 38, 12 50, 22 54 C 30 56, 36 48, 38 40 Z" fill={`url(#${gradId})`} stroke={color} strokeWidth="1.2" strokeLinejoin="round" opacity="0.92" />
        <circle cx="18" cy="18" r="2" fill="#FBF9F5" opacity="0.85" />
      </g>
      <g style={{ transformOrigin: '40px 30px', animation: flapping ? 'ancla-bfly-flap-r 0.55s ease-in-out infinite' : 'none' }}>
        <path d="M 42 22 C 58 4, 76 8, 72 22 C 74 30, 62 32, 42 30 Z" fill={`url(#${gradId})`} stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M 42 32 C 58 38, 68 50, 58 54 C 50 56, 44 48, 42 40 Z" fill={`url(#${gradId})`} stroke={color} strokeWidth="1.2" strokeLinejoin="round" opacity="0.92" />
        <circle cx="62" cy="18" r="2" fill="#FBF9F5" opacity="0.85" />
      </g>
      <path d="M 40 12 Q 41.5 30 40 50 Q 38.5 30 40 12 Z" fill="#2C2C2A" />
      <circle cx="40" cy="12" r="3" fill="#2C2C2A" />
      <path d="M 40 11 Q 36 4 33 1" stroke="#2C2C2A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M 40 11 Q 44 4 47 1" stroke="#2C2C2A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <circle cx="33" cy="1" r="1.4" fill="#2C2C2A" /><circle cx="47" cy="1" r="1.4" fill="#2C2C2A" />
    </svg>
  );
}

function ButterflySlot({ active, color }: { active: boolean; color: string }) {
  return (
    <div style={{ position: 'relative', width: 84, height: 84, display: 'grid', placeItems: 'center' }}>
      {/* halo */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: `radial-gradient(circle, ${color}55, ${color}00 65%)`,
        transform: active ? 'scale(1)' : 'scale(0.4)',
        opacity: active ? 1 : 0,
        transition: 'all 0.4s cubic-bezier(.4,0,.2,1)',
        filter: 'blur(2px)',
      }} />
      {/* pebble when inactive */}
      <div style={{
        position: 'absolute', width: 16, height: 16, borderRadius: '50%',
        background: 'rgba(44,44,42,0.10)',
        transform: active ? 'scale(0.4)' : 'scale(1)',
        opacity: active ? 0 : 1,
        transition: 'all 0.35s cubic-bezier(.4,0,.2,1)',
      }} />
      {/* butterfly pop-in via CSS transition */}
      <div style={{
        position: 'absolute',
        opacity: active ? 1 : 0,
        transform: active ? 'scale(1)' : 'scale(0.35)',
        transition: 'all 0.4s cubic-bezier(.34,1.56,.64,1)',
      }}>
        <Butterfly color={color} size={70} flapping={active} />
      </div>
    </div>
  );
}

function ButterflyTimer({ color, onDone, onExit }: { color: string; onDone: () => void; onExit: () => void }) {
  const [secs, setSecs] = useState(60);
  const [side, setSide] = useState(0);
  useEffect(() => {
    if (secs === 0) { onDone(); return; }
    const t = setTimeout(() => setSecs(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);
  useEffect(() => {
    const i = setInterval(() => { setSide(s => 1 - s); buzz(35); }, 700);
    return () => clearInterval(i);
  }, []);
  return (
    <CenteredFlow>
      <FadeKey key="bf" k="bf">
        <h2 style={titleStyle}>Abrazo de mariposa.</h2>
        <p style={mutedTextStyle}>Cruza los brazos sobre el pecho. Da golpecitos suaves y alternados en cada hombro, siguiendo el ritmo.</p>
      </FadeKey>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 56, height: 110, marginTop: 4 }}>
        <ButterflySlot active={side === 0} color={color} />
        <ButterflySlot active={side === 1} color={color} />
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, letterSpacing: '0.1em', color: C.faint }}>
        {String(Math.floor(secs / 60)).padStart(1, '0')}:{String(secs % 60).padStart(2, '0')}
      </div>
      <Btn variant="quiet" onClick={onExit}>Detener</Btn>
    </CenteredFlow>
  );
}

/* ── NaveganteFlow ──────────────────────────────────── */
const G_STEPS = [
  { count: 5, sense: 'ves',      label: '5 cosas que ves',  hint: 'Mira a tu alrededor. Nombra lo que ves.' },
  { count: 4, sense: 'escuchas', label: '4 sonidos',        hint: 'Detente. ¿Qué se escucha cerca o lejos?' },
  { count: 3, sense: 'tocas',    label: '3 texturas',       hint: 'Toca lo que tengas cerca. Nota la textura.' },
  { count: 2, sense: 'hueles',   label: '2 olores',         hint: 'Inhala. ¿Hay algún olor?' },
  { count: 1, sense: 'saboreas', label: '1 sabor',          hint: 'Pasa la lengua por tus dientes. ¿Algún sabor?' },
] as const;

const NAV_PROMPTS: Record<string, string[]> = {
  ves:       ['Mira a tu alrededor.', 'Recorre el espacio con la mirada.', 'Algo más lejos…', 'Algo cerca de ti…', 'Una última cosa que tus ojos encuentren.'],
  escuchas:  ['Detente. Escucha.', 'Un sonido un poco más lejos.', 'Algo más sutil, casi de fondo.', 'Un último sonido.'],
  tocas:     ['Toca lo que tengas cerca.', 'Otra textura, distinta.', 'Una última. Sin prisa.'],
  hueles:    ['Inhala despacio.', 'Otro olor. Puede ser sutil.'],
  saboreas:  ['Pasa la lengua por tus dientes.'],
};

const SENSE_FACE: Record<string, string> = {
  ves: 'curious', escuchas: 'listening', tocas: 'touchy', hueles: 'sniff', saboreas: 'taste',
};

function sensePhrase(sense: string) {
  switch (sense) {
    case 'ves':       return 'lo que ves';
    case 'escuchas':  return 'lo que escuchas';
    case 'tocas':     return 'lo que puedes tocar';
    case 'hueles':    return 'los olores cercanos';
    case 'saboreas':  return 'el sabor en tu boca';
    default:          return sense;
  }
}

function NaveganteFlow({ color, itemMs = 7000, onDone, onExit }: { color: string; itemMs?: number; onDone: () => void; onExit: () => void }) {
  const [step, setStep]       = useState(0);
  const [subStep, setSubStep] = useState(0);
  const [mode, setMode]       = useState<'item' | 'transition'>('item');
  const [paused, setPaused]   = useState(false);

  const s = G_STEPS[step];

  useEffect(() => {
    if (mode !== 'item' || paused) return;
    const t = setTimeout(() => advance(), itemMs);
    return () => clearTimeout(t);
  }, [mode, step, subStep, paused]);

  const advance = () => {
    const lastSub  = subStep === s.count - 1;
    const lastStep = step === G_STEPS.length - 1;
    if (!lastSub) { setSubStep(ss => ss + 1); return; }
    if (lastStep)  { onDone(); return; }
    setMode('transition');
  };

  const continueAfterTransition = () => { setStep(st => st + 1); setSubStep(0); setMode('item'); };

  if (mode === 'transition') {
    const next = G_STEPS[step + 1];
    return (
      <CenteredFlow>
        <GuideScene expression="happy" color={color} bubbleKey={`tx-${step}`}>
          <p style={{ ...bubbleEyebrow, color }}>{s.label.toUpperCase()} · LISTO</p>
          <h2 style={bubbleTitle}>¡Bien hecho! Sigue respirando.</h2>
          <p style={bubbleBody}>Ahora vamos a {sensePhrase(next.sense)}. Cuando estés listo/a, continúa.</p>
        </GuideScene>
        <Btn onClick={continueAfterTransition}>{next.label} →</Btn>
        <Btn variant="quiet" onClick={onExit}>Detener</Btn>
      </CenteredFlow>
    );
  }

  const prompts = NAV_PROMPTS[s.sense] || [];
  const prompt  = prompts[subStep] || s.hint;

  return (
    <CenteredFlow>
      <Counter current={step + 1} total={5} color={color} />
      <GuideScene expression={SENSE_FACE[s.sense]} color={color} bubbleKey={`${step}-${subStep}`}>
        <p style={bubbleEyebrow}>{s.label.toUpperCase()} · {subStep + 1} DE {s.count}</p>
        <h2 style={bubbleTitle}>{prompt}</h2>
      </GuideScene>
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        {Array.from({ length: s.count }).map((_, i) => (
          <span key={i} style={{ width: i === subStep ? 22 : 6, height: 6, borderRadius: 3, background: i <= subStep ? color : 'rgba(44,44,42,0.12)', transition: 'width 0.4s cubic-bezier(.4,0,.2,1), background 0.3s ease' }} />
        ))}
      </div>
      <div style={{ width: '100%', maxWidth: 420, marginTop: 6 }}>
        <div style={{ height: 2, background: 'rgba(44,44,42,0.08)', borderRadius: 2, overflow: 'hidden' }}>
          <div key={`${step}-${subStep}-${paused}`} style={{ height: '100%', background: color, transformOrigin: 'left center', animation: paused ? 'none' : `ancla-bar ${itemMs}ms linear forwards` }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 420 }}>
        <Btn variant="ghost" onClick={() => setPaused(p => !p)}>{paused ? 'Reanudar' : 'Pausar'}</Btn>
        <Btn variant="ghost" onClick={advance}>Siguiente →</Btn>
      </div>
      <Btn variant="quiet" onClick={onExit}>Detener</Btn>
    </CenteredFlow>
  );
}

/* ═══════════════════════════════════════════════════════
   FASE 1 — Suspiro Fisiológico
═══════════════════════════════════════════════════════ */

type MoteDef = {
  id: number; bx: number; by: number; size: number;
  dur: number; delay: number;
  waypoints: { x: number; y: number; o: number }[];
  isWhite: boolean;
};

function BreathOrb({ color, scale = 1, ms = 2000 }: {
  color: string; scale?: number; ms?: number;
}) {
  const [instanceId, setInstanceId] = useState('');
  const [motes, setMotes] = useState<MoteDef[]>([]);

  useEffect(() => {
    const id = 'orb-' + Math.random().toString(36).slice(2, 8);
    setInstanceId(id);
    const N = 11;
    const arr: MoteDef[] = [];
    for (let i = 0; i < N; i++) {
      let bx = 0, by = 0, tries = 0;
      do { bx = 8 + Math.random() * 84; by = 8 + Math.random() * 84; tries++; }
      while (tries < 12 && bx > 30 && bx < 70 && by > 30 && by < 70);
      const waypoints: { x: number; y: number; o: number }[] = [];
      for (let j = 0; j < 4; j++) waypoints.push({ x: (Math.random() - 0.5) * 90, y: (Math.random() - 0.5) * 90, o: 0.2 + Math.random() * 0.65 });
      arr.push({ id: i, bx, by, size: 2 + Math.random() * 3.5, dur: 10 + Math.random() * 10, delay: -Math.random() * 14, waypoints, isWhite: Math.random() < 0.35 });
    }
    setMotes(arr);
  }, []);

  useEffect(() => {
    if (!instanceId || motes.length === 0) return;
    let css = '';
    motes.forEach(m => {
      const np = m.waypoints.length;
      let kf = `@keyframes ancla-${instanceId}-${m.id} {\n  0%   { transform: translate(0,0); opacity: 0; }\n  8%   { opacity: ${m.waypoints[0].o.toFixed(2)}; }\n`;
      m.waypoints.forEach((w, idx) => {
        const pct = 10 + ((idx + 1) / (np + 1)) * 80;
        kf += `  ${pct.toFixed(1)}% { transform: translate(${w.x.toFixed(1)}px, ${w.y.toFixed(1)}px); opacity: ${w.o.toFixed(2)}; }\n`;
      });
      kf += `  92%  { opacity: 0; }\n  100% { transform: translate(0,0); opacity: 0; }\n}\n`;
      css += kf;
    });
    const tagId = 'kf-' + instanceId;
    let tag = document.getElementById(tagId) as HTMLStyleElement | null;
    if (!tag) { tag = document.createElement('style'); tag.id = tagId; document.head.appendChild(tag); }
    tag.textContent = css;
    return () => { try { tag?.remove(); } catch (_) {} };
  }, [instanceId, motes]);

  const tx = `transform ${ms}ms cubic-bezier(.4,0,.2,1)`;
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 360, aspectRatio: '1 / 1', display: 'grid', placeItems: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(circle, ${color}26, ${color}10 38%, transparent 65%)`, filter: 'blur(28px)', transform: `scale(${scale * 1.35})`, transition: tx }} />
      <div style={{ position: 'absolute', inset: '6%', borderRadius: '50%', background: `radial-gradient(circle, ${color}3a, ${color}18 45%, transparent 70%)`, filter: 'blur(22px)', transform: `scale(${scale * 1.22})`, transition: tx }} />
      <div style={{ position: 'absolute', inset: '18%', borderRadius: '50%', background: `radial-gradient(circle, ${color}55, ${color}25 50%, transparent 78%)`, filter: 'blur(14px)', transform: `scale(${scale * 1.12})`, transition: tx }} />
      <div style={{
        position: 'relative', width: '54%', aspectRatio: '1 / 1', borderRadius: '50%',
        background: `radial-gradient(circle at 62% 72%, rgba(255,255,255,0.55), rgba(255,255,255,0) 24%), radial-gradient(circle at 32% 28%, ${color}40, ${color}00 50%), radial-gradient(circle at 50% 50%, ${color}cc, ${color}dc 60%, ${color}c8 100%)`,
        transform: `scale(${scale})`, transition: tx,
        boxShadow: `inset 0 1.5px 0 rgba(255,255,255,0.55), inset 0 -10px 24px ${color}99, inset 0 0 0 1px ${color}55, 0 10px 38px ${color}40`,
        overflow: 'hidden', animation: 'ancla-droplet-wobble 9s ease-in-out infinite',
      }}>
        <div style={{ position: 'absolute', left: '20%', top: '6%', width: '60%', height: '14%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,255,255,0.65), rgba(255,255,255,0) 72%)', transform: 'rotate(-10deg)', filter: 'blur(3px)', opacity: 0.85 }} />
        <div style={{ position: 'absolute', left: '4%', bottom: '10%', width: '55%', height: '50%', borderRadius: '50%', background: `radial-gradient(circle at 40% 60%, ${color}, ${color}00 65%)`, mixBlendMode: 'multiply' as const, opacity: 0.4, filter: 'blur(10px)' }} />
        <div style={{ position: 'absolute', left: '12%', top: '8%', width: '60%', height: '60%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.22), rgba(255,255,255,0) 70%)', animation: 'ancla-caustic-a 14s ease-in-out infinite', filter: 'blur(7px)' }} />
        <div style={{ position: 'absolute', left: '52%', top: '58%', width: '22%', height: '22%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.75), rgba(255,255,255,0) 60%)', filter: 'blur(2.5px)', animation: 'ancla-caustic-b 16s ease-in-out infinite' }} />
      </div>
      {motes.map(m => (
        <span key={m.id} style={{
          position: 'absolute', left: `${m.bx}%`, top: `${m.by}%`,
          width: m.size, height: m.size, marginLeft: -m.size / 2, marginTop: -m.size / 2,
          borderRadius: '50%',
          background: m.isWhite ? 'rgba(255,255,255,0.9)' : color,
          boxShadow: m.isWhite ? `0 0 ${m.size * 3}px rgba(255,255,255,0.6), 0 0 ${m.size * 6}px ${color}66` : `0 0 ${m.size * 3}px ${color}, 0 0 ${m.size * 6}px ${color}66`,
          animation: instanceId ? `ancla-${instanceId}-${m.id} ${m.dur}s ease-in-out infinite` : 'none',
          animationDelay: `${m.delay}s`, pointerEvents: 'none', willChange: 'transform, opacity',
        }} />
      ))}
    </div>
  );
}

const SUSPIRO_SEQ: { label: string; ms: number; scale: number }[] = [
  { label: 'Inhala…',               ms: 2000, scale: 1.0  },
  { label: 'Otro sorbito de aire…', ms: 500,  scale: 1.18 },
  { label: 'Suelta lento…',         ms: 4000, scale: 0.78 },
];

function Phase1({ onDone, color }: { onDone: () => void; color: string }) {
  const [state, setState] = useState<'breathing' | 'checkin'>('breathing');
  const [cycle, setCycle] = useState(0);
  const [step, setStep]   = useState(0);
  const totalCycles = 3;

  useEffect(() => {
    if (state !== 'breathing') return;
    const t = setTimeout(() => {
      if (step < SUSPIRO_SEQ.length - 1) { setStep(s => s + 1); }
      else if (cycle < totalCycles - 1)  { setCycle(c => c + 1); setStep(0); }
      else                               { setState('checkin'); }
    }, SUSPIRO_SEQ[step].ms);
    return () => clearTimeout(t);
  }, [step, cycle, state]);

  const cur = SUSPIRO_SEQ[step];

  if (state === 'breathing') return (
    <CenteredFlow>
      <Counter current={cycle + 1} total={totalCycles} color={color} />
      <BreathOrb color={color} scale={cur.scale} ms={cur.ms} />
      <FadeKey key={`${step}-${cycle}`} k={`${step}-${cycle}`}>
        <p style={instructionStyle}>{cur.label}</p>
      </FadeKey>
      <Btn variant="quiet" onClick={onDone}>Detener</Btn>
    </CenteredFlow>
  );

  return (
    <CenteredFlow>
      <FadeKey key="checkin" k="checkin">
        <h2 style={titleStyle}>¿Cómo te sientes ahora?</h2>
        <p style={mutedTextStyle}>No hay respuesta correcta. Solo nota lo que está pasando en tu cuerpo.</p>
      </FadeKey>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 360 }}>
        <Btn variant="ghost" onClick={onDone}>Más tranquilo/a</Btn>
        <Btn variant="ghost" onClick={() => { setCycle(0); setStep(0); setState('breathing'); }}>Un poco mejor — repetir</Btn>
      </div>
    </CenteredFlow>
  );
}

/* ═══════════════════════════════════════════════════════
   FASE 2 — 5-4-3-2-1 + Abrazo de Mariposa
═══════════════════════════════════════════════════════ */

function Phase2({ onDone, color }: { onDone: () => void; color: string }) {
  const [phase, setPhase] = useState<'modePick' | 'grounding' | 'navegante' | 'butterfly' | 'checkin'>('modePick');
  const [step, setStep]   = useState(0);
  const [vals, setVals]   = useState<string[][]>(() => G_STEPS.map(s => Array(s.count).fill('')));

  if (phase === 'modePick') return (
    <CenteredFlow>
      <GuideScene expression="hello" color={color} bubbleKey="mode">
        <p style={bubbleEyebrow}>HOLA</p>
        <h2 style={bubbleTitle}>¿Cómo te gustaría hacerlo?</h2>
        <p style={bubbleBody}>Dos formas de llegar al mismo lugar. Elige la que se sienta mejor ahora.</p>
      </GuideScene>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 480 }}>
        <ModeCard color={color} title="Modo escrito" desc="A algunas personas las calma escribir. Vas a teclear cada cosa que percibas." onClick={() => setPhase('grounding')} />
        <ModeCard color={color} title="Modo navegante" desc="A veces no hay ganas de escribir. Yo te guío. Solo piensa en cada cosa y respira." onClick={() => setPhase('navegante')} />
      </div>
      <Btn variant="quiet" onClick={onDone}>Elegir otro método</Btn>
    </CenteredFlow>
  );

  if (phase === 'navegante') return (
    <NaveganteFlow color={color} onDone={() => setPhase('butterfly')} onExit={onDone} />
  );

  if (phase === 'grounding') {
    const s = G_STEPS[step];
    const last = step === G_STEPS.length - 1;
    const allFilled = vals[step].every(v => v.trim().length > 0);
    return (
      <CenteredFlow>
        <Counter current={step + 1} total={5} color={color} />
        <GuideScene expression={SENSE_FACE[s.sense]} color={color} bubbleKey={step}>
          <p style={bubbleEyebrow}>{s.label.toUpperCase()}</p>
          <h2 style={bubbleTitle}>{s.hint}</h2>
        </GuideScene>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 420 }}>
          {vals[step].map((v, idx) => (
            <input key={idx} type="text" autoFocus={idx === 0} value={v}
              onChange={e => {
                const next = vals.map(arr => [...arr]);
                next[step][idx] = e.target.value;
                setVals(next);
              }}
              placeholder={`Algo que ${s.sense}…`}
              style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: C.text, background: C.card, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: '12px 16px', outline: 'none', width: '100%', boxSizing: 'border-box' as const }}
            />
          ))}
        </div>
        <Btn disabled={!allFilled} onClick={() => last ? setPhase('butterfly') : setStep(st => st + 1)}>
          {last ? 'Continuar al abrazo' : 'Siguiente'}
        </Btn>
      </CenteredFlow>
    );
  }

  if (phase === 'butterfly') return (
    <ButterflyTimer color={color} onDone={() => setPhase('checkin')} onExit={onDone} />
  );

  return (
    <CenteredFlow>
      <FadeKey key="done" k="done"><h2 style={titleStyle}>Estás aquí, en este momento.</h2></FadeKey>
      <p style={mutedTextStyle}>Tu cuerpo acaba de pasar un minuto entero ocupado en el presente.</p>
      <LakeButton color={color} onClick={onDone}>Volver al catálogo</LakeButton>
    </CenteredFlow>
  );
}

/* ═══════════════════════════════════════════════════════
   FASE 3 — Tapping EFT + Psicoeducación
═══════════════════════════════════════════════════════ */

const EFT = [
  { label: 'ceja',          text: 'Aunque cometí un error al confiar...',                        cx: 50, cy: 32 },
  { label: 'lado del ojo',  text: '...hoy reconozco que soy la víctima de un engaño...',         cx: 66, cy: 34 },
  { label: 'bajo la nariz', text: '...lo que me hicieron se llama extorsión y es un delito...',  cx: 50, cy: 46 },
  { label: 'clavícula',     text: '...y elijo estar a salvo.',                                    cx: 50, cy: 70 },
];

function TapFaceMap({ active, color }: { active: number; color: string }) {
  return (
    <svg viewBox="0 0 100 100" width={200} height={200} style={{ overflow: 'visible' }}>
      {/* soft shadow beneath the doll */}
      <ellipse cx="50" cy="95" rx="30" ry="2.5" fill="rgba(44,44,42,0.08)" />
      
      {/* doll head and body with high-contrast outlines */}
      <ellipse cx="50" cy="38" rx="22" ry="26" fill="#FFFFFF" stroke="rgba(44,44,42,0.18)" strokeWidth="1.2" />
      <path d="M 18 78 Q 50 60 82 78 L 82 95 L 18 95 Z" fill="#FFFFFF" stroke="rgba(44,44,42,0.18)" strokeWidth="1.2" />
      {EFT.map((pt, i) => {
        const isActive = pt.cx === EFT[active].cx && pt.cy === EFT[active].cy && i === active;
        const isDone   = i < active;
        return (
          <g key={pt.label}>
            <circle cx={pt.cx} cy={pt.cy} r={isActive ? 4.5 : 2.5}
              fill={isActive ? color : isDone ? color + '88' : '#8B8780'}
              opacity={isActive ? 1 : isDone ? 0.7 : 0.5}
              style={{ transition: 'all .4s ease' }}
            />
            {isActive && (
              <circle cx={pt.cx} cy={pt.cy} r="7.5" fill="none" stroke={color} strokeWidth="0.8" opacity="0.5">
                <animate attributeName="r" values="4.5;9.5;4.5" dur="1.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0.05;0.5" dur="1.6s" repeatCount="indefinite" />
              </circle>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function Phase3({ onDone, router, color }: { onDone: () => void; router: ReturnType<typeof useRouter>; color: string }) {
  const [tStep, setTStep] = useState(0);
  const [ui, setUi]       = useState<'tapping' | 'psychoed'>('tapping');
  const round    = Math.floor(tStep / 4) + 1;
  const pointIdx = tStep % 4;
  const advance  = () => tStep < 7 ? setTStep(s => s + 1) : setUi('psychoed');

  if (ui === 'psychoed') return (
    <CenteredFlow>
      <FadeKey key="ed" k="ed">
        <h2 style={titleStyle}>Hiciste dos rondas.</h2>
      </FadeKey>
      <p style={{ ...mutedTextStyle, maxWidth: 480 }}>
        Esta angustia que sientes es una reacción natural de tu cuerpo ante una amenaza.
        No estás en peligro físico real en este momento.
        <br /><br />
        El engaño no es tu culpa. Fuiste manipulado/a por un adulto que usó tus emociones
        en tu contra. Lo que estás viviendo tiene nombre: se llama extorsión, y es un delito.
        <br /><br />
        Respira. Estás a salvo aquí.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 360 }}>
        <LakeButton color={color} onClick={onDone}>Volver al catálogo</LakeButton>
        <Btn variant="ghost" onClick={() => router.push('/joven/chat')}>Regresar con ANA</Btn>
      </div>
    </CenteredFlow>
  );

  return (
    <CenteredFlow>
      <Counter current={round} total={2} color={color} />
      <TapFaceMap active={pointIdx} color={color} />
      <FadeKey key={tStep} k={tStep}>
        <p style={microStyle}>{EFT[pointIdx].label}</p>
        <p style={{ ...instructionStyle, fontStyle: 'italic', maxWidth: 360 }}>{EFT[pointIdx].text}</p>
      </FadeKey>
      <Btn variant="quiet" onClick={onDone}>Detener</Btn>
      <LakeButton color={color} onClick={advance}>Toqué este punto · siguiente</LakeButton>
    </CenteredFlow>
  );
}

/* ═══════════════════════════════════════════════════════
   FASE 4 — Respiración Diafragmática Lenta
═══════════════════════════════════════════════════════ */

const DIAF_SEQ: { label: string; ms: number; scale: number }[] = [
  { label: 'Inhala despacio, lleva el aire al abdomen…', ms: 3500, scale: 1.18 },
  { label: 'Sostén un momento…',                         ms: 1500, scale: 1.18 },
  { label: 'Exhala lento…',                              ms: 4000, scale: 0.82 },
];

function Phase4({ onDone, color }: { onDone: () => void; color: string }) {
  const [state, setState] = useState<'breathing' | 'done'>('breathing');
  const [cycle, setCycle] = useState(0);
  const [step, setStep]   = useState(0);
  const total = 6;

  useEffect(() => {
    if (state !== 'breathing') return;
    const t = setTimeout(() => {
      if (step < DIAF_SEQ.length - 1) { setStep(s => s + 1); }
      else if (cycle < total - 1)     { setCycle(c => c + 1); setStep(0); }
      else                            { setState('done'); }
    }, DIAF_SEQ[step].ms);
    return () => clearTimeout(t);
  }, [step, cycle, state]);

  if (state === 'done') return (
    <CenteredFlow>
      <FadeKey key="done" k="done">
        <h2 style={titleStyle}>Llegaste al sexto ciclo.</h2>
      </FadeKey>
      <p style={mutedTextStyle}>Tu cuerpo acaba de practicar bajar la alarma.</p>
      <Btn variant="ghost" onClick={() => { setCycle(0); setStep(0); setState('breathing'); }}>Repetir</Btn>
      <Btn onClick={onDone}>Volver al catálogo</Btn>
    </CenteredFlow>
  );

  const cur = DIAF_SEQ[step];
  return (
    <CenteredFlow>
      <Counter current={cycle + 1} total={total} color={color} />
      <BreathOrb color={color} scale={cur.scale} ms={cur.ms} />
      <FadeKey key={`${step}-${cycle}`} k={`${step}-${cycle}`}>
        <p style={instructionStyle}>{cur.label}</p>
      </FadeKey>
      <Btn variant="quiet" onClick={onDone}>Detener</Btn>
    </CenteredFlow>
  );
}

/* ═══════════════════════════════════════════════════════
   FASE 5 — Reacomodo Postural
═══════════════════════════════════════════════════════ */

const POSTURAL_STEPS: { pose: 'feet' | 'back' | 'shoulders' | 'gaze' | 'breathe'; text: string }[] = [
  { pose: 'feet',      text: 'Pon ambos pies en el piso.' },
  { pose: 'back',      text: 'Endereza un poco tu espalda.' },
  { pose: 'shoulders', text: 'Relaja tus hombros.' },
  { pose: 'gaze',      text: 'Levanta suavemente la mirada.' },
  { pose: 'breathe',   text: 'Respira. Tu cuerpo puede volver a sentirse seguro.' },
];

function PostureCharacter({ pose, color, size = 200 }: { pose: string; color: string; size?: number }) {
  return (
    <div style={{ width: size, height: size * 1.5, flex: '0 0 auto' }}>
      <svg viewBox="0 0 160 240" width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="post-head" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" /><stop offset="60%" stopColor="#FBF9F5" /><stop offset="100%" stopColor="#EDE7DC" />
          </radialGradient>
          <linearGradient id="post-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FBF9F5" /><stop offset="100%" stopColor="#EDE7DC" />
          </linearGradient>
        </defs>

        {pose === 'breathe' && (
          <ellipse cx="80" cy="150" rx="70" ry="86" fill={color} opacity="0.18">
            <animate attributeName="rx" values="68;82;68" dur="4s" repeatCount="indefinite" />
            <animate attributeName="ry" values="84;96;84" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.12;0.22;0.12" dur="4s" repeatCount="indefinite" />
          </ellipse>
        )}

        <line x1="22" y1="230" x2="138" y2="230" stroke="rgba(44,44,42,0.16)" strokeWidth="1.4" strokeDasharray="4 4" />
        <ellipse cx="80" cy="230" rx="46" ry="3.5" fill="rgba(44,44,42,0.12)" />

        <rect x="60" y="176" width="16" height="54" rx="8" fill="url(#post-body)" stroke="rgba(44,44,42,0.18)" strokeWidth="1.3" />
        <rect x="84" y="176" width="16" height="54" rx="8" fill="url(#post-body)" stroke="rgba(44,44,42,0.18)" strokeWidth="1.3" />

        <ellipse cx="63" cy="230" rx="12" ry="5" fill="#2C2C2A" />
        <ellipse cx="97" cy="230" rx="12" ry="5" fill="#2C2C2A" />

        {pose === 'feet' && (
          <g fill="none" stroke={color} strokeWidth="2">
            <circle cx="63" cy="230" r="14" opacity="0.6">
              <animate attributeName="r" values="12;26;12" dur="2.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0;0.6" dur="2.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="97" cy="230" r="14" opacity="0.6">
              <animate attributeName="r" values="12;26;12" dur="2.2s" repeatCount="indefinite" begin="-1.1s" />
              <animate attributeName="opacity" values="0.6;0;0.6" dur="2.2s" repeatCount="indefinite" begin="-1.1s" />
            </circle>
          </g>
        )}

        <ellipse cx="80" cy={pose === 'back' ? 142 : 146} rx="36" ry={pose === 'back' ? 46 : 40}
          fill="url(#post-body)" stroke="rgba(44,44,42,0.18)" strokeWidth="1.3"
          style={{ transition: 'cy 0.55s ease, ry 0.55s ease' } as React.CSSProperties}
        />

        {pose === 'back' && (
          <g>
            <line x1="80" y1="104" x2="80" y2="186" stroke={color} strokeWidth="2.6" strokeLinecap="round" opacity="0.65" />
            <g transform="translate(124 142)" fill={color} opacity="0.85">
              <path d="M -5 6 L 0 -2 L 5 6 Z">
                <animateTransform attributeName="transform" type="translate" values="124 148; 124 138; 124 148" dur="1.8s" repeatCount="indefinite" />
              </path>
              <path d="M -5 14 L 0 6 L 5 14 Z" opacity="0.5">
                <animateTransform attributeName="transform" type="translate" values="124 156; 124 146; 124 156" dur="1.8s" repeatCount="indefinite" />
              </path>
            </g>
          </g>
        )}

        <path d={pose === 'shoulders' ? 'M 46 132 Q 36 168 34 200' : 'M 46 118 Q 34 155 32 192'}
          stroke="url(#post-body)" strokeWidth="13" strokeLinecap="round" fill="none"
          style={{ transition: 'd 0.55s ease' } as React.CSSProperties}
        />
        <path d={pose === 'shoulders' ? 'M 114 132 Q 124 168 126 200' : 'M 114 118 Q 126 155 128 192'}
          stroke="url(#post-body)" strokeWidth="13" strokeLinecap="round" fill="none"
          style={{ transition: 'd 0.55s ease' } as React.CSSProperties}
        />

        {pose === 'shoulders' && (
          <g stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.7">
            <path d="M 22 118 Q 28 124 22 132"><animate attributeName="opacity" values="0;0.7;0" dur="2.4s" repeatCount="indefinite" /></path>
            <path d="M 16 136 Q 22 142 16 150"><animate attributeName="opacity" values="0;0.6;0" dur="2.4s" repeatCount="indefinite" begin="-0.8s" /></path>
            <path d="M 138 118 Q 132 124 138 132"><animate attributeName="opacity" values="0;0.7;0" dur="2.4s" repeatCount="indefinite" begin="-0.4s" /></path>
            <path d="M 144 136 Q 138 142 144 150"><animate attributeName="opacity" values="0;0.6;0" dur="2.4s" repeatCount="indefinite" begin="-1.2s" /></path>
          </g>
        )}

        <g transform={`translate(80 ${pose === 'gaze' ? 68 : pose === 'back' ? 70 : 74}) rotate(${pose === 'gaze' ? -6 : 0})`}
          style={{ transition: 'transform 0.55s ease' }}>
          <ellipse cx="0" cy="0" rx="38" ry="42" fill="url(#post-head)" stroke="rgba(44,44,42,0.18)" strokeWidth="1.4" />
          <circle cx="-22" cy="8" r="6" fill="#e8a8a8" opacity="0.4" />
          <circle cx="22"  cy="8" r="6" fill="#e8a8a8" opacity="0.4" />
          {pose === 'gaze' ? (
            <g key="gaze" style={{ animation: 'ancla-face-in 0.35s ease both' }}>
              <circle cx="-12" cy="-11" r="3.2" fill="#2C2C2A" /><circle cx="12" cy="-11" r="3.2" fill="#2C2C2A" />
              <circle cx="-10.5" cy="-12.5" r="1" fill="#FBF9F5" /><circle cx="13.5" cy="-12.5" r="1" fill="#FBF9F5" />
              <path d="M -7 10 Q 0 14 7 10" stroke="#2C2C2A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            </g>
          ) : pose === 'breathe' ? (
            <g key="breathe" style={{ animation: 'ancla-face-in 0.35s ease both' }}>
              <path d="M -17 -5 Q -12 -1 -7 -5" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
              <path d="M 7 -5 Q 12 -1 17 -5"   stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
              <path d="M -7 10 Q 0 16 7 10"     stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            </g>
          ) : (
            <g key="default" style={{ animation: 'ancla-face-in 0.35s ease both' }}>
              <circle cx="-12" cy="-5" r="3.2" fill="#2C2C2A" /><circle cx="12" cy="-5" r="3.2" fill="#2C2C2A" />
              <circle cx="-10.5" cy="-6.5" r="1" fill="#FBF9F5" /><circle cx="13.5" cy="-6.5" r="1" fill="#FBF9F5" />
              <path d="M -8 11 Q 0 16 8 11" stroke="#2C2C2A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            </g>
          )}
        </g>

        {pose === 'breathe' && (
          <g fill={color}>
            <circle cx="80" cy="40" r="2.5">
              <animate attributeName="cy" values="42;14;42" dur="3.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0.7;0" dur="3.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="92" cy="46" r="2">
              <animate attributeName="cy" values="48;22;48" dur="3.2s" repeatCount="indefinite" begin="-1s" />
              <animate attributeName="opacity" values="0;0.6;0" dur="3.2s" repeatCount="indefinite" begin="-1s" />
            </circle>
            <circle cx="68" cy="46" r="2">
              <animate attributeName="cy" values="48;22;48" dur="3.2s" repeatCount="indefinite" begin="-2s" />
              <animate attributeName="opacity" values="0;0.6;0" dur="3.2s" repeatCount="indefinite" begin="-2s" />
            </circle>
          </g>
        )}
      </svg>
    </div>
  );
}

function Phase5({ onDone, color }: { onDone: () => void; color: string }) {
  const [step, setStep] = useState(0);
  const last = step === POSTURAL_STEPS.length - 1;
  const cur  = POSTURAL_STEPS[step];
  return (
    <CenteredFlow>
      <Counter current={step + 1} total={POSTURAL_STEPS.length} color={color} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, width: '100%', maxWidth: 600 }}>
        <PostureCharacter pose={cur.pose} color={color} size={170} />
        <SpeechBubble key={step} k={step}>
          <p style={bubbleEyebrow}>POSTURA {step + 1} DE {POSTURAL_STEPS.length}</p>
          <h2 style={bubbleTitle}>{cur.text}</h2>
        </SpeechBubble>
      </div>
      <LakeButton color={color} onClick={() => last ? onDone() : setStep(s => s + 1)}>
        {last ? 'Listo' : 'Siguiente'}
      </LakeButton>
    </CenteredFlow>
  );
}

/* ═══════════════════════════════════════════════════════
   FASE 6 — Etiquetado Emocional
═══════════════════════════════════════════════════════ */

const EMOCIONES = ['Miedo', 'Vergüenza', 'Culpa', 'Asco', 'Enojo', 'Confusión', 'Tristeza', 'No sé'];
const EMOTION_FACE: Record<string, string> = {
  'Miedo': 'miedo', 'Vergüenza': 'verguenza', 'Culpa': 'culpa', 'Asco': 'asco',
  'Enojo': 'enojo', 'Confusión': 'confusion', 'Tristeza': 'tristeza', 'No sé': 'nose',
};

function Phase6({ onDone, color }: { onDone: () => void; color: string }) {
  const [picked, setPicked] = useState<string | null>(null);

  if (picked) return (
    <CenteredFlow>
      <div style={{ position: 'relative', display: 'grid', placeItems: 'center', marginTop: 4, marginBottom: -4 }}>
        <div style={{ position: 'absolute', inset: '-12% -22%', background: `radial-gradient(ellipse at center, ${color}28, ${color}10 50%, transparent 75%)`, filter: 'blur(22px)', pointerEvents: 'none' }} />
        <div key={picked} style={{ position: 'relative', animation: 'ancla-bubble-in 0.5s cubic-bezier(.34,1.56,.64,1) both' }}>
          <GuideCharacter expression={EMOTION_FACE[picked]} color={color} size={140} />
        </div>
      </div>
      <FadeKey key={picked} k={picked} dur={0.6}>
        <p style={microStyle}>Estás sintiendo</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(40px, 10vw, 64px)', lineHeight: 1.05, letterSpacing: '-0.018em', color: C.text, margin: '6px 0 0', textWrap: 'balance' as React.CSSProperties['textWrap'] }}>{picked}.</h2>
      </FadeKey>
      <p style={{ ...mutedTextStyle, maxWidth: 420 }}>
        Gracias. Ponerle nombre a lo que sientes puede ayudar a que tu cuerpo baje un poco la alarma.
      </p>
      <LakeButton color={color} onClick={onDone}>Continuar</LakeButton>
      <Btn variant="ghost" onClick={() => setPicked(null)}>Elegir otra</Btn>
    </CenteredFlow>
  );

  return (
    <CenteredFlow>
      <FadeKey key="pick" k="pick">
        <h2 style={titleStyle}>¿Qué nombre tiene lo que sientes ahora?</h2>
        <p style={mutedTextStyle}>Elige el que más se acerca. No tiene que ser exacto.</p>
      </FadeKey>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', maxWidth: 420 }}>
        {EMOCIONES.map(e => (
          <button key={e} onClick={() => setPicked(e)} style={{
            padding: '18px 16px', borderRadius: 16, background: C.card,
            border: `1px solid ${C.bdr}`, color: C.text,
            fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 400,
            letterSpacing: '-0.01em', cursor: 'pointer', textAlign: 'center' as const,
            transition: 'background .15s ease',
          }}
            onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(44,44,42,0.04)'; }}
            onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.background = C.card; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = C.card; }}
          >{e}</button>
        ))}
      </div>
    </CenteredFlow>
  );
}

/* ═══════════════════════════════════════════════════════
   FASE 7 — Categorías Mentales
═══════════════════════════════════════════════════════ */

const CATEGS = [
  { name: 'Comidas',         hint: 'Cinco platillos que te gusten.' },
  { name: 'Animales',        hint: 'Cinco animales que conozcas.' },
  { name: 'Colores',         hint: 'Cinco colores cualquiera.' },
  { name: 'Canciones',       hint: 'Cinco canciones que se te ocurran.' },
  { name: 'Lugares seguros', hint: 'Cinco lugares donde te sientes bien.' },
];

function Phase7({ onDone, color }: { onDone: () => void; color: string }) {
  const [phase, setPhase] = useState<'pick' | 'input' | 'done'>('pick');
  const [cat, setCat]     = useState<typeof CATEGS[0] | null>(null);
  const [items, setItems] = useState(['', '', '', '', '']);
  const [i, setI]         = useState(0);

  if (phase === 'pick') return (
    <CenteredFlow>
      <FadeKey key="pick" k="pick">
        <h2 style={titleStyle}>Elige una categoría.</h2>
        <p style={mutedTextStyle}>Le vamos a dar a tu mente una tarea simple.</p>
      </FadeKey>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 380 }}>
        {CATEGS.map(c => (
          <button key={c.name} onClick={() => { setCat(c); setPhase('input'); }}
            style={categoryRowStyle}
            onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(44,44,42,0.04)'; }}
            onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.background = C.card; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = C.card; }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 19 }}>{c.name}</span>
            <span style={{ color: C.faint, fontSize: 13 }}>→</span>
          </button>
        ))}
      </div>
    </CenteredFlow>
  );

  if (phase === 'input' && cat) {
    const last = i === 4;
    return (
      <CenteredFlow>
        <Counter current={i + 1} total={5} color={color} />
        <FadeKey key={i} k={i}>
          <h2 style={titleStyle}>{cat.name} #{i + 1}</h2>
          <p style={mutedTextStyle}>{cat.hint}</p>
        </FadeKey>
        <input type="text" autoFocus value={items[i]}
          onChange={e => { const next = [...items]; next[i] = e.target.value; setItems(next); }}
          placeholder="Escribe lo primero que te venga"
          style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: C.text, background: C.card, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: '12px 16px', outline: 'none', width: '100%', maxWidth: 380, boxSizing: 'border-box' as const }}
        />
        <LakeButton color={color} disabled={!items[i].trim()}
          onClick={() => last ? setPhase('done') : setI(n => n + 1)}>
          {last ? 'Terminar' : 'Siguiente'}
        </LakeButton>
      </CenteredFlow>
    );
  }

  return (
    <CenteredFlow>
      <FadeKey key="done" k="done">
        <h2 style={titleStyle}>Tu mente acaba de volver un poco al presente.</h2>
      </FadeKey>
      <p style={mutedTextStyle}>Estuvo ocupada con algo concreto. Eso suele bastar para bajar la intensidad.</p>
      <LakeButton color={color} onClick={onDone}>Volver al catálogo</LakeButton>
      <Btn variant="ghost" onClick={() => { setItems(['', '', '', '', '']); setI(0); setCat(null); setPhase('pick'); }}>
        Elegir otra categoría
      </Btn>
    </CenteredFlow>
  );
}

/* ═══════════════════════════════════════════════════════
   FASE 8 — Conteo Hacia Atrás
═══════════════════════════════════════════════════════ */

function Phase8({ onDone, color }: { onDone: () => void; color: string }) {
  const [n, setN]           = useState(20);
  const [paused, setPaused] = useState(false);
  const STEP_MS = 2000;

  useEffect(() => {
    if (n === 0 || paused) return;
    const t = setTimeout(() => setN(x => x - 1), STEP_MS);
    return () => clearTimeout(t);
  }, [n, paused]);

  if (n === 0) return (
    <CenteredFlow>
      <FadeKey key="done" k="done"><h2 style={titleStyle}>Llegaste.</h2></FadeKey>
      <p style={mutedTextStyle}>Tu mente estuvo enfocada en algo concreto.</p>
      <LakeButton color={color} onClick={onDone}>Volver al catálogo</LakeButton>
    </CenteredFlow>
  );

  return (
    <CenteredFlow>
      <Counter current={20 - n + 1} total={20} color={color} />
      <FadeKey key={n} k={n}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(72px, 24vw, 132px)', fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 1, color: C.text }}>{n}</div>
      </FadeKey>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ height: 2, background: 'rgba(44,44,42,0.08)', borderRadius: 2, overflow: 'hidden' }}>
          <div key={`bar-${n}-${paused}`} style={{ height: '100%', background: color, transformOrigin: 'left center', animation: paused ? 'none' : `ancla-bar ${STEP_MS}ms linear forwards` }} />
        </div>
      </div>
      <Btn variant="ghost" onClick={() => setPaused(p => !p)}>{paused ? 'Reanudar' : 'Pausar'}</Btn>
      <Btn variant="quiet" onClick={onDone}>Esto no me ayuda</Btn>
    </CenteredFlow>
  );
}

/* ═══════════════════════════════════════════════════════
   FASE 14 — Pesca de Frases
═══════════════════════════════════════════════════════ */

const PESCA_PHRASES = [
  'Lo que pasó no es tu culpa.',
  'No estás solo/a en esto.',
  'Tu cuerpo está aprendiendo a calmarse.',
  'Mereces sentirte en paz.',
  'Tu historia no termina aquí.',
  'Está bien pedir ayuda.',
  'Hablar de esto no te hace débil.',
  'Sentir esto es humano. No te define.',
];

const FISH_COLORS = ['#b89a72', '#c4a882', '#a8855c', '#d4b890', '#9a7650'];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type FishDef = {
  id: string; phrase: string; top: number;
  color: string; dur: number; delay: number; dir: 'l' | 'r';
};

function Fish({ color, size = 56, jumping = false }: { color: string; size?: number; jumping?: boolean }) {
  const gradId = `fish-${color.replace('#', '')}`;
  return (
    <svg viewBox="-14 0 80 40" width={size} height={size * 0.5} style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={gradId} cx="60%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.55} />
          <stop offset="50%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity={0.92} />
        </radialGradient>
      </defs>
      <g style={{ transformOrigin: '8px 20px', animation: jumping ? 'none' : 'ancla-fish-wag 0.65s ease-in-out infinite' }}>
        <path d="M 8 20 L -8 8 L -2 20 L -8 32 Z" fill={color} opacity={0.92} />
      </g>
      <path d="M 8 20 Q 22 4 40 6 Q 56 8 58 20 Q 56 32 40 34 Q 22 36 8 20 Z"
            fill={`url(#${gradId})`} stroke="rgba(44,44,42,0.22)" strokeWidth={1} />
      <path d="M 14 24 Q 30 32 50 26" stroke="rgba(255,255,255,0.4)" strokeWidth={1.4} strokeLinecap="round" fill="none" />
      <circle cx={48} cy={16} r={2.6} fill="#FBF9F5" />
      <circle cx={48} cy={16} r={1.6} fill="#2C2C2A" />
      <path d="M 36 12 Q 38 20 36 28" stroke="rgba(44,44,42,0.28)" strokeWidth={1} fill="none" />
      <path d="M 26 8 Q 30 2 34 8 Z" fill={color} opacity={0.85} />
    </svg>
  );
}

function FishingCharacter({ color, size = 110 }: { color: string; size?: number }) {
  return (
    <div style={{ position: 'relative', width: size, height: size * 1.05, flex: '0 0 auto', animation: 'ancla-guide-bob 4s ease-in-out infinite' }}>
      <svg viewBox="-60 -62 120 130" width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="pesca-head" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#FBF9F5" />
            <stop offset="100%" stopColor="#EDE7DC" />
          </radialGradient>
        </defs>
        <ellipse cx={0} cy={0} rx={40} ry={44} fill="url(#pesca-head)" stroke="rgba(44,44,42,0.18)" strokeWidth={1.4} />
        <path d="M -34 -28 Q 0 -56 36 -28 L 34 -22 Q 0 -36 -34 -22 Z" fill={color} opacity={0.85} />
        <ellipse cx={0} cy={-28} rx={40} ry={6} fill={color} opacity={0.6} />
        <circle cx={-22} cy={6} r={6} fill="#e8a8a8" opacity={0.4} />
        <circle cx={22} cy={6} r={6} fill="#e8a8a8" opacity={0.4} />
        <circle cx={-12} cy={-2} r={3} fill="#2C2C2A" />
        <circle cx={12} cy={-2} r={3} fill="#2C2C2A" />
        <circle cx={-10.5} cy={-3.5} r={0.9} fill="#FBF9F5" />
        <circle cx={13.5} cy={-3.5} r={0.9} fill="#FBF9F5" />
        <path d="M -8 14 Q 0 18 8 14" stroke="#2C2C2A" strokeWidth={2.2} strokeLinecap="round" fill="none" />
        <path d="M -42 56 Q 0 38 42 56 L 42 64 L -42 64 Z" fill="#FBF9F5" stroke="rgba(44,44,42,0.18)" strokeWidth={1.4} />
      </svg>
    </div>
  );
}

function PescaScene({ fishList, caughtIds, hookedId, color, onCatch }: {
  fishList: FishDef[]; caughtIds: Set<string>; hookedId: string | null;
  color: string; onCatch: (f: FishDef) => void;
}) {
  return (
    <div style={{
      position: 'relative', width: '100%', maxWidth: 560,
      aspectRatio: '5 / 3', borderRadius: 22, overflow: 'hidden',
      background: 'linear-gradient(180deg, #f7eedf 0%, #f3e6d1 45%, #ead7b8 100%)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 4px 18px rgba(44,44,42,0.06)',
      border: '1px solid rgba(44,44,42,0.08)',
    }}>
      {/* sky band */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '38%',
        background: 'linear-gradient(180deg, var(--c-bg) 0%, transparent 100%)' }} />

      {/* wave line */}
      <svg viewBox="0 0 100 6" preserveAspectRatio="none"
           style={{ position: 'absolute', top: '36%', left: 0, width: '100%', height: 18 }}>
        <path d="M 0 3 Q 12 0 25 3 Q 38 6 50 3 Q 62 0 75 3 Q 88 6 100 3 L 100 6 L 0 6 Z" fill="#f3e6d1" opacity="0.95">
          <animate attributeName="d"
            values="M 0 3 Q 12 0 25 3 Q 38 6 50 3 Q 62 0 75 3 Q 88 6 100 3 L 100 6 L 0 6 Z;M 0 3 Q 12 6 25 3 Q 38 0 50 3 Q 62 6 75 3 Q 88 0 100 3 L 100 6 L 0 6 Z;M 0 3 Q 12 0 25 3 Q 38 6 50 3 Q 62 0 75 3 Q 88 6 100 3 L 100 6 L 0 6 Z"
            dur="4s" repeatCount="indefinite" />
        </path>
      </svg>

      {/* bubbles */}
      {[['24%','74%',4,'rgba(255,255,255,0.45)','6s','0s'],
        ['58%','82%',3,'rgba(255,255,255,0.4)','7s','-3s'],
        ['78%','70%',5,'rgba(255,255,255,0.35)','8s','-5s'],
      ].map(([l,t,w,bg,dur,del],i) => (
        <span key={i} aria-hidden="true" style={{
          position: 'absolute', left: l as string, top: t as string,
          width: w as number, height: w as number, borderRadius: '50%',
          background: bg as string, animation: `ancla-bubble-rise ${dur} ease-out infinite`,
          animationDelay: del as string,
        }} />
      ))}

      {/* character */}
      <div style={{ position: 'absolute', left: '4%', top: '-8%', zIndex: 3, display: 'flex', alignItems: 'flex-end' }}>
        <FishingCharacter color={color} size={110} />
      </div>

      {/* rod + line + bobber */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
           style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
        <path d="M 16 32 Q 32 18 52 38" stroke="#2C2C2A" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        <path d="M 52 38 L 52 62" stroke="rgba(44,44,42,0.45)" strokeWidth="0.3" />
        <circle cx="52" cy="62" r="1.6" fill={color} stroke="rgba(44,44,42,0.5)" strokeWidth="0.25">
          <animate attributeName="cy" values="60.5;63.5;60.5" dur="2.2s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* fish */}
      {fishList.map((f) => {
        const caught = caughtIds.has(f.id);
        const hooked = hookedId === f.id;
        return (
          <div key={f.id} style={{
            position: 'absolute', top: `${f.top}%`, left: 0,
            width: '100%', height: 50,
            pointerEvents: caught ? 'none' : 'auto',
            opacity: caught ? 0 : 1, transition: 'opacity 0.6s ease',
            zIndex: hooked ? 5 : 1,
          }}>
            <div style={{
              position: 'relative', width: '100%', height: '100%',
              animation: hooked
                ? 'ancla-fish-hooked 1.1s cubic-bezier(.34,1.56,.64,1) forwards'
                : `ancla-fish-swim-${f.dir} ${f.dur}s linear infinite`,
              animationDelay: hooked ? '0s' : `${f.delay}s`,
              willChange: 'transform',
            }}>
              <button
                onClick={() => !caught && !hookedId && onCatch(f)}
                style={{
                  position: 'absolute', top: 0, left: 0,
                  padding: 0, border: 0, background: 'transparent',
                  cursor: caught || hookedId ? 'default' : 'pointer',
                  transform: f.dir === 'r' ? 'scaleX(-1)' : 'none',
                  transformOrigin: 'center',
                }}
              >
                <Fish color={f.color} size={56} jumping={hooked} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Phase14({ onDone, color }: { onDone: () => void; color: string }) {
  const totalCatch = 5;
  const fishList = useMemo<FishDef[]>(() => {
    const phrases = shuffle(PESCA_PHRASES);
    return phrases.map((phrase, i) => ({
      id: `f${i}`, phrase,
      top: 50 + (i % 4) * 11,
      color: FISH_COLORS[i % FISH_COLORS.length],
      dur: 7 + (i * 1.6) % 6,
      delay: -(i * 0.9),
      dir: (i % 2 === 0 ? 'l' : 'r') as 'l' | 'r',
    }));
  }, []);

  const [caughtIds, setCaughtIds] = useState<Set<string>>(() => new Set());
  const [hooked, setHooked]       = useState<FishDef | null>(null);
  const [showing, setShowing]     = useState<FishDef | null>(null);

  useEffect(() => {
    if (!hooked) return;
    const t = setTimeout(() => { setShowing(hooked); setHooked(null); }, 1100);
    return () => clearTimeout(t);
  }, [hooked]);

  const caughtCount = caughtIds.size;

  if (caughtCount >= totalCatch && !showing) {
    return (
      <CenteredFlow>
        <FadeKey key="done-pesca" k="done-pesca">
          <h2 style={titleStyle}>Pescaste cinco.</h2>
        </FadeKey>
        <p style={{ ...mutedTextStyle, maxWidth: 460 }}>
          Cada frase que sacaste es una que tu mente puede llevarse, aunque sea por un rato.
          Vuelve cuando quieras a pescar otras.
        </p>
        <LakeButton color={color} onClick={onDone}>Volver al catálogo</LakeButton>
      </CenteredFlow>
    );
  }

  if (showing) {
    return (
      <CenteredFlow>
        <Counter current={caughtCount + 1} total={totalCatch} color={color} />
        <div style={{
          position: 'relative', width: '100%', maxWidth: 540,
          minHeight: 'clamp(240px, 36vh, 320px)',
          padding: '32px 24px', display: 'grid', placeItems: 'center', gap: 18,
        }}>
          <div aria-hidden="true" style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(ellipse 70% 55% at center, ${color}30, ${color}10 45%, transparent 72%)`,
            filter: 'blur(28px)', animation: 'ancla-frase-aura 7s ease-in-out infinite',
          }} />
          <span aria-hidden="true" style={{
            position: 'absolute', left: '14%', top: '22%', width: 4, height: 4,
            borderRadius: '50%', background: color,
            boxShadow: `0 0 12px ${color}, 0 0 24px ${color}55`,
            animation: 'ancla-frase-mote 5s ease-in-out infinite',
          }} />
          <span aria-hidden="true" style={{
            position: 'absolute', right: '12%', top: '20%', width: 5, height: 5,
            borderRadius: '50%', background: '#fff',
            boxShadow: `0 0 14px ${color}cc, 0 0 28px ${color}66`,
            animation: 'ancla-frase-mote 6s ease-in-out infinite', animationDelay: '-2s',
          }} />
          <div style={{ position: 'relative', animation: 'ancla-fish-float 3s ease-in-out infinite' }}>
            <Fish color={showing.color} size={96} jumping={false} />
          </div>
          <div style={{ position: 'relative', textAlign: 'center', maxWidth: 460 }}>
            <p style={{ ...microStyle, color: 'var(--c-faint)', margin: '0 0 8px' }}>UN PEZ TRAJO ESTA FRASE</p>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 400, fontStyle: 'italic',
              fontSize: 'clamp(24px, 4.5vw, 34px)', lineHeight: 1.3, letterSpacing: '0.012em',
              color: 'var(--c-text)', margin: 0, textWrap: 'balance' as const,
            }}>{showing.phrase}</h2>
          </div>
        </div>
        <LakeButton color={color} onClick={() => {
          setCaughtIds(prev => new Set([...prev, showing!.id]));
          setShowing(null);
        }}>{caughtCount + 1 >= totalCatch ? 'Terminar' : 'Soltar y pescar otra'}</LakeButton>
        <Btn variant="quiet" onClick={onDone}>Detener</Btn>
      </CenteredFlow>
    );
  }

  return (
    <CenteredFlow>
      <Counter current={caughtCount + 1} total={totalCatch} color={color} />
      <FadeKey key="fish-hint" k="fish-hint">
        <p style={{ ...microStyle, color: 'var(--c-faint)', marginBottom: 4 }}>TOCA UN PEZ PARA SACARLO</p>
      </FadeKey>
      <PescaScene
        fishList={fishList} caughtIds={caughtIds}
        hookedId={hooked ? hooked.id : null}
        color={color} onCatch={(f) => setHooked(f)}
      />
      <Btn variant="quiet" onClick={onDone}>Detener</Btn>
    </CenteredFlow>
  );
}

/* ═══════════════════════════════════════════════════════
   FASE 9 — Burbujas de Calma
═══════════════════════════════════════════════════════ */

const BUBBLE_COLORS = [
  '#5b81a8', '#7299bc', '#89afd1', '#6a8aaa',
  '#6b7f5e', '#8a9e7a', '#7a9570',
  '#c4a882', '#b8956f',
];

type BubbleDef = {
  id: string; cell: number; size: number; startX: number; startY: number;
  waypoints: { x: number; y: number }[];
  dur: number; delay: number;
  wobbleDur: number; wobbleDelay: number; wobbleVariant: number;
  color: string; popping: boolean; poppedAt?: number;
};

const B_COLS = 5, B_ROWS = 3, B_CELLS = B_COLS * B_ROWS;
const B_X_MIN = 8, B_X_MAX = 92, B_Y_MIN = 10, B_Y_MAX = 78;

function pickCell(active: BubbleDef[]) {
  const counts = new Array(B_CELLS).fill(0);
  for (const b of active) { if (!b.popping && typeof b.cell === 'number') counts[b.cell]++; }
  const min = Math.min(...counts);
  const cands = counts.map((c, i) => c === min ? i : -1).filter(i => i >= 0);
  return cands[Math.floor(Math.random() * cands.length)];
}

function makeBubbleDef(id: string, active: BubbleDef[] = []): BubbleDef {
  const cell = pickCell(active);
  const col = cell % B_COLS, row = Math.floor(cell / B_COLS);
  const colW = (B_X_MAX - B_X_MIN) / B_COLS, rowH = (B_Y_MAX - B_Y_MIN) / B_ROWS;
  const jX = (Math.random() - 0.5) * colW * 0.65, jY = (Math.random() - 0.5) * rowH * 0.65;
  // caminata aleatoria suave: cada paso perturba levemente el anterior
  let wx = (Math.random() - 0.5) * 6, wy = (Math.random() - 0.5) * 5;
  const waypoints = Array.from({ length: 6 }, () => {
    wx += (Math.random() - 0.5) * 4; wy += (Math.random() - 0.5) * 3;
    wx = Math.max(-8, Math.min(8, wx)); wy = Math.max(-7, Math.min(7, wy));
    return { x: +wx.toFixed(2), y: +wy.toFixed(2) };
  });
  return {
    id, cell,
    size: 64 + Math.random() * 72,
    startX: B_X_MIN + colW * (col + 0.5) + jX,
    startY: B_Y_MIN + rowH * (row + 0.5) + jY,
    waypoints,
    dur: 18 + Math.random() * 12, delay: -Math.random() * 8,
    wobbleDur: 5 + Math.random() * 4, wobbleDelay: -Math.random() * 6,
    wobbleVariant: Math.floor(Math.random() * 3),
    color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
    popping: false,
  };
}

function BubbleEl({ b, onPop }: { b: BubbleDef; onPop: () => void }) {
  useEffect(() => {
    if (b.popping) return;
    const styleId = `kf-bubble-${b.id}`;
    if (document.getElementById(styleId)) return;
    const N = b.waypoints.length;
    let kf = `@keyframes ancla-bubble-drift-${b.id} {\n  0% { transform: translate(0vw,0vh); animation-timing-function: cubic-bezier(.5,0,.5,1); }\n`;
    b.waypoints.forEach((w, idx) => {
      const pct = ((idx + 1) / (N + 1)) * 100;
      kf += `  ${pct.toFixed(1)}% { transform: translate(${w.x.toFixed(2)}vw,${w.y.toFixed(2)}vh); animation-timing-function: cubic-bezier(.5,0,.5,1); }\n`;
    });
    kf += `  100% { transform: translate(0vw,0vh); }\n}`;
    const tag = document.createElement('style');
    tag.id = styleId; tag.textContent = kf;
    document.head.appendChild(tag);
    return () => { try { tag.remove(); } catch (_) {} };
  }, [b.id, b.popping]);

  if (b.popping) return <PoppedBurst b={b} />;

  return (
    <div style={{
      position: 'absolute', left: `${b.startX}%`, top: `${b.startY}%`,
      width: b.size, height: b.size,
      animation: 'ancla-bubble-appear 0.55s cubic-bezier(.34,1.56,.64,1) both',
    }}>
      <div
        style={{
          width: '100%', height: '100%', cursor: 'pointer', willChange: 'transform',
          animation: `ancla-bubble-drift-${b.id} ${b.dur}s linear infinite`,
          animationDelay: `${b.delay}s`,
        }}
        onClick={onPop} onTouchStart={onPop}
      >
        <div style={{
          width: '100%', height: '100%', borderRadius: '50%',
          background: `radial-gradient(circle at 32% 28%, ${b.color}aa, ${b.color}cc 55%, ${b.color}bb 100%)`,
          boxShadow: `inset -6px -8px 18px ${b.color}66, inset 6px 6px 16px rgba(255,255,255,0.25), 0 4px 18px ${b.color}33`,
          border: '1px solid rgba(255,255,255,0.25)', opacity: 0.95,
          animation: `ancla-bubble-wobble-${b.wobbleVariant} ${b.wobbleDur}s ease-in-out infinite`,
          animationDelay: `${b.wobbleDelay}s`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', left: '24%', top: '20%', width: '26%', height: '18%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.7), rgba(255,255,255,0) 70%)',
            filter: 'blur(2px)',
            animation: `ancla-bubble-shine ${b.wobbleDur * 1.4}s ease-in-out infinite`,
            animationDelay: `${b.wobbleDelay}s`,
          }} />
        </div>
      </div>
    </div>
  );
}

function PoppedBurst({ b }: { b: BubbleDef }) {
  const dropletsRef = useRef<{ x: number; y: number; r: number; delay: number }[] | null>(null);
  if (!dropletsRef.current) {
    const N = 6 + Math.floor(b.size / 28);
    const base = Math.random() * Math.PI * 2;
    dropletsRef.current = Array.from({ length: N }, (_, i) => {
      const angle = base + (i / N) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const dist = b.size * (0.55 + Math.random() * 0.55);
      return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, r: 4 + Math.random() * (b.size / 14), delay: Math.random() * 60 };
    });
  }
  const droplets = dropletsRef.current;
  return (
    <div style={{ position: 'absolute', left: `${b.startX}%`, top: `${b.startY}%`, width: b.size, height: b.size, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(circle at 32% 28%, ${b.color}aa, ${b.color}cc 55%, ${b.color}bb 100%)`, boxShadow: `inset -6px -8px 18px ${b.color}66, inset 6px 6px 16px rgba(255,255,255,0.25), 0 4px 18px ${b.color}33`, border: '1px solid rgba(255,255,255,0.25)', animation: 'ancla-bubble-burst 0.45s cubic-bezier(.4,0,.2,1) forwards' }} />
      <div style={{ position: 'absolute', inset: '-15%', borderRadius: '50%', background: `radial-gradient(circle, ${b.color}55, ${b.color}00 65%)`, animation: 'ancla-bubble-flash 0.55s ease-out forwards', filter: 'blur(4px)' }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${b.color}`, animation: 'ancla-bubble-shock 0.55s cubic-bezier(.2,.8,.4,1) forwards' }} />
      {droplets.map((d, i) => (
        <span key={i} style={{
          position: 'absolute', left: '50%', top: '50%',
          width: d.r, height: d.r, marginLeft: -d.r / 2, marginTop: -d.r / 2,
          borderRadius: '50%',
          background: `radial-gradient(circle at 32% 28%, ${b.color}cc, ${b.color}dd)`,
          boxShadow: `inset -1px -2px 4px ${b.color}88, 0 2px 4px ${b.color}44`,
          '--dx': `${d.x}px`, '--dy': `${d.y}px`,
          animation: 'ancla-droplet-fly 0.6s cubic-bezier(.2,.7,.3,1) forwards',
          animationDelay: `${d.delay}ms`,
        } as React.CSSProperties} />
      ))}
    </div>
  );
}

function Phase9({ onDone }: { onDone: () => void }) {
  const idRef = useRef(200);
  const [bubbles, setBubbles] = useState<BubbleDef[]>(() => {
    const arr: BubbleDef[] = [];
    for (let i = 0; i < 12; i++) arr.push(makeBubbleDef('bi' + i, arr));
    return arr;
  });
  const [showExit, setShowExit] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowExit(true), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let alive = true;
    let tt: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (!alive) return;
      setBubbles(prev => {
        const active = prev.filter(b => !b.popping);
        if (active.length >= 20) return prev;
        const batch = Math.max(1, Math.min(3, 7 - active.length));
        let next = [...prev];
        for (let i = 0; i < batch; i++) {
          next = [...next, makeBubbleDef('b' + (idRef.current++), next.filter(b => !b.popping))];
        }
        return next;
      });
      tt = setTimeout(tick, 400 + Math.random() * 600);
    };
    tt = setTimeout(tick, 500);
    return () => { alive = false; clearTimeout(tt); };
  }, []);

  useEffect(() => {
    const gc = setInterval(() => {
      setBubbles(prev => prev.filter(b => !b.popping || !b.poppedAt || (Date.now() - b.poppedAt) < 600));
    }, 800);
    return () => clearInterval(gc);
  }, []);

  const pop = (id: string) => {
    buzz(10);
    setBubbles(prev => prev.map(b => b.id === id ? { ...b, popping: true, poppedAt: Date.now() } : b));
    // reposición inmediata si quedan pocas burbujas
    setTimeout(() => {
      setBubbles(curr => {
        const active = curr.filter(b => !b.popping);
        const toAdd = Math.min(Math.max(0, 9 - active.length), 4);
        if (toAdd <= 0) return curr;
        let next = [...curr];
        for (let i = 0; i < toAdd; i++) {
          next = [...next, makeBubbleDef('b' + (idRef.current++), next.filter(b => !b.popping))];
        }
        return next;
      });
    }, 250);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, top: 56, background: C.bg, zIndex: 4, overflow: 'hidden' }}>
      {bubbles.map(b => <BubbleEl key={b.id} b={b} onPop={() => pop(b.id)} />)}
      {showExit && (
        <button
          onClick={onDone}
          style={{
            position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)',
            padding: '13px 26px', borderRadius: 999,
            background: 'rgba(245,242,238,0.88)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(44,44,42,0.14)',
            color: C.text, fontSize: 14, fontWeight: 500,
            fontFamily: 'var(--font-body)', cursor: 'pointer',
            boxShadow: '0 4px 24px rgba(44,44,42,0.08)',
            animation: 'ancla-fade-up .6s cubic-bezier(.4,0,.2,1) both',
            whiteSpace: 'nowrap',
          }}
        >
          Ya fue suficiente
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   FASE 10 — Frases de Anclaje al Presente
═══════════════════════════════════════════════════════ */

const FRASES_ANCLAJE = [
  'Estoy aquí.',
  'Este es el presente.',
  'Mis pies están tocando el piso.',
  'Estoy respirando.',
  'Ahora puedo ir paso a paso.',
];

function Phase10({ onDone, color }: { onDone: () => void; color: string }) {
  const [i, setI] = useState(0);
  const last = i === FRASES_ANCLAJE.length - 1;
  return (
    <CenteredFlow>
      <Counter current={i + 1} total={FRASES_ANCLAJE.length} color={color} />
      <AuraPhrase color={color} k={i} italic title={FRASES_ANCLAJE[i]} />
      <LakeButton color={color} onClick={() => last ? onDone() : setI(n => n + 1)}>
        {last ? 'Terminar' : 'Siguiente frase'}
      </LakeButton>
    </CenteredFlow>
  );
}

/* ═══════════════════════════════════════════════════════
   FASE 11 — Texturas de Anclaje
═══════════════════════════════════════════════════════ */

const TEXT_STEPS = [
  'Busca un objeto cerca de ti. Cualquiera.',
  'Tómalo entre tus manos.',
  'Recorre su superficie con los dedos.',
  'Nota su temperatura y su peso.',
];
const TEXT_TAGS = ['Frío', 'Tibio', 'Suave', 'Duro', 'Áspero', 'Liso', 'Pesado', 'Ligero'];
const TEXT_TAG_MESSAGES: Record<string, string> = {
  'Frío':   'La temperatura te despertó los sentidos. Tu cuerpo está aquí, registrando algo real.',
  'Tibio':  'Algo cálido y constante. Como un recordatorio suave de que sigues siendo.',
  'Suave':  'Algo amable al tacto. También mereces lo amable.',
  'Duro':   'Lo firme también es seguro. Algo no se mueve, y tú no tienes que moverte ahora.',
  'Áspero': 'Las texturas claras le dan al cuerpo algo concreto donde apoyarse.',
  'Liso':   'Continuo, predecible. Tu respiración puede volverse así también.',
  'Pesado': 'El peso te ancla. Tu cuerpo siente la gravedad. Eso significa que estás aquí.',
  'Ligero': 'Lo ligero también puede sostenerse. Como tú, aunque no siempre lo sientas.',
};

function Phase11({ onDone, color }: { onDone: () => void; color: string }) {
  const [phase, setPhase] = useState<'steps' | 'tags' | 'done'>('steps');
  const [step, setStep]   = useState(0);
  const [tags, setTags]   = useState<string[]>([]);

  if (phase === 'steps') {
    const last = step === TEXT_STEPS.length - 1;
    return (
      <CenteredFlow>
        <Counter current={step + 1} total={TEXT_STEPS.length} color={color} />
        <AuraPhrase color={color} k={step} eyebrow={`Paso ${step + 1} de ${TEXT_STEPS.length}`} title={TEXT_STEPS[step]} />
        <LakeButton color={color} onClick={() => last ? setPhase('tags') : setStep(s => s + 1)}>
          {last ? 'Continuar' : 'Siguiente'}
        </LakeButton>
      </CenteredFlow>
    );
  }

  if (phase === 'tags') return (
    <CenteredFlow>
      <AuraPhrase color={color} k="tags" title="¿Cómo se siente?" body="Marca las que apliquen. Puedes elegir varias." />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 420, marginTop: -16, marginBottom: 8 }}>
        {TEXT_TAGS.map(t => {
          const on = tags.includes(t);
          return (
            <button key={t}
              onClick={() => setTags(on ? tags.filter(x => x !== t) : [...tags, t])}
              style={{ padding: '10px 16px', borderRadius: 999, background: on ? color : C.card, border: `1px solid ${on ? color : C.bdr}`, color: on ? '#F5F2EE' : C.text, fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all .2s ease', boxShadow: on ? `0 4px 16px ${color}55` : 'none' }}>
              {t}
            </button>
          );
        })}
      </div>
      <LakeButton color={color} onClick={() => setPhase('done')}>Continuar</LakeButton>
    </CenteredFlow>
  );

  const closingBody = (() => {
    if (tags.length === 0) return 'Tu cuerpo registró algo concreto: forma, temperatura, peso.';
    if (tags.length === 1) return TEXT_TAG_MESSAGES[tags[0]];
    return TEXT_TAG_MESSAGES[tags[0]] + ' ' + TEXT_TAG_MESSAGES[tags[1]];
  })();

  return (
    <CenteredFlow>
      <AuraPhrase color={color} k="done" title="Sigues aquí." body={closingBody} />
      <LakeButton color={color} onClick={onDone}>Volver al catálogo</LakeButton>
    </CenteredFlow>
  );
}

/* ═══════════════════════════════════════════════════════
   FASE 12 — Olores de Anclaje
═══════════════════════════════════════════════════════ */

const SUGER = ['Café', 'Jabón', 'Crema', 'Ropa limpia', 'Cáscara de naranja', 'Champú'];
const OLOR_STEPS = [
  'Acerca el objeto a tu nariz.',
  'Inhala despacio.',
  'Nota si es dulce, amargo, fresco, intenso.',
  'Repite una vez más, sin prisa.',
];

function Phase12({ onDone, onGoToFase }: { onDone: () => void; onGoToFase: (f: string) => void }) {
  const [phase, setPhase] = useState<'intro' | 'steps' | 'fallback' | 'done'>('intro');
  const [step, setStep]   = useState(0);

  if (phase === 'intro') return (
    <CenteredFlow>
      <AuraPhrase color="#a88c6e" k="intro" title="¿Tienes algún olor familiar cerca?" body="Algunas sugerencias para inspirarte." />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 420, marginTop: -16, marginBottom: 8 }}>
        {SUGER.map(s => (
          <span key={s} style={{ padding: '8px 14px', borderRadius: 999, background: C.card, border: `1px solid ${C.bdr}`, color: C.body, fontSize: 13 }}>{s}</span>
        ))}
      </div>
      <LakeButton color="#a88c6e" onClick={() => setPhase('steps')}>Ya lo tengo</LakeButton>
      <Btn variant="ghost" onClick={() => setPhase('fallback')}>No tengo nada cerca</Btn>
    </CenteredFlow>
  );

  if (phase === 'steps') {
    const last = step === OLOR_STEPS.length - 1;
    return (
      <CenteredFlow>
        <Counter current={step + 1} total={OLOR_STEPS.length} color="#a88c6e" />
        <AuraPhrase color="#a88c6e" k={step} eyebrow={`Paso ${step + 1} de ${OLOR_STEPS.length}`} title={OLOR_STEPS[step]} />
        <LakeButton color="#a88c6e" onClick={() => last ? setPhase('done') : setStep(s => s + 1)}>
          {last ? 'Terminar' : 'Siguiente'}
        </LakeButton>
      </CenteredFlow>
    );
  }

  if (phase === 'fallback') return (
    <CenteredFlow>
      <AuraPhrase color="#a88c6e" k="fb" title="Está bien. Hay otras formas." body="Probemos uno que solo necesita tu cuerpo y tu atención." />
      <LakeButton color="#a88c6e" onClick={() => onGoToFase('11')}>Texturas de anclaje</LakeButton>
      <Btn variant="ghost" onClick={() => onGoToFase('10')}>Frases de anclaje</Btn>
      <Btn variant="quiet" onClick={onDone}>Volver al catálogo</Btn>
    </CenteredFlow>
  );

  return (
    <CenteredFlow>
      <AuraPhrase color="#a88c6e" k="done" title="Estás aquí." body="Un olor familiar le recuerda al cerebro dónde está." />
      <LakeButton color="#a88c6e" onClick={onDone}>Volver al catálogo</LakeButton>
    </CenteredFlow>
  );
}

/* ═══════════════════════════════════════════════════════
   FASE 13 — Tensión y Liberación con Puños
═══════════════════════════════════════════════════════ */

type TensionPhase = 'inhale' | 'tight' | 'release' | 'exhale';

const TENSION_SEQ: { main: string; ms: number; phase: TensionPhase; vibe: number | number[] | null }[] = [
  { main: 'Inhala profundo.',    ms: 3000, phase: 'inhale',  vibe: null        },
  { main: 'Aprieta los puños.',  ms: 5000, phase: 'tight',   vibe: [60, 40, 60] },
  { main: 'Afloja las manos.',   ms: 1200, phase: 'release', vibe: 25          },
  { main: 'Exhala lento.',       ms: 5500, phase: 'exhale',  vibe: null        },
];

function HeadFace({ phase, color }: { phase: TensionPhase; color: string }) {
  return (
    <g style={{ animation: 'ancla-face-in 0.35s ease both' }}>
      {phase === 'inhale' && (
        <g>
          <circle cx="-14" cy="-6" r="3.6" fill="#2C2C2A" />
          <circle cx="14"  cy="-6" r="3.6" fill="#2C2C2A" />
          <circle cx="-12.5" cy="-7.5" r="1.1" fill="#FBF9F5" />
          <circle cx="15.5"  cy="-7.5" r="1.1" fill="#FBF9F5" />
          <ellipse cx="0" cy="14" rx="4" ry="5" fill="#2C2C2A" />
        </g>
      )}
      {phase === 'tight' && (
        <g>
          <path d="M -20 -14 L -8 -10" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M 20 -14  L 8 -10"  stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M -19 -4 Q -14 0 -9 -4" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          <path d="M 9 -4 Q 14 0 19 -4"   stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          <path d="M -12 14 Q -8 18 -4 14 Q 0 18 4 14 Q 8 18 12 14" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <ellipse cx="0" cy="21" rx="3.5" ry="3.5" fill="#c97a7a" />
          <g stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.6">
            <line x1="-50" y1="-26" x2="-58" y2="-30" />
            <line x1="-52" y1="-10" x2="-62" y2="-10" />
            <line x1="50"  y1="-26" x2="58"  y2="-30" />
            <line x1="52"  y1="-10" x2="62"  y2="-10" />
            <line x1="-36" y1="-44" x2="-42" y2="-52" />
            <line x1="36"  y1="-44" x2="42"  y2="-52" />
            <line x1="0"   y1="-52" x2="0"   y2="-60" />
          </g>
        </g>
      )}
      {phase === 'release' && (
        <g>
          <circle cx="-14" cy="-6" r="5"   fill="#2C2C2A" />
          <circle cx="14"  cy="-6" r="5"   fill="#2C2C2A" />
          <circle cx="-12" cy="-8" r="1.4" fill="#FBF9F5" />
          <circle cx="16"  cy="-8" r="1.4" fill="#FBF9F5" />
          <ellipse cx="0" cy="16" rx="5" ry="6.5" fill="#2C2C2A" />
        </g>
      )}
      {phase === 'exhale' && (
        <g>
          <path d="M -20 -6 Q -14 -1 -8 -6" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          <path d="M 8 -6  Q 14 -1  20 -6"  stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          <path d="M -10 12 Q 0 20 10 12"   stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        </g>
      )}
    </g>
  );
}

function HandIcon({ state, color, mirrored }: { state: 'open' | 'fist'; color: string; mirrored?: boolean }) {
  const sx = mirrored ? -1 : 1;
  return (
    <g transform={`scale(${sx}, 1)`}>
      {state === 'fist' ? (
        <g>
          <rect x="-22" y="-20" width="44" height="40" rx="14" fill={color} />
          <circle cx="-13" cy="-18" r="5" fill={color} />
          <circle cx="-4"  cy="-19" r="5" fill={color} />
          <circle cx="5"   cy="-19" r="5" fill={color} />
          <circle cx="14"  cy="-18" r="5" fill={color} />
          <line x1="-9" y1="-13" x2="-9" y2="-7" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="0"  y1="-14" x2="0"  y2="-8" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="9"  y1="-13" x2="9"  y2="-7" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" strokeLinecap="round" />
          <ellipse cx="-20" cy="4" rx="7" ry="9" fill={color} />
        </g>
      ) : (
        <g>
          <ellipse cx="0"   cy="6"   rx="19"  ry="17" fill={color} />
          <ellipse cx="-13" cy="-14" rx="4.2" ry="10" fill={color} />
          <ellipse cx="-4.5" cy="-18" rx="4.2" ry="12" fill={color} />
          <ellipse cx="4.5"  cy="-18" rx="4.2" ry="12" fill={color} />
          <ellipse cx="13"  cy="-14" rx="4.2" ry="10" fill={color} />
          <ellipse cx="-18" cy="3" rx="5" ry="9" fill={color} transform="rotate(-28 -18 3)" />
          <path d="M -10 6 Q 0 10 10 6" stroke="rgba(0,0,0,0.12)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        </g>
      )}
    </g>
  );
}

function CharacterStage({ phase, color }: { phase: TensionPhase; color: string }) {
  const isTight   = phase === 'tight';
  const isOpen    = phase === 'inhale' || phase === 'exhale';
  const isRelease = phase === 'release';
  const handFill  = isTight ? '#2f4a68' : '#a8c0d6';
  const handTx    = isTight ? 28 : isRelease ? -6 : 0;
  const handScale = isTight ? 0.78 : isRelease ? 1.06 : 1;
  const auraOpacity = isOpen ? 0.55 : isRelease ? 0.25 : 0;
  const auraScale   = phase === 'exhale' ? 1.15 : 1;

  return (
    <div style={{
      position: 'relative', width: '100%', maxWidth: 440, aspectRatio: '320 / 220',
      animation: isTight ? 'ancla-shake 0.18s ease-in-out infinite alternate' : isRelease ? 'ancla-wobble 0.3s ease-in-out infinite alternate' : 'none',
    }}>
      <svg viewBox="0 0 320 220" width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          <filter id="tension-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <radialGradient id="tension-head" cx="40%" cy="35%" r="70%">
            <stop offset="0%"   stopColor="#FFFFFF" />
            <stop offset="60%"  stopColor="#FBF9F5" />
            <stop offset="100%" stopColor="#EDE7DC" />
          </radialGradient>
        </defs>

        <g style={{ transition: 'opacity 0.65s ease, transform 0.65s cubic-bezier(.4,0,.2,1)', opacity: auraOpacity, transformOrigin: '160px 130px', transform: `scale(${auraScale})` }}>
          <ellipse cx="55"  cy="130" rx="58" ry="42" fill={color} filter="url(#tension-blur)" />
          <ellipse cx="265" cy="130" rx="58" ry="42" fill={color} filter="url(#tension-blur)" />
        </g>

        <g>
          <line x1={60 + handTx} y1="130" x2="114" y2="130" stroke="#8B8780" strokeWidth="4.5" strokeLinecap="round" style={{ transition: 'all 0.65s cubic-bezier(.4,0,.2,1)' }} />
          <line x1="206" y1="130" x2={260 - handTx} y2="130" stroke="#8B8780" strokeWidth="4.5" strokeLinecap="round" style={{ transition: 'all 0.65s cubic-bezier(.4,0,.2,1)' }} />
        </g>

        <g transform="translate(160 96)">
          <ellipse cx="0" cy="60" rx="38" ry="5" fill="rgba(44,44,42,0.08)" />
          <g style={{ transformOrigin: '0 0', transition: 'transform 0.5s cubic-bezier(.4,0,.2,1)', transform: isTight ? 'scale(0.93, 1.05)' : isRelease ? 'scale(1.05, 0.95)' : 'scale(1)' }}>
            <ellipse cx="0" cy="0" rx="46" ry="50" fill="url(#tension-head)" stroke="rgba(44,44,42,0.18)" strokeWidth="1.5" />
            <circle cx="-26" cy="8" r="7" fill="#e8a8a8" style={{ opacity: isTight ? 0.6 : 0.22, transition: 'opacity 0.4s' }} />
            <circle cx="26"  cy="8" r="7" fill="#e8a8a8" style={{ opacity: isTight ? 0.6 : 0.22, transition: 'opacity 0.4s' }} />
            <HeadFace phase={phase} color={color} />
          </g>
        </g>

        <g transform={`translate(${60 + handTx} 130) scale(${handScale * 1.15})`} style={{ transition: 'transform 0.65s cubic-bezier(.4,0,.2,1)' }}>
          <HandIcon state={isTight ? 'fist' : 'open'} color={handFill} mirrored />
        </g>
        <g transform={`translate(${260 - handTx} 130) scale(${handScale * 1.15})`} style={{ transition: 'transform 0.65s cubic-bezier(.4,0,.2,1)' }}>
          <HandIcon state={isTight ? 'fist' : 'open'} color={handFill} />
        </g>
      </svg>
    </div>
  );
}

function Phase13({ onDone, color }: { onDone: () => void; color: string }) {
  const [state, setState] = useState<'intro' | 'active' | 'done'>('intro');
  const [step, setStep]   = useState(0);
  const [rep, setRep]     = useState(0);
  const totalReps = 3;

  useEffect(() => {
    if (state !== 'active') return;
    const cur = TENSION_SEQ[step];
    if (cur.vibe) buzz(cur.vibe);
    const t = setTimeout(() => {
      if (step < TENSION_SEQ.length - 1) { setStep(s => s + 1); }
      else if (rep < totalReps - 1)      { setRep(r => r + 1); setStep(0); }
      else                               { setState('done'); }
    }, cur.ms);
    return () => clearTimeout(t);
  }, [state, step, rep]);

  if (state === 'intro') return (
    <CenteredFlow>
      <FadeKey key="intro" k="intro">
        <h2 style={titleStyle}>Tensión y liberación.</h2>
        <p style={mutedTextStyle}>Vamos a apretar los puños fuerte y luego soltar. Tres veces. Aprieta fuerte, pero nunca hasta sentir dolor.</p>
      </FadeKey>
      <Btn onClick={() => setState('active')}>Iniciar</Btn>
      <Btn variant="ghost" onClick={onDone}>Elegir otro método</Btn>
    </CenteredFlow>
  );

  if (state === 'done') return (
    <CenteredFlow>
      <FadeKey key="done" k="done"><h2 style={titleStyle}>Listo.</h2></FadeKey>
      <p style={mutedTextStyle}>Acabas de descargar lo que tu cuerpo tenía retenido. Si quieres, repite.</p>
      <Btn onClick={() => { setStep(0); setRep(0); setState('active'); }}>Repetir</Btn>
      <Btn variant="ghost" onClick={onDone}>Volver al catálogo</Btn>
    </CenteredFlow>
  );

  const cur = TENSION_SEQ[step];
  return (
    <CenteredFlow>
      <Counter current={rep + 1} total={totalReps} color={color} />
      <CharacterStage phase={cur.phase} color={color} />
      <FadeKey key={`${step}-${rep}`} k={`${step}-${rep}`}>
        <p style={instructionStyle}>{cur.main}</p>
      </FadeKey>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ height: 2, background: C.bdr, borderRadius: 2, overflow: 'hidden' }}>
          <div key={`bar-${step}-${rep}`} style={{ height: '100%', background: color, transformOrigin: 'left center', animation: `ancla-bar ${cur.ms}ms linear forwards` }} />
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: C.faint, marginTop: 14, textAlign: 'center' }}>
          Aprieta fuerte, pero nunca hasta sentir dolor.
        </p>
      </div>
      <Btn variant="quiet" onClick={onDone}>Si esto no se siente bien, elegir otro método</Btn>
    </CenteredFlow>
  );
}

/* ═══════════════════════════════════════════════════════
   Vista de selección — agrupada por categoría
═══════════════════════════════════════════════════════ */

function SelectionView({ isMobile, router }: { isMobile: boolean; router: ReturnType<typeof useRouter> }) {
  const [hoveredFase, setHoveredFase] = useState<string | null>(null);

  return (
    <div style={{ animation: 'ancla-fade-up 0.5s cubic-bezier(.4,0,.2,1) both' }}>

      {/* ── Hero ── */}
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em',
        textTransform: 'uppercase', color: C.faint, margin: '0 0 14px', fontWeight: 500,
      }}>
        Basados en investigación científica
      </p>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(34px, 6vw, 56px)',
        lineHeight: 1.08, fontWeight: 400,
        letterSpacing: '-0.02em', color: C.text,
        margin: '0 0 14px',
      }}>
        Métodos para calmarte.
      </h1>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'clamp(15px, 1.5vw, 17px)',
        lineHeight: 1.55, color: C.body,
        margin: '0 0 52px', maxWidth: 560,
      }}>
        Elige según lo que estás sintiendo ahora. Ninguno necesita motricidad fina, ni te pone reloj, ni guarda nada.
      </p>

      {/* ── Categories ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
        {CATEGORIES.map((cat, ci) => (
          <div key={cat.id}>
            {/* Category header */}
            <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${C.bdr}` }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(20px, 2.6vw, 24px)',
                fontWeight: 400, letterSpacing: '-0.012em',
                color: C.text, margin: '0 0 4px',
              }}>
                {cat.label}
              </h2>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 14,
                lineHeight: 1.5, color: C.faint, margin: 0, maxWidth: 540,
              }}>
                {cat.hint}
              </p>
            </div>

            {/* Method cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(272px, 1fr))',
              gap: 16,
            }}>
              {cat.methods.map((m, mi) => {
                const globalIdx = ci * 10 + mi;
                const isHovered = hoveredFase === m.fase;
                return (
                  <div
                    key={m.fase}
                    onClick={() => router.push(`/joven/regulacion?fase=${m.fase}`)}
                    onMouseEnter={() => setHoveredFase(m.fase)}
                    onMouseLeave={() => setHoveredFase(null)}
                    style={{
                      background: C.card, borderRadius: 20,
                      border: `1px solid ${isHovered ? m.color + '44' : C.bdr}`,
                      padding: '22px 22px 18px',
                      cursor: 'pointer',
                      transition: 'transform .25s cubic-bezier(.4,0,.2,1), box-shadow .25s ease, border-color .2s ease',
                      transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                      boxShadow: isHovered
                        ? `0 10px 28px ${m.color}18, 0 1px 3px rgba(44,44,42,0.04)`
                        : '0 1px 3px rgba(44,44,42,0.04)',
                      display: 'flex', flexDirection: 'column', gap: 0,
                    }}
                  >
                    {/* Top row: orb + time badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <BlobOrb color={m.color} idx={globalIdx} size={72} />
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: 10.5,
                        letterSpacing: '0.14em', textTransform: 'uppercase',
                        color: C.faint, background: 'rgba(44,44,42,0.04)',
                        padding: '5px 10px', borderRadius: 999,
                        border: `1px solid ${C.bdr}`,
                      }}>
                        {m.time}
                      </span>
                    </div>

                    {/* Name */}
                    <h3 style={{
                      fontFamily: 'var(--font-display)', fontSize: 20,
                      fontWeight: 400, letterSpacing: '-0.012em',
                      color: C.text, margin: '0 0 8px', lineHeight: 1.25,
                    }}>
                      {m.name}
                    </h3>

                    {/* Desc */}
                    <p style={{
                      fontFamily: 'var(--font-body)', fontSize: 14,
                      lineHeight: 1.6, color: C.body,
                      margin: '0 0 20px', flex: 1,
                    }}>
                      {m.desc}
                    </p>

                    {/* Bottom row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                        <span style={{
                          fontFamily: 'var(--font-body)', fontSize: 13,
                          fontWeight: 500, color: C.text,
                        }}>
                          Practicar
                        </span>
                      </div>
                      <span style={{
                        fontSize: 18, color: m.color,
                        display: 'inline-block',
                        transition: 'transform .2s ease',
                        transform: isHovered ? 'translateX(3px)' : 'translateX(0)',
                      }}>
                        →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Crisis link ── */}
      <div style={{
        marginTop: 48, padding: '16px 20px', borderRadius: 16,
        background: 'rgba(167,199,231,0.10)', border: '1px solid rgba(167,199,231,0.30)',
        maxWidth: 540,
      }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, color: C.body, lineHeight: 1.65, margin: 0 }}>
          Si en este momento te sientes en crisis o no puedes usar estas herramientas,{' '}
          <button
            onClick={() => router.push('/joven/chat')}
            style={{
              color: '#5b81a8', fontWeight: 600, background: 'none', border: 'none',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit',
              textDecoration: 'underline', textUnderlineOffset: 3, padding: 0,
            }}
          >
            habla con ANA ahora
          </button>.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Vista de fase (ejercicio activo)
═══════════════════════════════════════════════════════ */

const PHASE_META: Record<number, { eyebrow: string; color: string; time: string }> = {
  1:  { eyebrow: 'Descompresión Fisiológica', color: '#5b81a8', time: '< 2 min' },
  2:  { eyebrow: 'Grounding y Reconexión',    color: '#6b7f5e', time: '~ 3 min' },
  3:  { eyebrow: 'Procesamiento Cognitivo',   color: '#c4a882', time: '~ 5 min' },
  4:  { eyebrow: 'Respiración Diafragmática', color: '#7299bc', time: '~ 2 min' },
  5:  { eyebrow: 'Reacomodo Postural',        color: '#8a9e7a', time: '< 1 min' },
  6:  { eyebrow: 'Etiquetado Emocional',      color: '#b8956f', time: '< 1 min' },
  7:  { eyebrow: 'Categorías Mentales',       color: '#a8855c', time: '~ 2 min' },
  8:  { eyebrow: 'Conteo Hacia Atrás',        color: '#9a7650', time: '~ 2 min' },
  9:  { eyebrow: 'Burbujas de Calma',         color: '#89afd1', time: '~ 2 min' },
  10: { eyebrow: 'Frases de Anclaje',         color: '#7a9570', time: '< 2 min' },
  11: { eyebrow: 'Texturas de Anclaje',       color: '#6e8865', time: '< 2 min' },
  12: { eyebrow: 'Olores de Anclaje',         color: '#5e7855', time: '< 2 min' },
  13: { eyebrow: 'Descarga de Tensión',       color: '#6a8aaa', time: '< 2 min' },
  14: { eyebrow: 'Anclaje Cognitivo',         color: '#b89a72', time: '~ 3 min' },
};

type FaseNum = 1|2|3|4|5|6|7|8|9|10|11|12|13|14;

function PhaseView({ fase, router, isMobile }: { fase: FaseNum; router: ReturnType<typeof useRouter>; isMobile: boolean }) {
  const m = PHASE_META[fase];
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
          {fase === 1  && <Phase1  onDone={handleDone} color={m.color} />}
          {fase === 2  && <Phase2  onDone={handleDone} color={m.color} />}
          {fase === 3  && <Phase3  onDone={handleDone} router={router} color={m.color} />}
          {fase === 4  && <Phase4  onDone={handleDone} color={m.color} />}
          {fase === 5  && <Phase5  onDone={handleDone} color={m.color} />}
          {fase === 6  && <Phase6  onDone={handleDone} color={m.color} />}
          {fase === 7  && <Phase7  onDone={handleDone} color={m.color} />}
          {fase === 8  && <Phase8  onDone={handleDone} color={m.color} />}
          {fase === 9  && <Phase9  onDone={handleDone} />}
          {fase === 10 && <Phase10 onDone={handleDone} color={m.color} />}
          {fase === 11 && <Phase11 onDone={handleDone} color={m.color} />}
          {fase === 12 && <Phase12 onDone={handleDone} onGoToFase={f => router.push(`/joven/regulacion?fase=${f}`)} />}
          {fase === 13 && <Phase13 onDone={handleDone} color={m.color} />}
          {fase === 14 && <Phase14 onDone={handleDone} color={m.color} />}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   Main
═══════════════════════════════════════════════════════ */

const VALID_FASES = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14'];

function RegulacionInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const isMobile     = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    let s = document.getElementById('ancla-global-css') as HTMLStyleElement | null;
    if (!s) {
      s = document.createElement('style');
      s.id = 'ancla-global-css';
      document.head.appendChild(s);
    }
    s.textContent = GLOBAL_CSS;
  }, []);

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
