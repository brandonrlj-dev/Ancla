// methods.jsx — 13 active-method screens for /joven/regulacion
// Each component renders inside the active-method shell handled by app.jsx.
// Common props: { color, onExit, onGoToFase }

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ─────────────────────────────────────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────────────────────────────────────

function Btn({ children, onClick, variant = 'primary', disabled, style }) {
  const base = {
    width: '100%',
    padding: '14px 28px',
    borderRadius: 999,
    fontFamily: 'var(--font-body)',
    fontSize: 15,
    fontWeight: 500,
    letterSpacing: '0.005em',
    transition: 'transform .15s ease, background .2s ease, color .2s ease, border-color .2s ease, opacity .2s',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
  };
  const variants = {
    primary: { background: '#2C2C2A', color: '#F5F2EE', border: '1px solid #2C2C2A' },
    ghost:   { background: 'transparent', color: '#2C2C2A', border: '1px solid rgba(44,44,42,0.18)' },
    quiet:   { background: 'transparent', color: '#57544E', border: '1px solid transparent', fontSize: 13.5 },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = 'scale(0.97)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      onTouchStart={(e) => { if (!disabled) e.currentTarget.style.transform = 'scale(0.97)'; }}
      onTouchEnd={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      style={{ ...base, ...variants[variant], ...(style || {}) }}
    >
      {children}
    </button>
  );
}

function Counter({ current, total, color }) {
  return (
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em',
      textTransform: 'uppercase', color: '#8B8780',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, opacity: 0.7 }} />
      {current} / {total}
    </div>
  );
}

function FadeKey({ k, children, dur = 0.55 }) {
  // Lightweight AnimatePresence-style fade-up using key remount + CSS animation.
  return (
    <div
      key={k}
      style={{ animation: `ancla-fade-up ${dur}s cubic-bezier(.4,0,.2,1) both` }}
    >
      {children}
    </div>
  );
}

// Vibration helper (no-op if unavailable)
const buzz = (pattern) => {
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (_) {}
};

// ─────────────────────────────────────────────────────────────────────────────
// BreathOrb — living, magical bubble used by both breathing methods.
// Stays within the category-blue palette: only varies hue tonally and uses
// white/translucent layers for shimmer. Composed of:
//   · outer halo aura (soft radial blur)
//   · two concentric ripple rings emanating outward on a slow loop
//   · the main orb with a multi-stop radial gradient
//   · three caustic-style inner blobs that drift independently
//   · a drifting specular highlight
//   · ~8 tiny motes orbiting outside the orb, glowing in the category color
// All animation durations are slow (7–16s) so it feels meditative, never busy.
// ─────────────────────────────────────────────────────────────────────────────
function BreathOrb({ color, scale = 1, ms = 2000 }) {
  const tx = `transform ${ms}ms cubic-bezier(.4,0,.2,1)`;

  // Stable per-instance namespace so injected keyframes don't collide.
  const instanceId = useMemo(
    () => 'orb-' + Math.random().toString(36).slice(2, 8),
    []
  );

  // Generate firefly motes — each with a unique drift path + blink rhythm.
  // Positions avoid the center where the orb sits; everything else is random.
  const motes = useMemo(() => {
    const arr = [];
    const N = 11;
    for (let i = 0; i < N; i++) {
      // pick a base anchor outside the orb's central area
      let bx, by;
      let tries = 0;
      do {
        bx = 8 + Math.random() * 84;
        by = 8 + Math.random() * 84;
        tries++;
      } while (tries < 12 && bx > 30 && bx < 70 && by > 30 && by < 70);

      // 4 random waypoints — the firefly wanders, then fades out and respawns
      const waypoints = [];
      for (let j = 0; j < 4; j++) {
        waypoints.push({
          x: (Math.random() - 0.5) * 90,
          y: (Math.random() - 0.5) * 90,
          o: 0.2 + Math.random() * 0.65, // brightness when visible
        });
      }
      arr.push({
        id: i,
        bx, by,
        size: 2 + Math.random() * 3.5,
        dur: 10 + Math.random() * 10,    // 10–20s — slow drifts
        delay: -Math.random() * 14,        // staggered start so they're never in sync
        waypoints,
        isWhite: Math.random() < 0.35,
      });
    }
    return arr;
  }, []);

  // Inject unique keyframes for each firefly so paths look organic, not patterned.
  useEffect(() => {
    let css = '';
    motes.forEach((m) => {
      const N = m.waypoints.length;
      let kf = `@keyframes ancla-${instanceId}-${m.id} {\n`;
      kf += `  0%   { transform: translate(0,0); opacity: 0; }\n`;
      kf += `  8%   { opacity: ${m.waypoints[0].o.toFixed(2)}; }\n`;
      m.waypoints.forEach((w, idx) => {
        const pct = 10 + ((idx + 1) / (N + 1)) * 80;
        kf += `  ${pct.toFixed(1)}% { transform: translate(${w.x.toFixed(1)}px, ${w.y.toFixed(1)}px); opacity: ${w.o.toFixed(2)}; }\n`;
      });
      kf += `  92%  { opacity: 0; }\n`;
      kf += `  100% { transform: translate(0,0); opacity: 0; }\n`;
      kf += `}\n`;
      css += kf;
    });
    const tagId = 'kf-' + instanceId;
    let tag = document.getElementById(tagId);
    if (!tag) {
      tag = document.createElement('style');
      tag.id = tagId;
      document.head.appendChild(tag);
    }
    tag.textContent = css;
    return () => { try { tag && tag.remove(); } catch (_) {} };
  }, [instanceId, motes]);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: 360,
      aspectRatio: '1 / 1',
      display: 'grid',
      placeItems: 'center',
    }}>
      {/* AURA — three stacked, very soft radial halos. Prominent, breathes with the orb. */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: `radial-gradient(circle, ${color}26, ${color}10 38%, transparent 65%)`,
        filter: 'blur(28px)',
        transform: `scale(${scale * 1.35})`,
        transition: tx,
      }} />
      <div style={{
        position: 'absolute', inset: '6%', borderRadius: '50%',
        background: `radial-gradient(circle, ${color}3a, ${color}18 45%, transparent 70%)`,
        filter: 'blur(22px)',
        transform: `scale(${scale * 1.22})`,
        transition: tx,
      }} />
      <div style={{
        position: 'absolute', inset: '18%', borderRadius: '50%',
        background: `radial-gradient(circle, ${color}55, ${color}25 50%, transparent 78%)`,
        filter: 'blur(14px)',
        transform: `scale(${scale * 1.12})`,
        transition: tx,
      }} />

      {/* MAIN ORB — magical water-droplet: translucent body, top sheen, focused caustic inside. */}
      <div style={{
        position: 'relative',
        width: '54%', aspectRatio: '1 / 1', borderRadius: '50%',
        background: `
          radial-gradient(circle at 62% 72%, rgba(255,255,255,0.55), rgba(255,255,255,0) 24%),
          radial-gradient(circle at 32% 28%, ${color}40, ${color}00 50%),
          radial-gradient(circle at 50% 50%, ${color}cc, ${color}dc 60%, ${color}c8 100%)
        `,
        transform: `scale(${scale})`,
        transition: tx,
        // top meniscus + bottom depth + thin rim of light
        boxShadow: `
          inset 0 1.5px 0 rgba(255,255,255,0.55),
          inset 0 -10px 24px ${color}99,
          inset 0 0 0 1px ${color}55,
          0 10px 38px ${color}40
        `,
        overflow: 'hidden',
        // surface-tension wobble — visible water-droplet morph (independent of breath scale)
        animation: 'ancla-droplet-wobble 9s ease-in-out infinite',
      }}>
        {/* Top sheen arc — thin bright curve like light skimming the surface */}
        <div style={{
          position: 'absolute', left: '20%', top: '6%', width: '60%', height: '14%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.65), rgba(255,255,255,0) 72%)',
          transform: 'rotate(-10deg)',
          filter: 'blur(3px)',
          opacity: 0.85,
        }} />

        {/* Refraction shadow — soft darker pool inside the lower-left, like light bending through */}
        <div style={{
          position: 'absolute', left: '4%', bottom: '10%', width: '55%', height: '50%',
          borderRadius: '50%',
          background: `radial-gradient(circle at 40% 60%, ${color}, ${color}00 65%)`,
          mixBlendMode: 'multiply',
          opacity: 0.4,
          filter: 'blur(10px)',
        }} />

        {/* Drifting white current — keeps "life" */}
        <div style={{
          position: 'absolute', left: '12%', top: '8%', width: '60%', height: '60%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.22), rgba(255,255,255,0) 70%)',
          animation: 'ancla-caustic-a 14s ease-in-out infinite',
          filter: 'blur(7px)',
        }} />

        {/* Focused caustic point — the bright spot of light projected through the drop */}
        <div style={{
          position: 'absolute', left: '52%', top: '58%', width: '22%', height: '22%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.75), rgba(255,255,255,0) 60%)',
          filter: 'blur(2.5px)',
          animation: 'ancla-caustic-b 16s ease-in-out infinite',
        }} />
      </div>

      {/* FIREFLIES — random paths, blink in/out, transparent */}
      {motes.map((m) => (
        <span key={m.id} style={{
          position: 'absolute',
          left: `${m.bx}%`, top: `${m.by}%`,
          width: m.size, height: m.size,
          marginLeft: -m.size / 2, marginTop: -m.size / 2,
          borderRadius: '50%',
          background: m.isWhite ? 'rgba(255,255,255,0.9)' : color,
          boxShadow: m.isWhite
            ? `0 0 ${m.size * 3}px rgba(255,255,255,0.6), 0 0 ${m.size * 6}px ${color}66`
            : `0 0 ${m.size * 3}px ${color}, 0 0 ${m.size * 6}px ${color}66`,
          animation: `ancla-${instanceId}-${m.id} ${m.dur}s ease-in-out infinite`,
          animationDelay: `${m.delay}s`,
          pointerEvents: 'none',
          willChange: 'transform, opacity',
        }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Suspiro Fisiológico — auto cycle
// ─────────────────────────────────────────────────────────────────────────────
const SUSPIRO_SEQ = [
  { label: 'Inhala…',                ms: 2000, scale: 1.0  },
  { label: 'Otro sorbito de aire…',  ms: 500,  scale: 1.18 },
  { label: 'Suelta lento…',          ms: 4000, scale: 0.78 },
];

function MethodSuspiro({ color, onExit }) {
  const [state, setState] = useState('breathing'); // breathing | checkin
  const [cycle, setCycle] = useState(0);
  const [step, setStep] = useState(0);
  const targetCycles = 3;

  useEffect(() => {
    if (state !== 'breathing') return;
    const t = setTimeout(() => {
      if (step < SUSPIRO_SEQ.length - 1) {
        setStep(step + 1);
      } else if (cycle < targetCycles - 1) {
        setCycle(cycle + 1);
        setStep(0);
      } else {
        setState('checkin');
      }
    }, SUSPIRO_SEQ[step].ms);
    return () => clearTimeout(t);
  }, [step, cycle, state]);

  const cur = SUSPIRO_SEQ[step];

  if (state === 'breathing') {
    return (
      <CenteredFlow>
        <Counter current={cycle + 1} total={targetCycles} color={color} />
        <BreathOrb color={color} scale={cur.scale} ms={cur.ms} />
        <FadeKey k={step + '-' + cycle}>
          <p style={instructionStyle}>{cur.label}</p>
        </FadeKey>
        <Btn variant="quiet" onClick={onExit}>Detener</Btn>
      </CenteredFlow>
    );
  }

  // checkin
  return (
    <CenteredFlow>
      <FadeKey k="checkin">
        <h2 style={titleStyle}>¿Cómo te sientes ahora?</h2>
        <p style={mutedTextStyle}>No hay respuesta correcta. Solo nota lo que está pasando en tu cuerpo.</p>
      </FadeKey>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 360 }}>
        <Btn variant="ghost" onClick={onExit}>Más tranquilo/a</Btn>
        <Btn variant="ghost" onClick={() => { setCycle(0); setStep(0); setState('breathing'); }}>Un poco mejor — repetir</Btn>
        <Btn variant="ghost" onClick={() => setState('tipp')}>Sigo muy asustado/a</Btn>
      </div>
    </CenteredFlow>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Respiración Diafragmática — slower breath, 6 cycles, no TIPP
// ─────────────────────────────────────────────────────────────────────────────
const DIAF_SEQ = [
  { label: 'Inhala despacio, lleva el aire al abdomen…', ms: 3500, scale: 1.18 },
  { label: 'Sostén un momento…',                          ms: 1500, scale: 1.18 },
  { label: 'Exhala lento…',                               ms: 4000, scale: 0.82 },
];

function MethodDiafragmatica({ color, onExit }) {
  const [state, setState] = useState('breathing');
  const [cycle, setCycle] = useState(0);
  const [step, setStep] = useState(0);
  const total = 6;

  useEffect(() => {
    if (state !== 'breathing') return;
    const t = setTimeout(() => {
      if (step < DIAF_SEQ.length - 1) setStep(step + 1);
      else if (cycle < total - 1) { setCycle(cycle + 1); setStep(0); }
      else setState('done');
    }, DIAF_SEQ[step].ms);
    return () => clearTimeout(t);
  }, [step, cycle, state]);

  if (state === 'done') {
    return (
      <CenteredFlow>
        <FadeKey k="done"><h2 style={titleStyle}>Llegaste al sexto ciclo.</h2></FadeKey>
        <p style={mutedTextStyle}>Tu cuerpo acaba de practicar bajar la alarma.</p>
        <Btn variant="ghost" onClick={() => { setCycle(0); setStep(0); setState('breathing'); }}>Repetir</Btn>
        <Btn variant="primary" onClick={onExit}>Volver al catálogo</Btn>
      </CenteredFlow>
    );
  }

  const cur = DIAF_SEQ[step];
  return (
    <CenteredFlow>
      <Counter current={cycle + 1} total={total} color={color} />
      <BreathOrb color={color} scale={cur.scale} ms={cur.ms} />
      <FadeKey k={step + '-' + cycle}><p style={instructionStyle}>{cur.label}</p></FadeKey>
      <Btn variant="quiet" onClick={onExit}>Detener</Btn>
    </CenteredFlow>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Burbujas de Calma — overlay, user-controlled
// ─────────────────────────────────────────────────────────────────────────────
const BUBBLE_COLORS = [
  '#5b81a8', '#7299bc', '#89afd1', '#6a8aaa', // blues
  '#6b7f5e', '#8a9e7a', '#7a9570',            // greens
  '#c4a882', '#b8956f',                       // warms
];

// Cell grid for even distribution — 5 columns × 3 rows = 15 cells.
// We pick a cell, then place the bubble at the cell center + small jitter.
// Cells are chosen with weighting that prefers the LEAST-occupied ones, so
// bubbles spread across the screen instead of clumping in one spot.
const BUBBLE_COLS = 5;
const BUBBLE_ROWS = 3;
const BUBBLE_CELLS = BUBBLE_COLS * BUBBLE_ROWS;
const BUBBLE_X_MIN = 8;
const BUBBLE_X_MAX = 92;
const BUBBLE_Y_MIN = 10;
const BUBBLE_Y_MAX = 78; // leave room for the "Ya fue suficiente" button

function pickCell(activeBubbles) {
  // Count current occupancy per cell.
  const counts = new Array(BUBBLE_CELLS).fill(0);
  for (const b of activeBubbles) {
    if (!b.popping && typeof b.cell === 'number') counts[b.cell] += 1;
  }
  const minCount = Math.min(...counts);
  // Candidates: cells with the lowest occupancy.
  const candidates = [];
  for (let i = 0; i < BUBBLE_CELLS; i++) {
    if (counts[i] === minCount) candidates.push(i);
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function makeBubble(id, activeBubbles = []) {
  const cell = pickCell(activeBubbles);
  const col = cell % BUBBLE_COLS;
  const row = Math.floor(cell / BUBBLE_COLS);
  const colW = (BUBBLE_X_MAX - BUBBLE_X_MIN) / BUBBLE_COLS;
  const rowH = (BUBBLE_Y_MAX - BUBBLE_Y_MIN) / BUBBLE_ROWS;
  // Center of the cell + jitter so it doesn't snap to a visible grid.
  const jitterX = (Math.random() - 0.5) * (colW * 0.65);
  const jitterY = (Math.random() - 0.5) * (rowH * 0.65);
  const startX = BUBBLE_X_MIN + colW * (col + 0.5) + jitterX;
  const startY = BUBBLE_Y_MIN + rowH * (row + 0.5) + jitterY;

  const size = 64 + Math.random() * 72; // 64–136
  // 4 wandering waypoints — kept small so bubbles meander inside their cell.
  const waypoints = Array.from({ length: 4 }).map(() => ({
    x: (Math.random() - 0.5) * 12, // ±6 vw
    y: (Math.random() - 0.5) * 10, // ±5 vh
  }));
  const dur = 14 + Math.random() * 10;
  const delay = -Math.random() * 6;
  const wobbleDur = 5 + Math.random() * 4;        // each bubble breathes at its own rhythm
  const wobbleDelay = -Math.random() * 6;
  const wobbleVariant = Math.floor(Math.random() * 3); // 3 morph patterns
  const color = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
  return { id, cell, size, startX, startY, waypoints, dur, delay, wobbleDur, wobbleDelay, wobbleVariant, color, popping: false };
}

function MethodBurbujas({ color, onExit }) {
  // Seed initial 9 bubbles with even cell distribution.
  const [bubbles, setBubbles] = useState(() => {
    const arr = [];
    for (let i = 0; i < 9; i++) {
      arr.push(makeBubble('b' + Date.now() + i, arr));
    }
    return arr;
  });
  const [showExit, setShowExit] = useState(false);
  const idRef = useRef(100);

  useEffect(() => {
    const t = setTimeout(() => setShowExit(true), 2000);
    return () => clearTimeout(t);
  }, []);

  // spawn new bubbles
  useEffect(() => {
    let alive = true;
    let tt;
    const tick = () => {
      if (!alive) return;
      setBubbles((prev) => {
        const active = prev.filter((b) => !b.popping);
        if (active.length >= 20) return prev;
        return [...prev, makeBubble('b' + (idRef.current++), prev)];
      });
      const next = 700 + Math.random() * 900;
      tt = setTimeout(tick, next);
    };
    tt = setTimeout(tick, 1200);
    return () => { alive = false; clearTimeout(tt); };
  }, []);

  // garbage collect popped & expired
  useEffect(() => {
    const gc = setInterval(() => {
      setBubbles((prev) => prev.filter((b) => !b.popping || (Date.now() - b.poppedAt) < 600));
    }, 800);
    return () => clearInterval(gc);
  }, []);

  const pop = (id) => {
    setBubbles((prev) => prev.map((b) => b.id === id ? { ...b, popping: true, poppedAt: Date.now() } : b));
    buzz(10);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, top: 56, background: 'var(--c-bg)', zIndex: 4, overflow: 'hidden',
    }}>
      {bubbles.map((b) => (
        <BubbleEl key={b.id} b={b} onPop={() => pop(b.id)} />
      ))}
      {showExit && (
        <button
          onClick={onExit}
          style={{
            position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)',
            padding: '13px 26px', borderRadius: 999,
            background: 'rgba(245,242,238,0.88)',
            backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(44,44,42,0.14)',
            color: 'var(--c-text)', fontSize: 14, fontWeight: 500,
            boxShadow: '0 4px 24px rgba(44,44,42,0.08)',
            animation: 'ancla-fade-up .6s cubic-bezier(.4,0,.2,1) both',
          }}
        >
          Ya fue suficiente
        </button>
      )}
    </div>
  );
}

function BubbleEl({ b, onPop }) {
  // Inject a unique @keyframes path per bubble so each one wanders independently.
  useEffect(() => {
    if (b.popping) return;
    const id = `kf-bubble-${b.id}`;
    if (document.getElementById(id)) return;
    const N = b.waypoints.length;
    let kf = `@keyframes ancla-bubble-drift-${b.id} {\n`;
    kf += `  0%   { transform: translate(0vw, 0vh); }\n`;
    b.waypoints.forEach((w, idx) => {
      const pct = ((idx + 1) / (N + 1)) * 100;
      kf += `  ${pct.toFixed(1)}% { transform: translate(${w.x.toFixed(2)}vw, ${w.y.toFixed(2)}vh); }\n`;
    });
    kf += `  100% { transform: translate(0vw, 0vh); }\n`;
    kf += `}`;
    const tag = document.createElement('style');
    tag.id = id;
    tag.textContent = kf;
    document.head.appendChild(tag);
    return () => { try { tag.remove(); } catch (_) {} };
  }, [b.id, b.popping]);

  // Pop: distort + burst splash + fade.
  if (b.popping) {
    return <PoppedBurst b={b} />;
  }
  return (
    <div
      style={{
        position: 'absolute',
        left: `${b.startX}%`,
        top: `${b.startY}%`,
        width: b.size,
        height: b.size,
        cursor: 'pointer',
        willChange: 'transform',
        animation: `ancla-bubble-drift-${b.id} ${b.dur}s ease-in-out infinite`,
        animationDelay: `${b.delay}s`,
      }}
      onClick={onPop}
      onTouchStart={onPop}
    >
      {/* Inner element handles the surface-tension wobble + visuals independently
          of the outer drift animation. */}
      <div style={{
        width: '100%', height: '100%',
        borderRadius: '50%',
        background: `radial-gradient(circle at 32% 28%, ${b.color}aa, ${b.color}cc 55%, ${b.color}bb 100%)`,
        boxShadow: `inset -6px -8px 18px ${b.color}66, inset 6px 6px 16px rgba(255,255,255,0.25), 0 4px 18px ${b.color}33`,
        border: '1px solid rgba(255,255,255,0.25)',
        opacity: 0.95,
        animation: `ancla-bubble-wobble-${b.wobbleVariant} ${b.wobbleDur}s ease-in-out infinite`,
        animationDelay: `${b.wobbleDelay}s`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Inner highlight that drifts — reads as a moving reflection inside a bubble */}
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
  );
}

// PoppedBurst — bubble that's been tapped: distorts, then bursts into droplets.
// Droplet count + angles are computed per bubble so each pop looks different.
function PoppedBurst({ b }) {
  const droplets = useMemo(() => {
    const N = 6 + Math.floor(b.size / 28); // 6–10 droplets depending on size
    const baseAngle = Math.random() * Math.PI * 2;
    return Array.from({ length: N }).map((_, i) => {
      const angle = baseAngle + (i / N) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const dist = b.size * (0.55 + Math.random() * 0.55); // 55–110% of bubble size
      return {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        r: 4 + Math.random() * (b.size / 14),
        delay: Math.random() * 60,
      };
    });
  }, [b.id, b.size]);

  return (
    <div style={{
      position: 'absolute',
      left: `${b.startX}%`,
      top: `${b.startY}%`,
      width: b.size,
      height: b.size,
      pointerEvents: 'none',
    }}>
      {/* The bubble itself — quick distort + fade */}
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '50%',
        background: `radial-gradient(circle at 32% 28%, ${b.color}aa, ${b.color}cc 55%, ${b.color}bb 100%)`,
        boxShadow: `inset -6px -8px 18px ${b.color}66, inset 6px 6px 16px rgba(255,255,255,0.25), 0 4px 18px ${b.color}33`,
        border: '1px solid rgba(255,255,255,0.25)',
        animation: 'ancla-bubble-burst 0.45s cubic-bezier(.4,0,.2,1) forwards',
      }} />
      {/* Halo flash */}
      <div style={{
        position: 'absolute', inset: '-15%',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${b.color}55, ${b.color}00 65%)`,
        animation: 'ancla-bubble-flash 0.55s ease-out forwards',
        filter: 'blur(4px)',
      }} />
      {/* Outer ring shockwave */}
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '50%',
        border: `2px solid ${b.color}`,
        animation: 'ancla-bubble-shock 0.55s cubic-bezier(.2,.8,.4,1) forwards',
      }} />
      {/* Droplets flying outward */}
      {droplets.map((d, i) => (
        <span key={i} style={{
          position: 'absolute',
          left: '50%', top: '50%',
          width: d.r, height: d.r,
          marginLeft: -d.r / 2, marginTop: -d.r / 2,
          borderRadius: '50%',
          background: `radial-gradient(circle at 32% 28%, ${b.color}cc, ${b.color}dd)`,
          boxShadow: `inset -1px -2px 4px ${b.color}88, 0 2px 4px ${b.color}44`,
          '--dx': `${d.x}px`,
          '--dy': `${d.y}px`,
          animation: `ancla-droplet-fly 0.6s cubic-bezier(.2,.7,.3,1) forwards`,
          animationDelay: `${d.delay}ms`,
        }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Tensión y Liberación — personaje + manos (Wii-squeeze)
// ─────────────────────────────────────────────────────────────────────────────
const TENSION_SEQ = [
  { main: 'Inhala profundo.',    ms: 3000, phase: 'inhale',  buzz: null },
  { main: 'Aprieta los puños.',  ms: 5000, phase: 'tight',   buzz: [60, 40, 60] },
  { main: 'Afloja las manos.',   ms: 1200, phase: 'release', buzz: 25 },
  { main: 'Exhala lento.',       ms: 5500, phase: 'exhale',  buzz: null },
];

// Face expressions for each phase. Drawn into the head ellipse, viewBox centered (0,0).
function HeadFace({ phase, color }) {
  return (
    <g key={phase} style={{ animation: 'ancla-face-in 0.35s ease both' }}>
      {phase === 'inhale' && (
        <g>
          {/* eyes — looking up slightly, focusing */}
          <circle cx="-14" cy="-6" r="3.6" fill="#2C2C2A" />
          <circle cx="14"  cy="-6" r="3.6" fill="#2C2C2A" />
          {/* eye shine */}
          <circle cx="-12.5" cy="-7.5" r="1.1" fill="#FBF9F5" />
          <circle cx="15.5"  cy="-7.5" r="1.1" fill="#FBF9F5" />
          {/* tiny o mouth — inhaling */}
          <ellipse cx="0" cy="14" rx="4" ry="5" fill="#2C2C2A" />
        </g>
      )}
      {phase === 'tight' && (
        <g>
          {/* angled brows */}
          <path d="M -20 -14 L -8 -10" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M 20 -14  L 8 -10"  stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" />
          {/* scrunched eyes — squinted shut */}
          <path d="M -19 -4 Q -14 0 -9 -4" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          <path d="M 9 -4 Q 14 0 19 -4"   stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          {/* gritted mouth — wavy line */}
          <path d="M -12 14 Q -8 18 -4 14 Q 0 18 4 14 Q 8 18 12 14" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          {/* tongue tip peeking — playful */}
          <ellipse cx="0" cy="21" rx="3.5" ry="3.5" fill="#c97a7a" />
          {/* effort lines around head */}
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
          {/* wide surprised eyes — "phew!" */}
          <circle cx="-14" cy="-6" r="5" fill="#2C2C2A" />
          <circle cx="14"  cy="-6" r="5" fill="#2C2C2A" />
          <circle cx="-12" cy="-8" r="1.4" fill="#FBF9F5" />
          <circle cx="16"  cy="-8" r="1.4" fill="#FBF9F5" />
          {/* surprised o */}
          <ellipse cx="0" cy="16" rx="5" ry="6.5" fill="#2C2C2A" />
        </g>
      )}
      {phase === 'exhale' && (
        <g>
          {/* peaceful closed eyes — gentle curves */}
          <path d="M -20 -6 Q -14 -1 -8 -6" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          <path d="M 8 -6  Q 14 -1  20 -6" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          {/* gentle smile */}
          <path d="M -10 12 Q 0 20 10 12" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        </g>
      )}
    </g>
  );
}

// Hand icon. Two states: 'open' palm or 'fist'.
function HandIcon({ state, color, mirrored }) {
  const sx = mirrored ? -1 : 1;
  return (
    <g transform={`scale(${sx}, 1)`} style={{ transition: 'fill 0.5s ease' }}>
      {state === 'fist' ? (
        <g>
          {/* clenched fist body */}
          <rect x="-22" y="-20" width="44" height="40" rx="14" fill={color} />
          {/* knuckle bumps along top */}
          <circle cx="-13" cy="-18" r="5" fill={color} />
          <circle cx="-4"  cy="-19" r="5" fill={color} />
          <circle cx="5"   cy="-19" r="5" fill={color} />
          <circle cx="14"  cy="-18" r="5" fill={color} />
          {/* knuckle creases */}
          <line x1="-9"  y1="-13" x2="-9"  y2="-7" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="0"   y1="-14" x2="0"   y2="-8" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="9"   y1="-13" x2="9"   y2="-7" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" strokeLinecap="round" />
          {/* thumb bump */}
          <ellipse cx="-20" cy="4" rx="7" ry="9" fill={color} />
        </g>
      ) : (
        <g>
          {/* open palm body */}
          <ellipse cx="0" cy="6" rx="19" ry="17" fill={color} />
          {/* fingers (4 nubs upward) */}
          <ellipse cx="-13" cy="-14" rx="4.2" ry="10" fill={color} />
          <ellipse cx="-4.5" cy="-18" rx="4.2" ry="12" fill={color} />
          <ellipse cx="4.5"  cy="-18" rx="4.2" ry="12" fill={color} />
          <ellipse cx="13"  cy="-14" rx="4.2" ry="10" fill={color} />
          {/* thumb */}
          <ellipse cx="-18" cy="3" rx="5" ry="9" fill={color} transform="rotate(-28 -18 3)" />
          {/* palm crease */}
          <path d="M -10 6 Q 0 10 10 6" stroke="rgba(0,0,0,0.12)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        </g>
      )}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GUIDE CHARACTER — Wii-Mii inspired companion used by other methods to
// deliver instructions through comic-style speech bubbles.
// Reuses the same head silhouette as Tension's character so it reads as the
// same friend across the app.
// ─────────────────────────────────────────────────────────────────────────────

function GuideFace({ expression, color }) {
  // viewBox local coords: centered (0,0). Same scale as CharacterStage's head.
  switch (expression) {
    case 'hello': return (
      <g key={expression} style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        <circle cx="-14" cy="-6" r="3.6" fill="#2C2C2A" />
        <circle cx="14"  cy="-6" r="3.6" fill="#2C2C2A" />
        <circle cx="-12.5" cy="-7.5" r="1.1" fill="#FBF9F5" />
        <circle cx="15.5"  cy="-7.5" r="1.1" fill="#FBF9F5" />
        <path d="M -10 12 Q 0 20 10 12" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      </g>
    );
    case 'curious': return (
      <g key={expression} style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        <path d="M -22 -16 Q -14 -19 -8 -16" stroke="#2C2C2A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M 8 -16   Q 14 -19  22 -16" stroke="#2C2C2A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <circle cx="-14" cy="-6" r="3.6" fill="#2C2C2A" />
        <circle cx="14"  cy="-6" r="3.6" fill="#2C2C2A" />
        <circle cx="-12.5" cy="-7.5" r="1.1" fill="#FBF9F5" />
        <circle cx="15.5"  cy="-7.5" r="1.1" fill="#FBF9F5" />
        <ellipse cx="0" cy="14" rx="3.5" ry="4.5" fill="#2C2C2A" />
      </g>
    );
    case 'listening': return (
      <g key={expression} style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        <path d="M -20 -6 Q -14 -1 -8 -6" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <path d="M 8 -6  Q 14 -1  20 -6" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <path d="M -8 11 Q 0 16 8 11" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        {/* little music notes drifting */}
        <g opacity="0.7" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none">
          <path d="M -40 -22 L -40 -12" />
          <ellipse cx="-42" cy="-11" rx="3" ry="2" fill={color} stroke="none" />
          <path d="M 38 -28 L 38 -18" />
          <ellipse cx="36" cy="-17" rx="2.5" ry="1.8" fill={color} stroke="none" />
        </g>
      </g>
    );
    case 'touchy': return (
      <g key={expression} style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        <circle cx="-13" cy="-5" r="3.2" fill="#2C2C2A" />
        <circle cx="13"  cy="-5" r="3.2" fill="#2C2C2A" />
        <circle cx="-11.5" cy="-6.5" r="1" fill="#FBF9F5" />
        <circle cx="14.5"  cy="-6.5" r="1" fill="#FBF9F5" />
        <path d="M -10 11 Q 0 17 10 11" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      </g>
    );
    case 'sniff': return (
      <g key={expression} style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        <circle cx="-14" cy="-6" r="3.6" fill="#2C2C2A" />
        <circle cx="14"  cy="-6" r="3.6" fill="#2C2C2A" />
        <circle cx="-12.5" cy="-7.5" r="1.1" fill="#FBF9F5" />
        <circle cx="15.5"  cy="-7.5" r="1.1" fill="#FBF9F5" />
        <ellipse cx="0" cy="14" rx="4.5" ry="5.5" fill="#2C2C2A" />
        {/* aroma wisps */}
        <g opacity="0.6" stroke={color} strokeWidth="1.7" strokeLinecap="round" fill="none">
          <path d="M -34 -8 Q -38 -16 -32 -22" />
          <path d="M 34 -8  Q 38 -16  32 -22" />
        </g>
      </g>
    );
    case 'taste': return (
      <g key={expression} style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        <path d="M -19 -5 Q -14 -1 -9 -5" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <circle cx="14" cy="-6" r="3.6" fill="#2C2C2A" />
        <circle cx="15.5" cy="-7.5" r="1.1" fill="#FBF9F5" />
        <path d="M -8 11 Q 0 17 8 11" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <ellipse cx="2" cy="18" rx="3.5" ry="3" fill="#c97a7a" />
      </g>
    );
    case 'happy': return (
      <g key={expression} style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        <path d="M -20 -6 Q -14 -1 -8 -6" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <path d="M 8 -6  Q 14 -1  20 -6" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <path d="M -12 11 Q 0 22 12 11" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      </g>
    );
    case 'thinking': return (
      <g key={expression} style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        <circle cx="-12" cy="-8" r="3.4" fill="#2C2C2A" />
        <circle cx="16"  cy="-8" r="3.4" fill="#2C2C2A" />
        <path d="M -6 12 Q 0 14 6 12" stroke="#2C2C2A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <ellipse cx="6" cy="14" rx="3" ry="2" fill="#c97a7a" />
      </g>
    );
    // ─── Emotion expressions (used by Etiquetado Emocional) ────────────
    case 'miedo': return (
      <g key={expression} style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        {/* worried brows — raised AND pulled together at the inner corners */}
        <path d="M -22 -16 Q -16 -22 -10 -18" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <path d="M 10 -18  Q 16 -22  22 -16" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        {/* very wide trembling eyes with strong shake */}
        <g style={{ animation: 'ancla-fear-jitter 0.18s ease-in-out infinite alternate' }}>
          <circle cx="-14" cy="-3" r="5" fill="#FBF9F5" stroke="#2C2C2A" strokeWidth="1.6" />
          <circle cx="-14" cy="-2" r="2.6" fill="#2C2C2A" />
          <circle cx="14"  cy="-3" r="5" fill="#FBF9F5" stroke="#2C2C2A" strokeWidth="1.6" />
          <circle cx="14"  cy="-2" r="2.6" fill="#2C2C2A" />
        </g>
        {/* tall narrow gasping mouth */}
        <ellipse cx="0" cy="16" rx="3.2" ry="6.5" fill="#2C2C2A" />
        {/* sweat drop */}
        <path d="M 28 -10 Q 30 -6 28 -2 Q 26 -6 28 -10 Z" fill={color} opacity="0.7" />
      </g>
    );
    case 'verguenza': return (
      <g key={expression} style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        {/* slightly raised soft brows */}
        <path d="M -22 -14 Q -16 -18 -8 -16" stroke="#2C2C2A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M 8 -16   Q 16 -18  22 -14" stroke="#2C2C2A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        {/* eyes closed shyly, both curving down */}
        <path d="M -19 -3 Q -14 1 -9 -3" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M 9 -3 Q 14 1 19 -3"    stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        {/* big rosy cheeks — the defining mark of shame */}
        <circle cx="-22" cy="6" r="11" fill="#e89090" opacity="0.7" />
        <circle cx="22"  cy="6" r="11" fill="#e89090" opacity="0.7" />
        {/* small embarrassed wavy mouth */}
        <path d="M -6 13 Q -2 16 2 13 Q 5 11 8 13" stroke="#2C2C2A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        {/* tiny sweat-drop near temple */}
        <path d="M -30 -2 Q -28 2 -30 6 Q -32 2 -30 -2 Z" fill={color} opacity="0.6" />
      </g>
    );
    case 'culpa': return (
      <g key={expression} style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        {/* inner-up brows = guilt */}
        <path d="M -22 -12 L -8 -16" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M 22 -12  L 8 -16"  stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" />
        {/* downcast eyes */}
        <path d="M -18 -3 Q -13 1 -8 -3" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M 8 -3 Q 13 1 18 -3"    stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        {/* small slightly-down mouth */}
        <path d="M -7 14 Q 0 11 7 14" stroke="#2C2C2A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      </g>
    );
    case 'asco': return (
      <g key={expression} style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        {/* both brows scrunched down hard — disgust scowl */}
        <path d="M -22 -16 Q -16 -10 -8 -14" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <path d="M 8 -14   Q 16 -10  22 -16" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        {/* both eyes squinted shut */}
        <path d="M -19 -4 Q -14 -8 -9 -4" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M 9 -4 Q 14 -8 19 -4"    stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        {/* nose-wrinkle stack — strong */}
        <path d="M -5 3 Q 0 1 5 3" stroke="#2C2C2A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M -6 6 Q 0 4 6 6" stroke="#2C2C2A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        {/* mouth: wide pulled-back grimace, corners down */}
        <path d="M -14 17 Q -8 12 0 13 Q 8 12 14 17" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        {/* upper teeth showing */}
        <path d="M -11 14 L 11 14" stroke="#2C2C2A" strokeWidth="1.4" strokeLinecap="round" />
      </g>
    );
    case 'enojo': return (
      <g key={expression} style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        {/* angled-down brows */}
        <path d="M -22 -16 L -8 -10" stroke="#2C2C2A" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M 22 -16  L 8 -10"  stroke="#2C2C2A" strokeWidth="2.8" strokeLinecap="round" />
        {/* glaring eyes */}
        <circle cx="-13" cy="-3" r="2.8" fill="#2C2C2A" />
        <circle cx="13"  cy="-3" r="2.8" fill="#2C2C2A" />
        {/* firm flat mouth, slight scowl */}
        <path d="M -8 15 Q 0 12 8 15" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      </g>
    );
    case 'confusion': return (
      <g key={expression} style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        {/* uneven brows — one up, one normal */}
        <path d="M -22 -18 Q -14 -22 -6 -16" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M 6 -14   L 22 -12"          stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" />
        {/* normal eyes */}
        <circle cx="-13" cy="-5" r="3.2" fill="#2C2C2A" />
        <circle cx="13"  cy="-5" r="3.2" fill="#2C2C2A" />
        <circle cx="-11.5" cy="-6.5" r="1" fill="#FBF9F5" />
        <circle cx="14.5"  cy="-6.5" r="1" fill="#FBF9F5" />
        {/* wavy mouth */}
        <path d="M -8 14 Q -4 17 0 14 Q 4 11 8 14" stroke="#2C2C2A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      </g>
    );
    case 'tristeza': return (
      <g key={expression} style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        {/* inner-up sad brows (more dramatic) */}
        <path d="M -22 -8 L -8 -16"  stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M 22 -8   L 8 -16"  stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" />
        {/* drooping closed eyes, curve clearly DOWN */}
        <path d="M -20 -2 Q -14 -7 -8 -2" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M 8 -2 Q 14 -7 20 -2"    stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        {/* clearly downturned mouth (frown) */}
        <path d="M -10 16 Q 0 22 10 16" stroke="#2C2C2A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        {/* big tear running down from the right eye */}
        <path d="M 14 4 Q 13 10 14 18 Q 17 14 16 8 Q 15 4 14 4 Z"
              fill={color} opacity="0.8">
          <animate attributeName="opacity" values="0;0.85;0" dur="3s" repeatCount="indefinite" />
        </path>
        {/* smaller second tear on the left, delayed */}
        <path d="M -14 4 Q -13 8 -14 14 Q -16 11 -15 7 Q -15 4 -14 4 Z"
              fill={color} opacity="0.6">
          <animate attributeName="opacity" values="0;0.7;0" dur="3s" repeatCount="indefinite" begin="-1.5s" />
        </path>
      </g>
    );
    case 'nose': return (
      <g key={expression} style={{ animation: 'ancla-face-in 0.35s ease both' }}>
        {/* slightly raised brows */}
        <path d="M -22 -14 Q -14 -17 -6 -14" stroke="#2C2C2A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M 6 -14   Q 14 -17  22 -14" stroke="#2C2C2A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        {/* dot eyes */}
        <circle cx="-13" cy="-5" r="2.6" fill="#2C2C2A" />
        <circle cx="13"  cy="-5" r="2.6" fill="#2C2C2A" />
        {/* flat unsure mouth */}
        <path d="M -8 14 L 8 14" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" />
        {/* question mark floating */}
        <text x="34" y="-18" fontFamily="serif" fontSize="22" fontWeight="500" fill={color} opacity="0.85">?</text>
      </g>
    );
    default: return null;
  }
}

function GuideCharacter({ expression = 'hello', color = '#5b81a8', size = 130 }) {
  return (
    <div style={{
      width: size, height: size * 1.08, flex: '0 0 auto',
      animation: 'ancla-guide-bob 4.5s ease-in-out infinite',
    }}>
      <svg viewBox="-60 -62 120 130" width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="guide-head" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#FBF9F5" />
            <stop offset="100%" stopColor="#EDE7DC" />
          </radialGradient>
        </defs>
        {/* shadow */}
        <ellipse cx="0" cy="56" rx="34" ry="4" fill="rgba(44,44,42,0.12)" />
        {/* head */}
        <ellipse cx="0" cy="0" rx="46" ry="50" fill="url(#guide-head)" stroke="rgba(44,44,42,0.18)" strokeWidth="1.5" />
        {/* cheek blush — subtle */}
        <circle cx="-26" cy="8" r="7" fill="#e8a8a8" opacity="0.4" />
        <circle cx="26"  cy="8" r="7" fill="#e8a8a8" opacity="0.4" />
        <GuideFace expression={expression} color={color} />
      </svg>
    </div>
  );
}

// Comic speech bubble — white card with offset shadow + tail pointing left.
function SpeechBubble({ children, k }) {
  return (
    <div
      key={k}
      style={{
        position: 'relative',
        flex: '1 1 0',
        maxWidth: 420,
        minWidth: 0,
        background: '#FFFFFF',
        border: '1.5px solid #2C2C2A',
        borderRadius: 22,
        padding: '18px 22px',
        boxShadow: '4px 4px 0 rgba(44,44,42,0.14)',
        animation: 'ancla-bubble-in 0.45s cubic-bezier(.4,0,.2,1) both',
        textAlign: 'left',
      }}
    >
      {/* tail */}
      <svg
        width="22" height="26"
        style={{ position: 'absolute', left: -15, top: 28, overflow: 'visible' }}
        viewBox="0 0 22 26"
        aria-hidden="true"
      >
        <path d="M 1 13 L 21 1 L 21 25 Z"
              fill="#FFFFFF" stroke="#2C2C2A" strokeWidth="1.5" strokeLinejoin="round" />
        {/* bridge over the bubble's left border */}
        <rect x="20" y="2" width="3" height="22" fill="#FFFFFF" />
      </svg>
      {children}
    </div>
  );
}

// Composed scene: character on the left, bubble on the right.
// `bubbleKey` should change whenever the bubble's text changes to trigger the pop-in animation.
function GuideScene({ expression = 'hello', color, bubbleKey, children }) {
  return (
    <div style={{
      width: '100%', maxWidth: 560,
      display: 'flex', alignItems: 'center', gap: 12,
      animation: 'ancla-fade-up 0.5s both',
    }}>
      <GuideCharacter expression={expression} color={color} size={110} />
      <SpeechBubble k={bubbleKey}>{children}</SpeechBubble>
    </div>
  );
}

function CharacterStage({ phase, color }) {
  const isTight = phase === 'tight';
  const isOpen  = phase === 'inhale' || phase === 'exhale';
  const isRelease = phase === 'release';

  // Strong/soft hand color (stay within category blue palette)
  const handColorSoft  = '#a8c0d6'; // light wash
  const handColorHard  = '#2f4a68'; // deeper, saturated effort
  const handFill = isTight ? handColorHard : handColorSoft;

  // Hands move slightly inward when squeezing; slightly outward + jitter on release
  const handTx = isTight ? 28 : isRelease ? -6 : 0; // px in viewBox units toward center
  const handScale = isTight ? 0.78 : isRelease ? 1.06 : 1;

  // Aura visibility — strong on inhale (anticipation) + exhale (relief)
  const auraOpacity = isOpen ? 0.55 : isRelease ? 0.25 : 0;
  const auraScale   = phase === 'exhale' ? 1.15 : 1;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 440,
        aspectRatio: '320 / 220',
        animation: isTight
          ? 'ancla-shake 0.18s ease-in-out infinite alternate'
          : isRelease
          ? 'ancla-wobble 0.3s ease-in-out infinite alternate'
          : 'none',
      }}
    >
      <svg viewBox="0 0 320 220" width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          <filter id="tension-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <radialGradient id="tension-head" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#FBF9F5" />
            <stop offset="100%" stopColor="#EDE7DC" />
          </radialGradient>
        </defs>

        {/* Aura around hands — "alivio" glow */}
        <g
          style={{
            transition: 'opacity 0.65s ease, transform 0.65s cubic-bezier(.4,0,.2,1)',
            opacity: auraOpacity,
            transformOrigin: '160px 130px',
            transform: `scale(${auraScale})`,
          }}
        >
          <ellipse cx="55"  cy="130" rx="58" ry="42" fill={color} filter="url(#tension-blur)" />
          <ellipse cx="265" cy="130" rx="58" ry="42" fill={color} filter="url(#tension-blur)" />
        </g>

        {/* Arms */}
        <g style={{ transition: 'all 0.65s cubic-bezier(.4,0,.2,1)' }}>
          <line
            x1={60 + handTx} y1="130" x2="114" y2="130"
            stroke="#8B8780" strokeWidth="4.5" strokeLinecap="round"
            style={{ transition: 'all 0.65s cubic-bezier(.4,0,.2,1)' }}
          />
          <line
            x1="206" y1="130" x2={260 - handTx} y2="130"
            stroke="#8B8780" strokeWidth="4.5" strokeLinecap="round"
            style={{ transition: 'all 0.65s cubic-bezier(.4,0,.2,1)' }}
          />
        </g>

        {/* Character head — a soft pebble */}
        <g transform="translate(160 96)">
          {/* shadow underneath */}
          <ellipse cx="0" cy="60" rx="38" ry="5" fill="rgba(44,44,42,0.08)" />
          {/* head */}
          <g
            style={{
              transformOrigin: '0 0',
              transition: 'transform 0.5s cubic-bezier(.4,0,.2,1)',
              transform: isTight ? 'scale(0.93, 1.05)' : isRelease ? 'scale(1.05, 0.95)' : 'scale(1)',
            }}
          >
            <ellipse cx="0" cy="0" rx="46" ry="50" fill="url(#tension-head)" stroke="rgba(44,44,42,0.18)" strokeWidth="1.5" />
            {/* cheek blush */}
            <circle cx="-26" cy="8" r="7" fill="#e8a8a8" opacity={isTight ? 0.6 : 0.22} style={{ transition: 'opacity 0.4s' }} />
            <circle cx="26"  cy="8" r="7" fill="#e8a8a8" opacity={isTight ? 0.6 : 0.22} style={{ transition: 'opacity 0.4s' }} />
            <HeadFace phase={phase} color={color} />
          </g>
        </g>

        {/* Left hand */}
        <g
          transform={`translate(${60 + handTx} 130) scale(${handScale * 1.15})`}
          style={{ transition: 'transform 0.65s cubic-bezier(.4,0,.2,1)' }}
        >
          <HandIcon state={isTight ? 'fist' : 'open'} color={handFill} mirrored />
        </g>
        {/* Right hand */}
        <g
          transform={`translate(${260 - handTx} 130) scale(${handScale * 1.15})`}
          style={{ transition: 'transform 0.65s cubic-bezier(.4,0,.2,1)' }}
        >
          <HandIcon state={isTight ? 'fist' : 'open'} color={handFill} />
        </g>
      </svg>
    </div>
  );
}

function MethodTension({ color, onExit }) {
  const [state, setState] = useState('intro'); // intro | active | done
  const [step, setStep] = useState(0);
  const [rep, setRep] = useState(0);
  const totalReps = 3;

  useEffect(() => {
    if (state !== 'active') return;
    if (TENSION_SEQ[step].buzz) buzz(TENSION_SEQ[step].buzz);
    const t = setTimeout(() => {
      if (step < TENSION_SEQ.length - 1) setStep(step + 1);
      else if (rep < totalReps - 1) { setRep(rep + 1); setStep(0); }
      else setState('done');
    }, TENSION_SEQ[step].ms);
    return () => clearTimeout(t);
  }, [state, step, rep]);

  if (state === 'intro') {
    return (
      <CenteredFlow>
        <FadeKey k="intro">
          <h2 style={titleStyle}>Tensión y liberación.</h2>
          <p style={mutedTextStyle}>
            Vamos a apretar los puños fuerte y luego soltar. Tres veces.
            Aprieta fuerte, pero nunca hasta sentir dolor.
          </p>
        </FadeKey>
        <Btn onClick={() => setState('active')}>Iniciar</Btn>
        <Btn variant="ghost" onClick={onExit}>Elegir otro método</Btn>
      </CenteredFlow>
    );
  }

  if (state === 'done') {
    return (
      <CenteredFlow>
        <FadeKey k="done"><h2 style={titleStyle}>Listo.</h2></FadeKey>
        <p style={mutedTextStyle}>
          Acabas de descargar lo que tu cuerpo tenía retenido. Si quieres, repite.
        </p>
        <Btn onClick={() => { setStep(0); setRep(0); setState('active'); }}>Repetir</Btn>
        <Btn variant="ghost" onClick={onExit}>Volver al catálogo</Btn>
      </CenteredFlow>
    );
  }

  const cur = TENSION_SEQ[step];
  return (
    <CenteredFlow>
      <Counter current={rep + 1} total={totalReps} color={color} />
      <CharacterStage phase={cur.phase} color={color} />
      <FadeKey k={step + '-' + rep}><p style={instructionStyle}>{cur.main}</p></FadeKey>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ height: 2, background: 'rgba(44,44,42,0.08)', borderRadius: 2, overflow: 'hidden' }}>
          <div
            key={`bar-${step}-${rep}`}
            style={{
              height: '100%', background: color, transformOrigin: 'left center',
              animation: `ancla-bar ${cur.ms}ms linear forwards`,
            }}
          />
        </div>
        <p style={{ ...microStyle, marginTop: 14, textAlign: 'center' }}>
          Aprieta fuerte, pero nunca hasta sentir dolor.
        </p>
      </div>
      <Btn variant="quiet" onClick={onExit}>Si esto no se siente bien, elegir otro método</Btn>
    </CenteredFlow>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Reacomodo Postural — 5 manual steps, demonstrated by the guide character
// ─────────────────────────────────────────────────────────────────────────────
const POSTURAL_STEPS = [
  { pose: 'feet',      text: 'Pon ambos pies en el piso.' },
  { pose: 'back',      text: 'Endereza un poco tu espalda.' },
  { pose: 'shoulders', text: 'Relaja tus hombros.' },
  { pose: 'gaze',      text: 'Levanta suavemente la mirada.' },
  { pose: 'breathe',   text: 'Respira. Tu cuerpo puede volver a sentirse seguro.' },
];

// Full-body version of the guide character — same head, with torso/arms/legs.
// Pose-specific accents (ripples, spine line, release wisps, breath particles)
// reinforce the active instruction Wii-Fit-style.
function PostureCharacter({ pose, color, size = 200 }) {
  return (
    <div style={{ width: size, height: size * 1.5, flex: '0 0 auto' }}>
      <svg viewBox="0 0 160 240" width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="post-head" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#FBF9F5" />
            <stop offset="100%" stopColor="#EDE7DC" />
          </radialGradient>
          <linearGradient id="post-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FBF9F5" />
            <stop offset="100%" stopColor="#EDE7DC" />
          </linearGradient>
        </defs>

        {/* Calming aura for 'breathe' pose */}
        {pose === 'breathe' && (
          <ellipse cx="80" cy="150" rx="70" ry="86" fill={color} opacity="0.18">
            <animate attributeName="rx" values="68;82;68" dur="4s" repeatCount="indefinite" />
            <animate attributeName="ry" values="84;96;84" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.12;0.22;0.12" dur="4s" repeatCount="indefinite" />
          </ellipse>
        )}

        {/* Ground line + shadow */}
        <line x1="22" y1="230" x2="138" y2="230"
              stroke="rgba(44,44,42,0.16)" strokeWidth="1.4" strokeDasharray="4 4" />
        <ellipse cx="80" cy="230" rx="46" ry="3.5" fill="rgba(44,44,42,0.12)" />

        {/* Legs */}
        <rect x="60" y="176" width="16" height="54" rx="8"
              fill="url(#post-body)" stroke="rgba(44,44,42,0.18)" strokeWidth="1.3" />
        <rect x="84" y="176" width="16" height="54" rx="8"
              fill="url(#post-body)" stroke="rgba(44,44,42,0.18)" strokeWidth="1.3" />

        {/* Feet */}
        <ellipse cx="63" cy="230" rx="12" ry="5" fill="#2C2C2A" />
        <ellipse cx="97" cy="230" rx="12" ry="5" fill="#2C2C2A" />

        {/* 'feet' pose — grounding ripples under each foot */}
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

        {/* Torso — taller on 'back' pose to read as "straightening" */}
        <ellipse
          cx="80"
          cy={pose === 'back' ? 142 : 146}
          rx="36"
          ry={pose === 'back' ? 46 : 40}
          fill="url(#post-body)" stroke="rgba(44,44,42,0.18)" strokeWidth="1.3"
          style={{ transition: 'cy 0.55s ease, ry 0.55s ease' }}
        />

        {/* 'back' pose — visible spine line + small up-chevron */}
        {pose === 'back' && (
          <g>
            <line x1="80" y1="104" x2="80" y2="186"
                  stroke={color} strokeWidth="2.6" strokeLinecap="round" opacity="0.65" />
            <g transform="translate(124 142)" fill={color} opacity="0.85">
              <path d="M -5 6 L 0 -2 L 5 6 Z">
                <animateTransform attributeName="transform" type="translate"
                                  values="124 148; 124 138; 124 148" dur="1.8s" repeatCount="indefinite" />
              </path>
              <path d="M -5 14 L 0 6 L 5 14 Z" opacity="0.5">
                <animateTransform attributeName="transform" type="translate"
                                  values="124 156; 124 146; 124 156" dur="1.8s" repeatCount="indefinite" />
              </path>
            </g>
          </g>
        )}

        {/* Arms — drop lower on 'shoulders' pose */}
        <path
          d={pose === 'shoulders'
            ? 'M 46 132 Q 36 168 34 200'
            : 'M 46 118 Q 34 155 32 192'}
          stroke="url(#post-body)" strokeWidth="13" strokeLinecap="round" fill="none"
          style={{ transition: 'd 0.55s ease' }}
        />
        <path
          d={pose === 'shoulders'
            ? 'M 114 132 Q 124 168 126 200'
            : 'M 114 118 Q 126 155 128 192'}
          stroke="url(#post-body)" strokeWidth="13" strokeLinecap="round" fill="none"
          style={{ transition: 'd 0.55s ease' }}
        />

        {/* 'shoulders' pose — release wisps next to each shoulder */}
        {pose === 'shoulders' && (
          <g stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.7">
            <path d="M 22 118 Q 28 124 22 132">
              <animate attributeName="opacity" values="0;0.7;0" dur="2.4s" repeatCount="indefinite" />
            </path>
            <path d="M 16 136 Q 22 142 16 150">
              <animate attributeName="opacity" values="0;0.6;0" dur="2.4s" repeatCount="indefinite" begin="-0.8s" />
            </path>
            <path d="M 138 118 Q 132 124 138 132">
              <animate attributeName="opacity" values="0;0.7;0" dur="2.4s" repeatCount="indefinite" begin="-0.4s" />
            </path>
            <path d="M 144 136 Q 138 142 144 150">
              <animate attributeName="opacity" values="0;0.6;0" dur="2.4s" repeatCount="indefinite" begin="-1.2s" />
            </path>
          </g>
        )}

        {/* Head — moves up + tilts back on 'gaze' pose */}
        <g
          transform={`translate(80 ${pose === 'gaze' ? 68 : pose === 'back' ? 70 : 74}) rotate(${pose === 'gaze' ? -6 : 0})`}
          style={{ transition: 'transform 0.55s ease' }}
        >
          <ellipse cx="0" cy="0" rx="38" ry="42"
                   fill="url(#post-head)" stroke="rgba(44,44,42,0.18)" strokeWidth="1.4" />
          <circle cx="-22" cy="8" r="6" fill="#e8a8a8" opacity="0.4" />
          <circle cx="22"  cy="8" r="6" fill="#e8a8a8" opacity="0.4" />

          {/* Face per pose */}
          {pose === 'gaze' ? (
            <g key="gaze" style={{ animation: 'ancla-face-in 0.35s ease both' }}>
              <circle cx="-12" cy="-11" r="3.2" fill="#2C2C2A" />
              <circle cx="12"  cy="-11" r="3.2" fill="#2C2C2A" />
              <circle cx="-10.5" cy="-12.5" r="1" fill="#FBF9F5" />
              <circle cx="13.5"  cy="-12.5" r="1" fill="#FBF9F5" />
              <path d="M -7 10 Q 0 14 7 10" stroke="#2C2C2A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            </g>
          ) : pose === 'breathe' ? (
            <g key="breathe" style={{ animation: 'ancla-face-in 0.35s ease both' }}>
              <path d="M -17 -5 Q -12 -1 -7 -5" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
              <path d="M 7 -5  Q 12 -1  17 -5" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
              <path d="M -7 10 Q 0 16 7 10" stroke="#2C2C2A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            </g>
          ) : (
            <g key="default" style={{ animation: 'ancla-face-in 0.35s ease both' }}>
              <circle cx="-12" cy="-5" r="3.2" fill="#2C2C2A" />
              <circle cx="12"  cy="-5" r="3.2" fill="#2C2C2A" />
              <circle cx="-10.5" cy="-6.5" r="1" fill="#FBF9F5" />
              <circle cx="13.5"  cy="-6.5" r="1" fill="#FBF9F5" />
              <path d="M -8 11 Q 0 16 8 11" stroke="#2C2C2A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            </g>
          )}
        </g>

        {/* 'breathe' pose — rising breath motes */}
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

function MethodPostural({ color, onExit }) {
  const [step, setStep] = useState(0);
  const last = step === POSTURAL_STEPS.length - 1;
  const cur = POSTURAL_STEPS[step];
  return (
    <CenteredFlow>
      <Counter current={step + 1} total={POSTURAL_STEPS.length} color={color} />
      <div style={{
        display: 'flex', alignItems: 'center', gap: 18,
        width: '100%', maxWidth: 600,
      }}>
        <PostureCharacter pose={cur.pose} color={color} size={170} />
        <SpeechBubble k={step}>
          <p style={bubbleEyebrow}>POSTURA {step + 1} DE {POSTURAL_STEPS.length}</p>
          <h2 style={bubbleTitle}>{cur.text}</h2>
        </SpeechBubble>
      </div>
      <LakeButton color={color} onClick={() => last ? onExit() : setStep(step + 1)}>{last ? 'Listo' : 'Siguiente'}</LakeButton>
    </CenteredFlow>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Etiquetado Emocional
// ─────────────────────────────────────────────────────────────────────────────
const EMOCIONES = ['Miedo', 'Vergüenza', 'Culpa', 'Asco', 'Enojo', 'Confusión', 'Tristeza', 'No sé'];

// Map each emotion label to a guide-face expression key.
const EMOTION_FACE = {
  'Miedo':     'miedo',
  'Vergüenza': 'verguenza',
  'Culpa':     'culpa',
  'Asco':      'asco',
  'Enojo':     'enojo',
  'Confusión': 'confusion',
  'Tristeza':  'tristeza',
  'No sé':     'nose',
};

function MethodEtiquetado({ color, onExit }) {
  const [picked, setPicked] = useState(null);
  if (picked) {
    return (
      <CenteredFlow>
        {/* Guide character with matching expression */}
        <div style={{
          position: 'relative',
          display: 'grid', placeItems: 'center',
          marginTop: 4, marginBottom: -4,
        }}>
          {/* soft halo behind character */}
          <div style={{
            position: 'absolute', inset: '-12% -22%',
            background: `radial-gradient(ellipse at center, ${color}28, ${color}10 50%, transparent 75%)`,
            filter: 'blur(22px)',
            pointerEvents: 'none',
          }} />
          <div key={picked} style={{ position: 'relative', animation: 'ancla-bubble-in 0.5s cubic-bezier(.34,1.56,.64,1) both' }}>
            <GuideCharacter expression={EMOTION_FACE[picked]} color={color} size={140} />
          </div>
        </div>

        <FadeKey k={picked} dur={0.6}>
          <p style={{ ...microStyle, color: 'var(--c-faint)' }}>Estás sintiendo</p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontSize: 'clamp(40px, 10vw, 64px)',
            lineHeight: 1.05,
            letterSpacing: '-0.018em',
            color: 'var(--c-text)',
            margin: '6px 0 0',
            textWrap: 'balance',
          }}>{picked}.</h2>
        </FadeKey>
        <p style={{ ...mutedTextStyle, maxWidth: 420 }}>
          Gracias. Ponerle nombre a lo que sientes puede ayudar a que tu cuerpo baje un poco la alarma.
        </p>
        <LakeButton color={color} onClick={onExit}>Continuar</LakeButton>
        <Btn variant="ghost" onClick={() => setPicked(null)}>Elegir otra</Btn>
      </CenteredFlow>
    );
  }
  return (
    <CenteredFlow>
      <FadeKey k="pick">
        <h2 style={titleStyle}>¿Qué nombre tiene lo que sientes ahora?</h2>
        <p style={mutedTextStyle}>Elige el que más se acerca. No tiene que ser exacto.</p>
      </FadeKey>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', maxWidth: 420,
      }}>
        {EMOCIONES.map((e) => (
          <button
            key={e}
            onClick={() => setPicked(e)}
            style={{
              padding: '18px 16px',
              borderRadius: 16,
              background: 'var(--c-card)',
              border: '1px solid var(--c-bdr)',
              color: 'var(--c-text)',
              fontFamily: 'var(--font-display)',
              fontSize: 19,
              transition: 'all .2s ease',
              minHeight: 64,
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {e}
          </button>
        ))}
      </div>
    </CenteredFlow>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Categorías Mentales
// ─────────────────────────────────────────────────────────────────────────────
const CATEGS = [
  { name: 'Comidas',         hint: 'Cinco platillos que te gusten.' },
  { name: 'Animales',        hint: 'Cinco animales que conozcas.' },
  { name: 'Colores',         hint: 'Cinco colores cualquiera.' },
  { name: 'Canciones',       hint: 'Cinco canciones que se te ocurran.' },
  { name: 'Lugares seguros', hint: 'Cinco lugares donde te sientes bien.' },
];

function MethodCategorias({ color, onExit }) {
  const [phase, setPhase] = useState('pick'); // pick | input | done
  const [cat, setCat] = useState(null);
  const [items, setItems] = useState(['', '', '', '', '']);
  const [i, setI] = useState(0);

  if (phase === 'pick') {
    return (
      <CenteredFlow>
        <FadeKey k="pick">
          <h2 style={titleStyle}>Elige una categoría.</h2>
          <p style={mutedTextStyle}>Le vamos a dar a tu mente una tarea simple.</p>
        </FadeKey>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 380 }}>
          {CATEGS.map((c) => (
            <button
              key={c.name}
              onClick={() => { setCat(c); setPhase('input'); }}
              style={categoryRowStyle}
              onMouseDown={(e) => e.currentTarget.style.background = 'rgba(44,44,42,0.04)'}
              onMouseUp={(e) => e.currentTarget.style.background = 'var(--c-card)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--c-card)'}
            >
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 19 }}>{c.name}</span>
              <span style={{ color: 'var(--c-faint)', fontSize: 13 }}>→</span>
            </button>
          ))}
        </div>
      </CenteredFlow>
    );
  }

  if (phase === 'input') {
    const last = i === 4;
    return (
      <CenteredFlow>
        <Counter current={i + 1} total={5} color={color} />
        <FadeKey k={i}>
          <h2 style={titleStyle}>{cat.name} #{i + 1}</h2>
          <p style={mutedTextStyle}>{cat.hint}</p>
        </FadeKey>
        <input
          type="text"
          autoFocus
          value={items[i]}
          onChange={(e) => {
            const next = [...items]; next[i] = e.target.value; setItems(next);
          }}
          placeholder="Escribe lo primero que te venga"
          style={{ maxWidth: 380 }}
        />
        <LakeButton color={color} disabled={!items[i].trim()} onClick={() => last ? setPhase('done') : setI(i + 1)}>
          {last ? 'Terminar' : 'Siguiente'}
        </LakeButton>
      </CenteredFlow>
    );
  }

  // done
  return (
    <CenteredFlow>
      <FadeKey k="done"><h2 style={titleStyle}>Tu mente acaba de volver un poco al presente.</h2></FadeKey>
      <p style={mutedTextStyle}>Estuvo ocupada con algo concreto. Eso suele bastar para bajar la intensidad.</p>
      <LakeButton color={color} onClick={onExit}>Volver al catálogo</LakeButton>
      <Btn variant="ghost" onClick={() => {
        setItems(['', '', '', '', '']);
        setI(0);
        setCat(null);
        setPhase('pick');
      }}>Elegir otra categoría</Btn>
    </CenteredFlow>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Conteo Hacia Atrás
// ─────────────────────────────────────────────────────────────────────────────
function MethodConteo({ color, onExit }) {
  const [n, setN] = useState(20);
  const [paused, setPaused] = useState(false);
  const STEP_MS = 2000;

  useEffect(() => {
    if (n === 0 || paused) return;
    const t = setTimeout(() => setN((x) => x - 1), STEP_MS);
    return () => clearTimeout(t);
  }, [n, paused]);

  if (n === 0) {
    return (
      <CenteredFlow>
        <FadeKey k="done"><h2 style={titleStyle}>Llegaste.</h2></FadeKey>
        <p style={mutedTextStyle}>Tu mente estuvo enfocada en algo concreto.</p>
        <Btn onClick={onExit}>Volver al catálogo</Btn>
      </CenteredFlow>
    );
  }
  return (
    <CenteredFlow>
      <Counter current={20 - n + 1} total={20} color={color} />
      <FadeKey k={n}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(72px, 24vw, 132px)',
          fontWeight: 300,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          color: 'var(--c-text)',
        }}>{n}</div>
      </FadeKey>

      {/* Timer bar — fills over STEP_MS for each number */}
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ height: 2, background: 'rgba(44,44,42,0.08)', borderRadius: 2, overflow: 'hidden' }}>
          <div
            key={`bar-${n}-${paused}`}
            style={{
              height: '100%', background: color, transformOrigin: 'left center',
              animation: paused ? 'none' : `ancla-bar ${STEP_MS}ms linear forwards`,
            }}
          />
        </div>
      </div>

      <Btn variant="ghost" onClick={() => setPaused(!paused)}>
        {paused ? 'Reanudar' : 'Pausar'}
      </Btn>
      <Btn variant="quiet" onClick={onExit}>Esto no me ayuda</Btn>
    </CenteredFlow>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Frases de Anclaje
// ─────────────────────────────────────────────────────────────────────────────
const FRASES = [
  'Estoy aquí.',
  'Este es el presente.',
  'Mis pies están tocando el piso.',
  'Estoy respirando.',
  'Ahora puedo ir paso a paso.',
];

// AuraPhrase — phrase displayed inside a soft breathing aura with floating motes.
// Reserves a fixed-height area so subsequent controls don't shift between phrases.
// Used by Frases / Texturas / Olores so they share the same calm presentation.
function AuraPhrase({ color, k, eyebrow, title, body, italic = false }) {
  return (
    <div style={{
      position: 'relative',
      width: '100%', maxWidth: 540,
      minHeight: 'clamp(220px, 32vh, 280px)',
      padding: '24px',
      margin: '8px 0 32px',
      display: 'grid', placeItems: 'center',
    }}>
      {/* Soft, slowly breathing aura behind the phrase */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse 70% 55% at center, ${color}28, ${color}10 45%, transparent 72%)`,
          filter: 'blur(28px)',
          animation: 'ancla-frase-aura 7s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      {/* Tiny accent motes */}
      <span aria-hidden="true" style={{
        position: 'absolute', left: '12%', top: '34%',
        width: 4, height: 4, borderRadius: '50%', background: color,
        boxShadow: `0 0 12px ${color}, 0 0 24px ${color}55`,
        animation: 'ancla-frase-mote 5s ease-in-out infinite',
      }} />
      <span aria-hidden="true" style={{
        position: 'absolute', right: '14%', bottom: '30%',
        width: 5, height: 5, borderRadius: '50%', background: '#fff',
        boxShadow: `0 0 14px ${color}cc, 0 0 28px ${color}66`,
        animation: 'ancla-frase-mote 6s ease-in-out infinite',
        animationDelay: '-2s',
      }} />

      <FadeKey k={k} dur={0.75}>
        <div style={{ textAlign: 'center', position: 'relative' }}>
          {eyebrow && (
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'var(--c-faint)',
              margin: '0 0 14px', fontWeight: 500,
            }}>{eyebrow}</p>
          )}
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontStyle: italic ? 'italic' : 'normal',
            fontSize: 'clamp(28px, 6vw, 44px)',
            lineHeight: 1.3,
            letterSpacing: '0.018em',
            color: 'var(--c-text)',
            margin: 0,
            textWrap: 'balance',
          }}>{title}</h2>
          {body && (
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 15.5, lineHeight: 1.6,
              color: 'var(--c-body)',
              margin: '14px auto 0', maxWidth: 420,
            }}>{body}</p>
          )}
        </div>
      </FadeKey>
    </div>
  );
}

function MethodFrases({ color, onExit }) {
  const [i, setI] = useState(0);
  const last = i === FRASES.length - 1;
  return (
    <CenteredFlow>
      <Counter current={i + 1} total={FRASES.length} color={color} />
      <AuraPhrase
        color={color}
        k={i}
        italic
        title={FRASES[i]}
      />
      <LakeButton color={color} onClick={() => last ? onExit() : setI(i + 1)}>
        {last ? 'Terminar' : 'Siguiente frase'}
      </LakeButton>
    </CenteredFlow>
  );
}

// LakeButton — primary button with calm water-like ambient + click ripples.
// Color and shape stay within the existing design (same pill button as Btn).
function LakeButton({ color, onClick, children, disabled }) {
  const [pulses, setPulses] = useState([]);
  const handleClick = (e) => {
    if (disabled) return;
    const id = Date.now() + Math.random();
    setPulses((p) => [...p, id]);
    setTimeout(() => setPulses((p) => p.filter((x) => x !== id)), 1300);
    if (onClick) onClick(e);
  };
  return (
    <div style={{
      position: 'relative',
      width: '100%', maxWidth: 360,
      isolation: 'isolate',
    }}>
      {/* Ambient ripples — hide when disabled */}
      {!disabled && (
        <>
          <span aria-hidden="true" style={{
            position: 'absolute', inset: 0, borderRadius: 999,
            border: `1px solid ${color}55`,
            animation: 'ancla-lake-ambient 5s ease-out infinite',
            pointerEvents: 'none',
            zIndex: 0,
          }} />
          <span aria-hidden="true" style={{
            position: 'absolute', inset: 0, borderRadius: 999,
            border: `1px solid ${color}33`,
            animation: 'ancla-lake-ambient 5s ease-out infinite',
            animationDelay: '-2.5s',
            pointerEvents: 'none',
            zIndex: 0,
          }} />
        </>
      )}

      {/* Click pulses */}
      {pulses.map((id) => (
        <span key={id} aria-hidden="true" style={{
          position: 'absolute', inset: 0, borderRadius: 999,
          border: `1.5px solid ${color}`,
          animation: 'ancla-lake-click 1.3s cubic-bezier(.4,0,.2,1) forwards',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
      ))}

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Btn onClick={handleClick} disabled={disabled}>{children}</Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. 5-4-3-2-1 + Abrazo de Mariposa
// ─────────────────────────────────────────────────────────────────────────────
const G_STEPS = [
  { count: 5, sense: 'ves',       label: '5 cosas que ves', hint: 'Mira a tu alrededor. Nombra lo que ves.' },
  { count: 4, sense: 'escuchas',  label: '4 sonidos',       hint: 'Detente. ¿Qué se escucha cerca o lejos?' },
  { count: 3, sense: 'tocas',     label: '3 texturas',      hint: 'Toca lo que tengas cerca. Nota la textura.' },
  { count: 2, sense: 'hueles',    label: '2 olores',        hint: 'Inhala. ¿Hay algún olor?' },
  { count: 1, sense: 'saboreas',  label: '1 sabor',         hint: 'Pasa la lengua por tus dientes. ¿Algún sabor?' },
];

// Navegante prompts — one gentle line per item so users see something different each time.
const NAV_PROMPTS = {
  ves:       ['Mira a tu alrededor.', 'Recorre el espacio con la mirada.', 'Algo más lejos…', 'Algo cerca de ti…', 'Una última cosa que tus ojos encuentren.'],
  escuchas:  ['Detente. Escucha.', 'Un sonido un poco más lejos.', 'Algo más sutil, casi de fondo.', 'Un último sonido.'],
  tocas:     ['Toca lo que tengas cerca.', 'Otra textura, distinta.', 'Una última. Sin prisa.'],
  hueles:    ['Inhala despacio.', 'Otro olor. Puede ser sutil.'],
  saboreas:  ['Pasa la lengua por tus dientes.'],
};

// Map each sense to a guide-character expression.
const SENSE_FACE = {
  ves: 'curious',
  escuchas: 'listening',
  tocas: 'touchy',
  hueles: 'sniff',
  saboreas: 'taste',
};

function Method54321({ color, onExit }) {
  const [phase, setPhase] = useState('modePick'); // modePick | grounding | navegante | butterfly | checkin
  const [step, setStep] = useState(0);
  const [subStep, setSubStep] = useState(0); // index within current step (navegante mode)
  const [vals, setVals] = useState(() => G_STEPS.map((s) => Array(s.count).fill('')));

  // ── Mode picker ──────────────────────────────────────────────────────────
  if (phase === 'modePick') {
    return (
      <CenteredFlow>
        <GuideScene expression="hello" color={color} bubbleKey="mode">
          <p style={bubbleEyebrow}>HOLA</p>
          <h2 style={bubbleTitle}>¿Cómo te gustaría hacerlo?</h2>
          <p style={bubbleBody}>
            Dos formas de llegar al mismo lugar. Elige la que se sienta mejor ahora.
          </p>
        </GuideScene>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 480 }}>
          <ModeCard
            color={color}
            title="Modo escrito"
            desc="A algunas personas las calma escribir. Vas a teclear cada cosa que percibas."
            onClick={() => setPhase('grounding')}
          />
          <ModeCard
            color={color}
            title="Modo navegante"
            desc="A veces no hay ganas de escribir. Yo te guío. Solo piensa en cada cosa y respira."
            onClick={() => setPhase('navegante')}
          />
        </div>
        <Btn variant="quiet" onClick={onExit}>Elegir otro método</Btn>
      </CenteredFlow>
    );
  }

  // ── Modo navegante ───────────────────────────────────────────────────────
  // Auto-paced flow: each item gets ITEM_MS to think; between sense categories
  // there's a transition card the user dismisses themselves.
  if (phase === 'navegante') {
    const ITEM_MS = 7000;
    return (
      <NaveganteFlow
        color={color}
        itemMs={ITEM_MS}
        onDone={() => setPhase('butterfly')}
        onExit={onExit}
      />
    );
  }

  if (phase === 'grounding') {
    const s = G_STEPS[step];
    const last = step === G_STEPS.length - 1;
    const allFilled = vals[step].every((v) => v.trim().length > 0);
    return (
      <CenteredFlow>
        <Counter current={step + 1} total={5} color={color} />
        <GuideScene expression={SENSE_FACE[s.sense]} color={color} bubbleKey={step}>
          <p style={bubbleEyebrow}>{s.label.toUpperCase()}</p>
          <h2 style={bubbleTitle}>{s.hint}</h2>
        </GuideScene>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 420 }}>
          {vals[step].map((v, idx) => (
            <input
              key={idx}
              type="text"
              autoFocus={idx === 0}
              value={v}
              onChange={(e) => {
                const next = vals.map((arr) => [...arr]);
                next[step][idx] = e.target.value;
                setVals(next);
              }}
              placeholder={`Algo que ${s.sense}…`}
            />
          ))}
        </div>
        <Btn disabled={!allFilled} onClick={() => last ? setPhase('butterfly') : setStep(step + 1)}>
          {last ? 'Continuar al abrazo' : 'Siguiente'}
        </Btn>
      </CenteredFlow>
    );
  }

  if (phase === 'butterfly') {
    return <ButterflyTimer color={color} onDone={() => setPhase('checkin')} onExit={onExit} />;
  }

  return (
    <CenteredFlow>
      <FadeKey k="done"><h2 style={titleStyle}>Estás aquí, en este momento.</h2></FadeKey>
      <p style={mutedTextStyle}>Tu cuerpo acaba de pasar un minuto entero ocupado en el presente.</p>
      <Btn onClick={onExit}>Volver al catálogo</Btn>
    </CenteredFlow>
  );
}

// NaveganteFlow — timer-driven 5-4-3-2-1. Each item auto-advances after itemMs;
// between sense categories the user gets a transition card to breathe and continue.
function NaveganteFlow({ color, itemMs = 7000, onDone, onExit }) {
  // sub-phase: 'item' (timer running) | 'transition' (between sense categories)
  const [step, setStep] = useState(0);
  const [subStep, setSubStep] = useState(0);
  const [mode, setMode] = useState('item');
  const [paused, setPaused] = useState(false);
  // tick is just for re-rendering remaining ms inside item; visual bar is CSS-driven.
  const startedAt = useRef(Date.now());

  const s = G_STEPS[step];

  // Auto-advance timer per item
  useEffect(() => {
    if (mode !== 'item' || paused) return;
    startedAt.current = Date.now();
    const t = setTimeout(() => advance(), itemMs);
    return () => clearTimeout(t);
  }, [mode, step, subStep, paused, itemMs]);

  const advance = () => {
    const lastSub = subStep === s.count - 1;
    const lastStep = step === G_STEPS.length - 1;
    if (!lastSub) { setSubStep(subStep + 1); return; }
    if (lastStep) { onDone(); return; }
    setMode('transition');
  };

  const continueAfterTransition = () => {
    setStep(step + 1);
    setSubStep(0);
    setMode('item');
  };

  // ── Transition card ────────────────────────────────────────────────────
  if (mode === 'transition') {
    const nextSense = G_STEPS[step + 1];
    return (
      <CenteredFlow>
        <GuideScene expression="happy" color={color} bubbleKey={`tx-${step}`}>
          <p style={{ ...bubbleEyebrow, color }}>{s.label.toUpperCase()} · LISTO</p>
          <h2 style={bubbleTitle}>¡Bien hecho! Sigue respirando.</h2>
          <p style={bubbleBody}>
            Ahora vamos a {sensePhrase(nextSense.sense)}.
            Cuando estés listo/a, continúa.
          </p>
        </GuideScene>
        <Btn onClick={continueAfterTransition}>{nextSense.label} →</Btn>
        <Btn variant="quiet" onClick={onExit}>Detener</Btn>
      </CenteredFlow>
    );
  }

  // ── Item card ──────────────────────────────────────────────────────────
  const prompts = NAV_PROMPTS[s.sense] || [];
  const prompt = prompts[subStep] || s.hint;

  return (
    <CenteredFlow>
      <Counter current={step + 1} total={5} color={color} />
      <GuideScene expression={SENSE_FACE[s.sense]} color={color} bubbleKey={`${step}-${subStep}`}>
        <p style={bubbleEyebrow}>
          {s.label.toUpperCase()} · {subStep + 1} DE {s.count}
        </p>
        <h2 style={bubbleTitle}>{prompt}</h2>
      </GuideScene>

      {/* Dots */}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        {Array.from({ length: s.count }).map((_, i) => (
          <span key={i} style={{
            width: i === subStep ? 22 : 6, height: 6, borderRadius: 3,
            background: i <= subStep ? color : 'rgba(44,44,42,0.12)',
            transition: 'width 0.4s cubic-bezier(.4,0,.2,1), background 0.3s ease',
          }} />
        ))}
      </div>

      {/* Timer bar */}
      <div style={{ width: '100%', maxWidth: 420, marginTop: 6 }}>
        <div style={{
          height: 2, background: 'rgba(44,44,42,0.08)', borderRadius: 2, overflow: 'hidden',
        }}>
          <div
            key={`${step}-${subStep}-${paused}`}
            style={{
              height: '100%', background: color,
              transformOrigin: 'left center',
              animation: paused ? 'none' : `ancla-bar ${itemMs}ms linear forwards`,
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 420 }}>
        <Btn variant="ghost" onClick={() => setPaused(!paused)}>
          {paused ? 'Reanudar' : 'Pausar'}
        </Btn>
        <Btn variant="ghost" onClick={advance}>
          Siguiente →
        </Btn>
      </div>
      <Btn variant="quiet" onClick={onExit}>Detener</Btn>
    </CenteredFlow>
  );
}

function sensePhrase(sense) {
  switch (sense) {
    case 'ves':       return 'lo que ves';
    case 'escuchas':  return 'lo que escuchas';
    case 'tocas':     return 'lo que puedes tocar';
    case 'hueles':    return 'los olores cercanos';
    case 'saboreas':  return 'el sabor en tu boca';
    default:          return sense;
  }
}

// ModeCard — large, calm picker tile used by 5-4-3-2-1's mode selector.
function ModeCard({ color, title, desc, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8,
        padding: '20px 22px',
        borderRadius: 18,
        background: 'var(--c-card)',
        border: `1px solid ${hover ? color + '88' : 'var(--c-bdr)'}`,
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'border-color .2s ease, transform .25s cubic-bezier(.4,0,.2,1), box-shadow .25s ease',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hover
          ? `0 10px 26px ${color}22, 0 1px 3px rgba(44,44,42,0.04)`
          : '0 1px 3px rgba(44,44,42,0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%', background: color,
          boxShadow: `0 0 0 3px ${color}22`,
        }} />
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400,
          letterSpacing: '-0.012em', color: 'var(--c-text)',
        }}>{title}</span>
      </div>
      <span style={{
        fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.5,
        color: 'var(--c-body)',
      }}>{desc}</span>
    </button>
  );
}

// ButterflySlot — one of the two tap-side indicators in the abrazo de mariposa.
// Inactive = small soft pebble; Active = full butterfly with flapping wings + halo.
function ButterflySlot({ active, color }) {
  return (
    <div style={{
      position: 'relative',
      width: 84, height: 84,
      display: 'grid', placeItems: 'center',
    }}>
      {/* Halo behind active butterfly */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: `radial-gradient(circle, ${color}55, ${color}00 65%)`,
        transform: active ? 'scale(1)' : 'scale(0.4)',
        opacity: active ? 1 : 0,
        transition: 'all 0.4s cubic-bezier(.4,0,.2,1)',
        filter: 'blur(2px)',
      }} />

      {/* Inactive: dim pebble. Active: hidden by butterfly. */}
      <div style={{
        position: 'absolute',
        width: 16, height: 16, borderRadius: '50%',
        background: active ? 'transparent' : 'rgba(44,44,42,0.10)',
        transform: active ? 'scale(0.4)' : 'scale(1)',
        opacity: active ? 0 : 1,
        transition: 'all 0.35s cubic-bezier(.4,0,.2,1)',
      }} />

      {/* Active: butterfly with flapping wings, pops in */}
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

function Butterfly({ color, size = 64, flapping = true, sideOffset = 0 }) {
  // viewBox 80x60; body centered at x=40. Wings flap by horizontal-scaling.
  return (
    <svg
      viewBox="0 0 80 60"
      width={size} height={size * 0.75}
      style={{
        overflow: 'visible',
        animation: flapping ? `ancla-bfly-float 1.4s ease-in-out infinite` : 'none',
      }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`bfly-wing-${color}`} cx="40%" cy="40%" r="60%">
          <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="40%"  stopColor={color} stopOpacity="0.92" />
          <stop offset="100%" stopColor={color} stopOpacity="0.98" />
        </radialGradient>
      </defs>

      {/* LEFT WINGS — group flips around the body axis (x=40) */}
      <g style={{
        transformOrigin: '40px 30px',
        animation: flapping ? 'ancla-bfly-flap-l 0.55s ease-in-out infinite' : 'none',
      }}>
        {/* upper-left wing — teardrop curve */}
        <path
          d="M 38 22
             C 22 4, 4 8, 8 22
             C 6 30, 18 32, 38 30 Z"
          fill={`url(#bfly-wing-${color})`}
          stroke={color}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {/* lower-left wing */}
        <path
          d="M 38 32
             C 22 38, 12 50, 22 54
             C 30 56, 36 48, 38 40 Z"
          fill={`url(#bfly-wing-${color})`}
          stroke={color}
          strokeWidth="1.2"
          strokeLinejoin="round"
          opacity="0.92"
        />
        {/* wing dot accent */}
        <circle cx="18" cy="18" r="2" fill="#FBF9F5" opacity="0.85" />
      </g>

      {/* RIGHT WINGS — mirrored */}
      <g style={{
        transformOrigin: '40px 30px',
        animation: flapping ? 'ancla-bfly-flap-r 0.55s ease-in-out infinite' : 'none',
      }}>
        <path
          d="M 42 22
             C 58 4, 76 8, 72 22
             C 74 30, 62 32, 42 30 Z"
          fill={`url(#bfly-wing-${color})`}
          stroke={color}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M 42 32
             C 58 38, 68 50, 58 54
             C 50 56, 44 48, 42 40 Z"
          fill={`url(#bfly-wing-${color})`}
          stroke={color}
          strokeWidth="1.2"
          strokeLinejoin="round"
          opacity="0.92"
        />
        <circle cx="62" cy="18" r="2" fill="#FBF9F5" opacity="0.85" />
      </g>

      {/* BODY — thin tapered line */}
      <path d="M 40 12 Q 41.5 30 40 50 Q 38.5 30 40 12 Z" fill="#2C2C2A" />
      {/* head */}
      <circle cx="40" cy="12" r="3" fill="#2C2C2A" />
      {/* antennae */}
      <path d="M 40 11 Q 36 4 33 1" stroke="#2C2C2A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M 40 11 Q 44 4 47 1" stroke="#2C2C2A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <circle cx="33" cy="1" r="1.4" fill="#2C2C2A" />
      <circle cx="47" cy="1" r="1.4" fill="#2C2C2A" />
    </svg>
  );
}

function ButterflyTimer({ color, onDone, onExit }) {
  const [secs, setSecs] = useState(60);
  const [side, setSide] = useState(0); // 0 left, 1 right
  useEffect(() => {
    if (secs === 0) { onDone(); return; }
    const t = setTimeout(() => setSecs(secs - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);
  useEffect(() => {
    const i = setInterval(() => { setSide((s) => 1 - s); buzz(35); }, 700);
    return () => clearInterval(i);
  }, []);

  return (
    <CenteredFlow>
      <FadeKey k="bf">
        <h2 style={titleStyle}>Abrazo de mariposa.</h2>
        <p style={mutedTextStyle}>
          Cruza los brazos sobre el pecho. Da golpecitos suaves y alternados en cada hombro,
          siguiendo el ritmo.
        </p>
      </FadeKey>
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 56,
        height: 110, marginTop: 4,
      }}>
        <ButterflySlot active={side === 0} color={color} />
        <ButterflySlot active={side === 1} color={color} />
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 14, letterSpacing: '0.1em',
        color: 'var(--c-faint)',
      }}>
        {String(Math.floor(secs / 60)).padStart(1, '0')}:{String(secs % 60).padStart(2, '0')}
      </div>
      <Btn variant="quiet" onClick={onExit}>Detener</Btn>
    </CenteredFlow>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. Texturas de Anclaje
// ─────────────────────────────────────────────────────────────────────────────
const TEXT_STEPS = [
  'Busca un objeto cerca de ti. Cualquiera.',
  'Tómalo entre tus manos.',
  'Recorre su superficie con los dedos.',
  'Nota su temperatura y su peso.',
];
const TEXT_TAGS = ['Frío', 'Tibio', 'Suave', 'Duro', 'Áspero', 'Liso', 'Pesado', 'Ligero'];

// Encouraging message anchored to each selectable texture.
// Drawn from the documentation's clinical-warm tone.
const TEXT_TAG_MESSAGES = {
  'Frío':   'La temperatura te despertó los sentidos. Tu cuerpo está aquí, registrando algo real.',
  'Tibio':  'Algo cálido y constante. Como un recordatorio suave de que sigues siendo.',
  'Suave':  'Algo amable al tacto. También mereces lo amable.',
  'Duro':   'Lo firme también es seguro. Algo no se mueve, y tú no tienes que moverte ahora.',
  'Áspero': 'Las texturas claras le dan al cuerpo algo concreto donde apoyarse.',
  'Liso':   'Continuo, predecible. Tu respiración puede volverse así también.',
  'Pesado': 'El peso te ancla. Tu cuerpo siente la gravedad. Eso significa que estás aquí.',
  'Ligero': 'Lo ligero también puede sostenerse. Como tú, aunque no siempre lo sientas.',
};

function MethodTexturas({ color, onExit }) {
  const [phase, setPhase] = useState('steps'); // steps | tags | done
  const [step, setStep] = useState(0);
  const [tags, setTags] = useState([]);

  if (phase === 'steps') {
    const last = step === TEXT_STEPS.length - 1;
    return (
      <CenteredFlow>
        <Counter current={step + 1} total={TEXT_STEPS.length} color={color} />
        <AuraPhrase
          color={color}
          k={step}
          eyebrow={`Paso ${step + 1} de ${TEXT_STEPS.length}`}
          title={TEXT_STEPS[step]}
        />
        <LakeButton color={color} onClick={() => last ? setPhase('tags') : setStep(step + 1)}>
          {last ? 'Continuar' : 'Siguiente'}
        </LakeButton>
      </CenteredFlow>
    );
  }

  if (phase === 'tags') {
    return (
      <CenteredFlow>
        <AuraPhrase
          color={color}
          k="tags"
          title="¿Cómo se siente?"
          body="Marca las que apliquen. Puedes elegir varias."
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 420, marginTop: -16, marginBottom: 8 }}>
          {TEXT_TAGS.map((t) => {
            const on = tags.includes(t);
            return (
              <button
                key={t}
                onClick={() => setTags(on ? tags.filter((x) => x !== t) : [...tags, t])}
                style={{
                  padding: '10px 16px',
                  borderRadius: 999,
                  background: on ? color : 'var(--c-card)',
                  border: `1px solid ${on ? color : 'var(--c-bdr)'}`,
                  color: on ? '#F5F2EE' : 'var(--c-text)',
                  fontSize: 14, fontWeight: 500,
                  transition: 'all .2s ease',
                  boxShadow: on ? `0 4px 16px ${color}55` : 'none',
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
        <LakeButton color={color} onClick={() => setPhase('done')}>Continuar</LakeButton>
      </CenteredFlow>
    );
  }

  // Build the closing message based on selected tags.
  // 0 tags  → generic fallback; 1 tag → its specific message; ≥2 → join two with a connector.
  const closingBody = (() => {
    if (tags.length === 0) {
      return 'Tu cuerpo registró algo concreto: forma, temperatura, peso.';
    }
    if (tags.length === 1) {
      return TEXT_TAG_MESSAGES[tags[0]];
    }
    const first = TEXT_TAG_MESSAGES[tags[0]];
    const second = TEXT_TAG_MESSAGES[tags[1]];
    return first + ' ' + second;
  })();

  return (
    <CenteredFlow>
      <AuraPhrase
        color={color}
        k="done"
        title="Sigues aquí."
        body={closingBody}
      />
      <LakeButton color={color} onClick={onExit}>Volver al catálogo</LakeButton>
    </CenteredFlow>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. Olores de Anclaje
// ─────────────────────────────────────────────────────────────────────────────
const SUGER = ['Café', 'Jabón', 'Crema', 'Ropa limpia', 'Cáscara de naranja', 'Champú'];
const OLOR_STEPS = [
  'Acerca el objeto a tu nariz.',
  'Inhala despacio.',
  'Nota si es dulce, amargo, fresco, intenso.',
  'Repite una vez más, sin prisa.',
];

function MethodOlores({ color, onExit, onGoToFase }) {
  const [phase, setPhase] = useState('intro'); // intro | steps | done | fallback
  const [step, setStep] = useState(0);

  if (phase === 'intro') {
    return (
      <CenteredFlow>
        <AuraPhrase
          color={color}
          k="intro"
          title="¿Tienes algún olor familiar cerca?"
          body="Algunas sugerencias para inspirarte."
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 420, marginTop: -16, marginBottom: 8 }}>
          {SUGER.map((s) => (
            <span key={s} style={{
              padding: '8px 14px', borderRadius: 999,
              background: 'var(--c-card)', border: '1px solid var(--c-bdr)',
              color: 'var(--c-muted)', fontSize: 13,
            }}>{s}</span>
          ))}
        </div>
        <LakeButton color={color} onClick={() => setPhase('steps')}>Ya lo tengo</LakeButton>
        <Btn variant="ghost" onClick={() => setPhase('fallback')}>No tengo nada cerca</Btn>
      </CenteredFlow>
    );
  }

  if (phase === 'steps') {
    const last = step === OLOR_STEPS.length - 1;
    return (
      <CenteredFlow>
        <Counter current={step + 1} total={OLOR_STEPS.length} color={color} />
        <AuraPhrase
          color={color}
          k={step}
          eyebrow={`Paso ${step + 1} de ${OLOR_STEPS.length}`}
          title={OLOR_STEPS[step]}
        />
        <LakeButton color={color} onClick={() => last ? setPhase('done') : setStep(step + 1)}>
          {last ? 'Terminar' : 'Siguiente'}
        </LakeButton>
      </CenteredFlow>
    );
  }

  if (phase === 'fallback') {
    return (
      <CenteredFlow>
        <AuraPhrase
          color={color}
          k="fb"
          title="Está bien. Hay otras formas."
          body="Probemos uno que solo necesita tu cuerpo y tu atención."
        />
        <LakeButton color={color} onClick={() => onGoToFase('11')}>Texturas de anclaje</LakeButton>
        <Btn variant="ghost" onClick={() => onGoToFase('10')}>Frases de anclaje</Btn>
        <Btn variant="quiet" onClick={onExit}>Volver al catálogo</Btn>
      </CenteredFlow>
    );
  }

  return (
    <CenteredFlow>
      <AuraPhrase
        color={color}
        k="done"
        title="Estás aquí."
        body="Un olor familiar le recuerda al cerebro dónde está."
      />
      <LakeButton color={color} onClick={onExit}>Volver al catálogo</LakeButton>
    </CenteredFlow>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. Tapping EFT
// ─────────────────────────────────────────────────────────────────────────────
const TAP_POINTS = [
  { id: 'ceja',     label: 'Ceja',         cx: 50, cy: 32, frase: 'Aunque sienta esto, estoy aquí.' },
  { id: 'lado-ojo', label: 'Lado del ojo', cx: 66, cy: 34, frase: 'Aunque sienta esto, sigo a salvo ahora.' },
  { id: 'nariz',    label: 'Bajo la nariz',cx: 50, cy: 46, frase: 'Aunque sienta esto, no es mi culpa.' },
  { id: 'clavicula',label: 'Clavícula',    cx: 50, cy: 70, frase: 'Aunque sienta esto, mi cuerpo puede calmarse.' },
];

function MethodTapping({ color, onExit }) {
  const [phase, setPhase] = useState('tapping'); // tapping | psychoed
  const [i, setI] = useState(0);
  const [round, setRound] = useState(0);
  const rounds = 2;

  if (phase === 'psychoed') {
    return (
      <CenteredFlow>
        <FadeKey k="ed"><h2 style={titleStyle}>Hiciste dos rondas.</h2></FadeKey>
        <p style={{ ...mutedTextStyle, maxWidth: 420 }}>
          Tocar estos puntos mientras nombras lo que sientes ayuda a separar la emoción del recuerdo.
          Lo que pasó no es tu culpa. Lo que sientes hoy puede bajar de intensidad con la práctica.
        </p>
        <Btn onClick={onExit}>Volver al catálogo</Btn>
      </CenteredFlow>
    );
  }

  const p = TAP_POINTS[i];

  const next = () => {
    if (i < TAP_POINTS.length - 1) setI(i + 1);
    else if (round < rounds - 1) { setRound(round + 1); setI(0); }
    else setPhase('psychoed');
  };

  return (
    <CenteredFlow>
      <Counter current={round + 1} total={rounds} color={color} />
      <svg viewBox="0 0 100 100" width={200} height={200} style={{ overflow: 'visible' }}>
        {/* head silhouette */}
        <ellipse cx="50" cy="38" rx="22" ry="26" fill="var(--c-card)" stroke="var(--c-bdr)" strokeWidth="0.6" />
        {/* shoulders */}
        <path d="M 18 78 Q 50 60 82 78 L 82 95 L 18 95 Z" fill="var(--c-card)" stroke="var(--c-bdr)" strokeWidth="0.6" />
        {/* all points */}
        {TAP_POINTS.map((pt) => {
          const active = pt.id === p.id;
          return (
            <g key={pt.id}>
              <circle
                cx={pt.cx} cy={pt.cy} r={active ? 4 : 2}
                fill={active ? color : '#8B8780'}
                opacity={active ? 1 : 0.5}
                style={{ transition: 'all .4s ease' }}
              />
              {active && (
                <circle
                  cx={pt.cx} cy={pt.cy} r="7"
                  fill="none" stroke={color} strokeWidth="0.7"
                  opacity="0.5"
                >
                  <animate attributeName="r" values="4;9;4" dur="1.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0.05;0.5" dur="1.6s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          );
        })}
      </svg>
      <FadeKey k={`${round}-${i}`}>
        <p style={{ ...microStyle, color: 'var(--c-faint)' }}>{p.label}</p>
        <p style={{ ...instructionStyle, fontStyle: 'italic', maxWidth: 360 }}>{p.frase}</p>
      </FadeKey>
      <Btn variant="quiet" onClick={onExit}>Detener</Btn>
      <LakeButton color={color} onClick={next}>Toqué este punto · siguiente</LakeButton>
    </CenteredFlow>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. Pesca de Frases — pull kind phrases out of the water, one fish at a time
// Same emotional function as Tapping (reframe / process), but warmer + playful.
// ─────────────────────────────────────────────────────────────────────────────
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

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Simple side-view fish. Wags its tail when idle.
function Fish({ color, size = 56, jumping = false }) {
  return (
    <svg viewBox="-14 0 80 40" width={size} height={size * 0.5} style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`fish-${color}`} cx="60%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="50%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0.92" />
        </radialGradient>
      </defs>
      {/* tail — wags */}
      <g style={{
        transformOrigin: '8px 20px',
        animation: jumping ? 'none' : 'ancla-fish-wag 0.65s ease-in-out infinite',
      }}>
        <path d="M 8 20 L -8 8 L -2 20 L -8 32 Z" fill={color} opacity="0.92" />
      </g>
      {/* body */}
      <path d="M 8 20 Q 22 4 40 6 Q 56 8 58 20 Q 56 32 40 34 Q 22 36 8 20 Z"
            fill={`url(#fish-${color})`} stroke="rgba(44,44,42,0.22)" strokeWidth="1" />
      {/* belly highlight */}
      <path d="M 14 24 Q 30 32 50 26" stroke="rgba(255,255,255,0.4)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      {/* eye */}
      <circle cx="48" cy="16" r="2.6" fill="#FBF9F5" />
      <circle cx="48" cy="16" r="1.6" fill="#2C2C2A" />
      {/* gill */}
      <path d="M 36 12 Q 38 20 36 28" stroke="rgba(44,44,42,0.28)" strokeWidth="1" fill="none" />
      {/* fin */}
      <path d="M 26 8 Q 30 2 34 8 Z" fill={color} opacity="0.85" />
    </svg>
  );
}

// Small fishing-character: head + shoulders + rod, sized to sit on a "pier".
function FishingCharacter({ color, size = 110, casting = false }) {
  return (
    <div style={{
      position: 'relative', width: size, height: size * 1.05, flex: '0 0 auto',
      animation: 'ancla-guide-bob 4s ease-in-out infinite',
    }}>
      <svg viewBox="-60 -62 120 130" width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="pesca-head" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#FBF9F5" />
            <stop offset="100%" stopColor="#EDE7DC" />
          </radialGradient>
        </defs>
        {/* head */}
        <ellipse cx="0" cy="0" rx="40" ry="44" fill="url(#pesca-head)" stroke="rgba(44,44,42,0.18)" strokeWidth="1.4" />
        {/* hat — small fisher cap accent */}
        <path d="M -34 -28 Q 0 -56 36 -28 L 34 -22 Q 0 -36 -34 -22 Z" fill={color} opacity="0.85" />
        <ellipse cx="0" cy="-28" rx="40" ry="6" fill={color} opacity="0.6" />
        {/* cheeks */}
        <circle cx="-22" cy="6" r="6" fill="#e8a8a8" opacity="0.4" />
        <circle cx="22"  cy="6" r="6" fill="#e8a8a8" opacity="0.4" />
        {/* eyes — focused, looking down toward water */}
        <circle cx="-12" cy="-2" r="3" fill="#2C2C2A" />
        <circle cx="12"  cy="-2" r="3" fill="#2C2C2A" />
        <circle cx="-10.5" cy="-3.5" r="0.9" fill="#FBF9F5" />
        <circle cx="13.5"  cy="-3.5" r="0.9" fill="#FBF9F5" />
        {/* slight smile */}
        <path d="M -8 14 Q 0 18 8 14" stroke="#2C2C2A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        {/* shoulders */}
        <path d="M -42 56 Q 0 38 42 56 L 42 64 L -42 64 Z" fill="#FBF9F5" stroke="rgba(44,44,42,0.18)" strokeWidth="1.4" />
      </svg>
    </div>
  );
}

// PescaScene — water rectangle with swimming fish and a rod from the character.
function PescaScene({ fishList, caughtIds, hookedId, color, onCatch }) {
  return (
    <div style={{
      position: 'relative',
      width: '100%', maxWidth: 560,
      aspectRatio: '5 / 3',
      borderRadius: 22,
      overflow: 'hidden',
      background: 'linear-gradient(180deg, #f7eedf 0%, #f3e6d1 45%, #ead7b8 100%)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 4px 18px rgba(44,44,42,0.06)',
      border: '1px solid rgba(44,44,42,0.08)',
    }}>
      {/* Pier / sky band at top (lighter) */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '38%',
        background: 'linear-gradient(180deg, var(--c-bg) 0%, transparent 100%)',
      }} />

      {/* Wave line — top edge of water */}
      <svg viewBox="0 0 100 6" preserveAspectRatio="none"
           style={{ position: 'absolute', top: '36%', left: 0, width: '100%', height: 18 }}>
        <path d="M 0 3 Q 12 0 25 3 Q 38 6 50 3 Q 62 0 75 3 Q 88 6 100 3 L 100 6 L 0 6 Z"
              fill="#f3e6d1" opacity="0.95">
          <animate attributeName="d"
                   values="M 0 3 Q 12 0 25 3 Q 38 6 50 3 Q 62 0 75 3 Q 88 6 100 3 L 100 6 L 0 6 Z;
                           M 0 3 Q 12 6 25 3 Q 38 0 50 3 Q 62 6 75 3 Q 88 0 100 3 L 100 6 L 0 6 Z;
                           M 0 3 Q 12 0 25 3 Q 38 6 50 3 Q 62 0 75 3 Q 88 6 100 3 L 100 6 L 0 6 Z"
                   dur="4s" repeatCount="indefinite" />
        </path>
      </svg>

      {/* Subtle bubbles in the water */}
      <span aria-hidden="true" style={{
        position: 'absolute', left: '24%', top: '74%', width: 4, height: 4, borderRadius: '50%',
        background: 'rgba(255,255,255,0.45)', animation: 'ancla-bubble-rise 6s ease-out infinite',
      }} />
      <span aria-hidden="true" style={{
        position: 'absolute', left: '58%', top: '82%', width: 3, height: 3, borderRadius: '50%',
        background: 'rgba(255,255,255,0.4)', animation: 'ancla-bubble-rise 7s ease-out infinite',
        animationDelay: '-3s',
      }} />
      <span aria-hidden="true" style={{
        position: 'absolute', left: '78%', top: '70%', width: 5, height: 5, borderRadius: '50%',
        background: 'rgba(255,255,255,0.35)', animation: 'ancla-bubble-rise 8s ease-out infinite',
        animationDelay: '-5s',
      }} />

      {/* Character + rod */}
      <div style={{
        position: 'absolute', left: '4%', top: '-8%', zIndex: 3,
        display: 'flex', alignItems: 'flex-end',
      }}>
        <FishingCharacter color={color} size={110} />
      </div>
      {/* Fishing rod + line + bobber */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
           style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}>
        {/* rod */}
        <path d="M 16 32 Q 32 18 52 38" stroke="#2C2C2A" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        {/* line */}
        <path d="M 52 38 L 52 62" stroke="rgba(44,44,42,0.45)" strokeWidth="0.3" />
        {/* bobber */}
        <circle cx="52" cy="62" r="1.6" fill={color} stroke="rgba(44,44,42,0.5)" strokeWidth="0.25">
          <animate attributeName="cy" values="60.5;63.5;60.5" dur="2.2s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* Fish — each fish lives in its own full-width band; the wrapper animates
          translateX so the fish travels the whole scene width predictably. */}
      {fishList.map((f, i) => {
        const caught = caughtIds.has(f.id);
        const hooked = hookedId === f.id;
        return (
          <div
            key={f.id}
            style={{
              position: 'absolute',
              top: `${f.top}%`,
              left: 0,
              width: '100%',
              height: 50,
              pointerEvents: caught ? 'none' : 'auto',
              opacity: caught ? 0 : 1,
              transition: 'opacity 0.6s ease',
              zIndex: hooked ? 5 : 1,
            }}
          >
            {/* swim wrapper — full width, animates translateX across the scene */}
            <div style={{
              position: 'relative',
              width: '100%', height: '100%',
              animation: hooked
                ? 'ancla-fish-hooked 1.1s cubic-bezier(.34,1.56,.64,1) forwards'
                : `ancla-fish-swim-${f.dir} ${f.dur}s linear infinite`,
              animationDelay: hooked ? '0s' : `${f.delay}s`,
              willChange: 'transform',
            }}>
              {/* fish click target sits at the wrapper's origin (0,0); flip applies only here */}
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

function MethodPesca({ color, onExit }) {
  const totalCatch = 5;
  const fishList = useMemo(() => {
    const phrases = shuffle(PESCA_PHRASES);
    return phrases.map((phrase, i) => ({
      id: `f${i}`,
      phrase,
      top: 50 + (i % 4) * 11,           // rows inside water (~50-83%)
      color: FISH_COLORS[i % FISH_COLORS.length],
      dur: 7 + (i * 1.6) % 6,
      delay: -(i * 0.9),
      dir: i % 2 === 0 ? 'l' : 'r',
    }));
  }, []);

  const [caughtIds, setCaughtIds] = useState(() => new Set());
  const [hooked, setHooked] = useState(null); // fish object being reeled in (animating)
  const [showing, setShowing] = useState(null); // fish object whose phrase is being shown

  // After hooking, wait for the jump animation then show the phrase.
  useEffect(() => {
    if (!hooked) return;
    const t = setTimeout(() => {
      setShowing(hooked);
      setHooked(null);
    }, 1100);
    return () => clearTimeout(t);
  }, [hooked]);

  const caughtCount = caughtIds.size;

  // ── Done ────────────────────────────────────────────────────────────
  if (caughtCount >= totalCatch && !showing) {
    return (
      <CenteredFlow>
        <FadeKey k="done"><h2 style={titleStyle}>Pescaste cinco.</h2></FadeKey>
        <p style={{ ...mutedTextStyle, maxWidth: 460 }}>
          Cada frase que sacaste es una que tu mente puede llevarse, aunque sea por un rato.
          Vuelve cuando quieras a pescar otras.
        </p>
        <Btn onClick={onExit}>Volver al catálogo</Btn>
      </CenteredFlow>
    );
  }

  // ── Showing caught fish + phrase ────────────────────────────────────
  if (showing) {
    return (
      <CenteredFlow>
        <Counter current={caughtCount + 1} total={totalCatch} color={color} />

        {/* Caught fish floating with phrase */}
        <div style={{
          position: 'relative',
          width: '100%', maxWidth: 540,
          minHeight: 'clamp(240px, 36vh, 320px)',
          padding: '32px 24px',
          display: 'grid', placeItems: 'center',
          gap: 18,
        }}>
          {/* Aura */}
          <div aria-hidden="true" style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(ellipse 70% 55% at center, ${color}30, ${color}10 45%, transparent 72%)`,
            filter: 'blur(28px)',
            animation: 'ancla-frase-aura 7s ease-in-out infinite',
          }} />
          {/* Sparkles */}
          <span aria-hidden="true" style={{
            position: 'absolute', left: '14%', top: '22%',
            width: 4, height: 4, borderRadius: '50%', background: color,
            boxShadow: `0 0 12px ${color}, 0 0 24px ${color}55`,
            animation: 'ancla-frase-mote 5s ease-in-out infinite',
          }} />
          <span aria-hidden="true" style={{
            position: 'absolute', right: '12%', top: '20%',
            width: 5, height: 5, borderRadius: '50%', background: '#fff',
            boxShadow: `0 0 14px ${color}cc, 0 0 28px ${color}66`,
            animation: 'ancla-frase-mote 6s ease-in-out infinite',
            animationDelay: '-2s',
          }} />

          {/* Fish floating */}
          <div style={{
            position: 'relative',
            animation: 'ancla-fish-float 3s ease-in-out infinite',
          }}>
            <Fish color={showing.color} size={96} jumping={false} />
          </div>

          {/* Phrase */}
          <div style={{ position: 'relative', textAlign: 'center', maxWidth: 460 }}>
            <p style={{ ...microStyle, color: 'var(--c-faint)', margin: '0 0 8px' }}>
              UN PEZ TRAJO ESTA FRASE
            </p>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontStyle: 'italic',
              fontSize: 'clamp(24px, 4.5vw, 34px)',
              lineHeight: 1.3,
              letterSpacing: '0.012em',
              color: 'var(--c-text)',
              margin: 0,
              textWrap: 'balance',
            }}>{showing.phrase}</h2>
          </div>
        </div>

        <Btn onClick={() => {
          setCaughtIds(new Set([...caughtIds, showing.id]));
          setShowing(null);
        }}>{caughtCount + 1 >= totalCatch ? 'Terminar' : 'Soltar y pescar otra'}</Btn>
        <Btn variant="quiet" onClick={onExit}>Detener</Btn>
      </CenteredFlow>
    );
  }

  // ── Fishing scene ───────────────────────────────────────────────────
  return (
    <CenteredFlow>
      <Counter current={caughtCount + 1} total={totalCatch} color={color} />
      <FadeKey k="fish">
        <p style={{ ...microStyle, color: 'var(--c-faint)', marginBottom: 4 }}>TOCA UN PEZ PARA SACARLO</p>
      </FadeKey>
      <PescaScene
        fishList={fishList}
        caughtIds={caughtIds}
        hookedId={hooked ? hooked.id : null}
        color={color}
        onCatch={(f) => setHooked(f)}
      />
      <Btn variant="quiet" onClick={onExit}>Detener</Btn>
    </CenteredFlow>
  );
}

function CenteredFlow({ children }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 22, padding: '8px 4px 32px',
      width: '100%', maxWidth: 480, margin: '0 auto',
      textAlign: 'center',
    }}>
      {children}
    </div>
  );
}

const titleStyle = {
  fontFamily: 'var(--font-display)',
  fontWeight: 400,
  fontSize: 'clamp(26px, 5vw, 36px)',
  lineHeight: 1.18,
  color: 'var(--c-text)',
  letterSpacing: '-0.015em',
  textWrap: 'balance',
};

const instructionStyle = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(22px, 4.4vw, 30px)',
  lineHeight: 1.3,
  fontWeight: 400,
  color: 'var(--c-text)',
  margin: 0,
  textWrap: 'balance',
};

const mutedTextStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: 15,
  lineHeight: 1.55,
  color: 'var(--c-body)',
  margin: '8px 0 0',
  maxWidth: 420,
};

const microStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--c-faint)',
};

const categoryRowStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '16px 20px',
  borderRadius: 16,
  background: 'var(--c-card)',
  border: '1px solid var(--c-bdr)',
  color: 'var(--c-text)',
  textAlign: 'left',
  transition: 'background .2s ease',
};

// Speech-bubble text styles (used by GuideScene's bubbles)
const bubbleEyebrow = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10.5,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--c-faint)',
  fontWeight: 500,
  margin: '0 0 6px',
};

const bubbleTitle = {
  fontFamily: 'var(--font-display)',
  fontWeight: 500,
  fontSize: 'clamp(22px, 3.4vw, 28px)',
  lineHeight: 1.2,
  color: 'var(--c-text)',
  letterSpacing: '-0.012em',
  margin: 0,
  textWrap: 'balance',
};

const bubbleBody = {
  fontFamily: 'var(--font-body)',
  fontSize: 14.5,
  lineHeight: 1.5,
  color: 'var(--c-body)',
  margin: '8px 0 0',
};

// inject keyframes for progress bar
(function injectBarKeys() {
  if (document.getElementById('ancla-bar-keys')) return;
  const s = document.createElement('style');
  s.id = 'ancla-bar-keys';
  s.textContent = `
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
      to   { transform: translateX(1.5px)  translateY(-0.5px) rotate(0.3deg); }
    }
    @keyframes ancla-wobble {
      from { transform: translateY(-1px) rotate(-0.6deg); }
      to   { transform: translateY(1px)  rotate(0.6deg); }
    }
    @keyframes ancla-nav-pulse {
      0%,100% { transform: scale(1);    box-shadow: 0 0 0 0 currentColor; opacity: 1; }
      50%     { transform: scale(1.25); opacity: 0.7; }
    }

    /* Guide character + speech bubble */
    @keyframes ancla-guide-bob {
      0%,100% { transform: translateY(0); }
      50%     { transform: translateY(-4px); }
    }
    @keyframes ancla-bubble-in {
      0%   { opacity: 0; transform: scale(0.92) translateY(4px); }
      60%  { opacity: 1; transform: scale(1.02) translateY(0); }
      100% { opacity: 1; transform: scale(1)    translateY(0); }
    }

    /* Butterfly flap + float */
    @keyframes ancla-bfly-flap-l {
      0%,100% { transform: rotateY(0deg); }
      50%     { transform: rotateY(58deg); }
    }
    @keyframes ancla-bfly-flap-r {
      0%,100% { transform: rotateY(0deg); }
      50%     { transform: rotateY(-58deg); }
    }
    @keyframes ancla-bfly-float {
      0%,100% { transform: translateY(0) rotate(-2deg); }
      50%     { transform: translateY(-4px) rotate(2deg); }
    }

    /* Frases de anclaje — phrase aura + button lake ripples */
    @keyframes ancla-frase-aura {
      0%,100% { transform: scale(1);    opacity: 0.85; }
      50%     { transform: scale(1.08); opacity: 1; }
    }
    @keyframes ancla-frase-mote {
      0%,100% { transform: translate(0,0)     scale(1);   opacity: 0.4; }
      30%     { transform: translate(6px,-4px) scale(1.4); opacity: 1; }
      60%     { transform: translate(-3px,3px) scale(0.8); opacity: 0.55; }
    }
    @keyframes ancla-lake-ambient {
      0%   { transform: scale(0.96); opacity: 0; }
      18%  { opacity: 0.6; }
      100% { transform: scale(1.22); opacity: 0; }
    }
    @keyframes ancla-lake-click {
      0%   { transform: scale(1);    opacity: 0.85; }
      100% { transform: scale(1.55); opacity: 0; }
    }
    @keyframes ancla-fear-jitter {
      from { transform: translate(-0.6px, 0.3px); }
      to   { transform: translate(0.6px, -0.3px); }
    }

    /* Pesca de Frases */
    @keyframes ancla-fish-wag {
      0%,100% { transform: rotate(-12deg); }
      50%     { transform: rotate(12deg); }
    }
    /* swim across the full scene width (wrapper is 100% wide, so 100% = scene width) */
    @keyframes ancla-fish-swim-l {
      0%   { transform: translateX(-15%); }
      100% { transform: translateX(100%); }
    }
    @keyframes ancla-fish-swim-r {
      0%   { transform: translateX(100%); }
      100% { transform: translateX(-15%); }
    }
    /* hooked: snap to bobber X (~48%) and arc upward */
    @keyframes ancla-fish-hooked {
      0%   { transform: translateX(48%) translateY(0)     rotate(0deg); }
      40%  { transform: translateX(48%) translateY(-90px) rotate(-15deg); }
      70%  { transform: translateX(48%) translateY(-160px) rotate(8deg); }
      100% { transform: translateX(48%) translateY(-220px) rotate(-4deg); opacity: 0; }
    }
    @keyframes ancla-fish-float {
      0%,100% { transform: translateY(0) rotate(-2deg); }
      50%     { transform: translateY(-8px) rotate(2deg); }
    }
    @keyframes ancla-bubble-rise {
      0%   { transform: translateY(0)     scale(1);   opacity: 0; }
      10%  { opacity: 0.8; }
      100% { transform: translateY(-80px) scale(1.5); opacity: 0; }
    }

    /* Burbujas de Calma — pop sequence */
    @keyframes ancla-bubble-burst {
      0%   { transform: scale(1) skew(0deg);    opacity: 1; }
      40%  { transform: scale(1.35, 0.7) skew(-4deg); opacity: 0.85; }
      70%  { transform: scale(0.6, 1.6)  skew(6deg);  opacity: 0.35; }
      100% { transform: scale(0.2)              skew(0deg); opacity: 0; }
    }
    @keyframes ancla-bubble-flash {
      0%   { transform: scale(0.6); opacity: 0; }
      30%  { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    @keyframes ancla-bubble-shock {
      0%   { transform: scale(1);    opacity: 0.9; }
      100% { transform: scale(2.2);  opacity: 0; }
    }
    @keyframes ancla-droplet-fly {
      0%   { transform: translate(0, 0)             scale(0.4); opacity: 0; }
      15%  { opacity: 1; }
      70%  { opacity: 1; }
      100% { transform: translate(var(--dx), var(--dy)) scale(1); opacity: 0; }
    }

    /* Bubble surface-tension wobble — each bubble breathes asymmetrically */
    @keyframes ancla-bubble-wobble-0 {
      0%,100% { border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%; transform: scale(1); }
      33%     { border-radius: 56% 44% 48% 52% / 46% 54% 50% 50%; transform: scale(1.03); }
      66%     { border-radius: 47% 53% 56% 44% / 53% 47% 45% 55%; transform: scale(0.98); }
    }
    @keyframes ancla-bubble-wobble-1 {
      0%,100% { border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%; transform: scale(1.01); }
      25%     { border-radius: 45% 55% 55% 45% / 55% 45% 50% 50%; transform: scale(0.97); }
      50%     { border-radius: 52% 48% 45% 55% / 56% 44% 53% 47%; transform: scale(1.04); }
      75%     { border-radius: 55% 45% 50% 50% / 45% 55% 48% 52%; transform: scale(1); }
    }
    @keyframes ancla-bubble-wobble-2 {
      0%,100% { border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%; transform: scale(1); }
      40%     { border-radius: 58% 42% 53% 47% / 47% 53% 56% 44%; transform: scale(1.05); }
      70%     { border-radius: 44% 56% 47% 53% / 52% 48% 44% 56%; transform: scale(0.96); }
    }
    @keyframes ancla-bubble-shine {
      0%,100% { transform: translate(0, 0) scale(1); opacity: 0.85; }
      35%     { transform: translate(18%, 24%) scale(0.85); opacity: 0.5; }
      70%     { transform: translate(-8%, 14%) scale(1.1); opacity: 0.7; }
    }

    /* Magical breath orb */
    @keyframes ancla-ripple {
      0%   { transform: scale(1);    opacity: 0.85; }
      80%  { opacity: 0; }
      100% { transform: scale(1.55); opacity: 0; }
    }
    /* Water-droplet surface-tension wobble — visible but soft (≈ 6% deviations) */
    @keyframes ancla-droplet-wobble {
      0%,100% { border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%; }
      18%     { border-radius: 56% 44% 48% 52% / 46% 54% 50% 50%; }
      36%     { border-radius: 47% 53% 56% 44% / 53% 47% 45% 55%; }
      55%     { border-radius: 52% 48% 45% 55% / 56% 44% 53% 47%; }
      74%     { border-radius: 45% 55% 53% 47% / 47% 53% 56% 44%; }
    }
    @keyframes ancla-caustic-a {
      0%,100% { transform: translate(0,0) scale(1);    opacity: 0.9; }
      33%     { transform: translate(8%,12%) scale(1.1); opacity: 0.7; }
      66%     { transform: translate(-6%,4%) scale(0.95); opacity: 1; }
    }
    @keyframes ancla-caustic-b {
      0%,100% { transform: translate(0,0) scale(1.05);  opacity: 0.6; }
      40%     { transform: translate(-10%,-6%) scale(0.9); opacity: 0.9; }
      70%     { transform: translate(4%,-12%) scale(1.15); opacity: 0.4; }
    }
    @keyframes ancla-caustic-c {
      0%,100% { transform: translate(0,0) scale(1);    opacity: 0.45; }
      50%     { transform: translate(10%,-8%) scale(1.2); opacity: 0.25; }
    }
    @keyframes ancla-spec-drift {
      0%,100% { transform: translate(0,0)     scale(1);    opacity: 0.85; }
      40%     { transform: translate(6%,4%)   scale(1.1);  opacity: 0.55; }
      75%     { transform: translate(-3%,2%)  scale(0.9);  opacity: 0.7; }
    }
    @keyframes ancla-mote-0 {
      0%,100% { transform: translate(0,0);     opacity: 0.4; }
      25%     { transform: translate(-8px,-12px); opacity: 0.9; }
      50%     { transform: translate(2px,-18px);  opacity: 0.65; }
      75%     { transform: translate(10px,-6px);  opacity: 0.85; }
    }
    @keyframes ancla-mote-1 {
      0%,100% { transform: translate(0,0);     opacity: 0.5; }
      33%     { transform: translate(10px,8px);   opacity: 0.9; }
      66%     { transform: translate(-6px,14px);  opacity: 0.4; }
    }
    @keyframes ancla-mote-2 {
      0%,100% { transform: translate(0,0);     opacity: 0.3; }
      40%     { transform: translate(-12px,-4px); opacity: 0.95; }
      70%     { transform: translate(-4px,10px);  opacity: 0.7; }
    }
    @keyframes ancla-mote-3 {
      0%,100% { transform: translate(0,0);     opacity: 0.55; }
      30%     { transform: translate(6px,-10px);  opacity: 0.85; }
      60%     { transform: translate(14px,4px);   opacity: 0.4; }
    }
  `;
  document.head.appendChild(s);
})();

// ─────────────────────────────────────────────────────────────────────────────
// Method registry (keyed by fase id from spec)
// ─────────────────────────────────────────────────────────────────────────────
const METHOD_COMPONENTS = {
  '1':  MethodSuspiro,
  '2':  Method54321,
  '3':  MethodTapping,
  '4':  MethodDiafragmatica,
  '5':  MethodPostural,
  '6':  MethodEtiquetado,
  '7':  MethodCategorias,
  '8':  MethodConteo,
  '9':  MethodBurbujas,
  '10': MethodFrases,
  '11': MethodTexturas,
  '12': MethodOlores,
  '13': MethodTension,
  '14': MethodPesca,
};

Object.assign(window, {
  METHOD_COMPONENTS, Btn, Counter, FadeKey, CenteredFlow,
  titleStyle, instructionStyle, mutedTextStyle, microStyle,
});
