// app.jsx — Ancla /joven/regulacion · catálogo + router de fases

const { useState, useEffect, useMemo } = React;

// ─────────────────────────────────────────────────────────────────────────────
// Catalog
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: 'cuerpo',
    label: 'Calmar el cuerpo',
    hint: 'Cuando el corazón late rápido, la respiración se acelera o hay tensión física.',
    color: '#5b81a8',
    methods: [
      { name: 'Suspiro Fisiológico',     desc: 'Dos inhalaciones seguidas y una exhalación larga activan el sistema parasimpático en segundos.', time: '< 2 MIN', fase: '1',  color: '#5b81a8' },
      { name: 'Respiración Diafragmática', desc: 'Inhala despacio llevando el aire al abdomen. Seis ciclos más lentos que el Suspiro.',         time: '~ 2 MIN', fase: '4',  color: '#7299bc' },
      { name: 'Burbujas de Calma',       desc: 'Burbujas flotantes sin texto. Las tocas para reventarlas. Sales cuando tú quieras.',              time: '~ 2 MIN', fase: '9',  color: '#89afd1' },
      { name: 'Tensión y Liberación',    desc: 'Aprieta los puños fuerte y suelta. Descarga física rápida para enojo o desborde.',                time: '< 2 MIN', fase: '13', color: '#6a8aaa' },
    ],
  },
  {
    id: 'presente',
    label: 'Volver al presente',
    hint: 'Cuando te sientes desconectado/a, ausente o como si nada fuera real.',
    color: '#6b7f5e',
    methods: [
      { name: '5-4-3-2-1 · Abrazo de Mariposa', desc: 'Ancla los sentidos nombrando lo que ves, escuchas y tocas. Cierra con un minuto de abrazo bilateral.', time: '~ 3 MIN', fase: '2',  color: '#6b7f5e' },
      { name: 'Reacomodo Postural',             desc: 'Cinco ajustes corporales para salir del encogimiento.',                                                  time: '< 1 MIN', fase: '5',  color: '#8a9e7a' },
      { name: 'Frases de Anclaje',              desc: 'Cinco frases cortas que te recuerdan dónde estás. Una por pantalla.',                                    time: '< 2 MIN', fase: '10', color: '#7a9570' },
      { name: 'Texturas de Anclaje',            desc: 'Toca un objeto cercano. Nota su forma, temperatura y peso.',                                             time: '< 2 MIN', fase: '11', color: '#6e8865' },
      { name: 'Olores de Anclaje',              desc: 'Un olor familiar le recuerda al cerebro dónde está.',                                                    time: '< 2 MIN', fase: '12', color: '#5e7855' },
    ],
  },
  {
    id: 'mente',
    label: 'Ordenar la mente',
    hint: 'Cuando los pensamientos no paran, hay confusión emocional o no sabes qué sientes.',
    color: '#c4a882',
    methods: [
      { name: 'Tapping EFT',          desc: 'Toca puntos en cara y cuerpo mientras repites frases que procesan la culpa.', time: '~ 5 MIN', fase: '3', color: '#c4a882' },
      { name: 'Pesca de Frases',      desc: 'Saca peces del agua. Cada uno trae consigo una frase que tu mente puede llevarse.', time: '~ 3 MIN', fase: '14', color: '#b89a72' },
      { name: 'Etiquetado Emocional', desc: 'Ponerle nombre a lo que sientes baja la intensidad emocional.',               time: '< 1 MIN', fase: '6', color: '#b8956f' },
      { name: 'Categorías Mentales',  desc: 'Darle a la mente una tarea simple interrumpe los pensamientos repetitivos.',  time: '~ 2 MIN', fase: '7', color: '#a8855c' },
      { name: 'Conteo Hacia Atrás',   desc: 'Contar hacia atrás desde 20 ocupa la mente activa.',                          time: '~ 2 MIN', fase: '8', color: '#9a7650' },
    ],
  },
];

const METHOD_BY_FASE = {};
const ALL_METHODS = [];
CATEGORIES.forEach((c) => {
  c.methods.forEach((m) => {
    METHOD_BY_FASE[m.fase] = { ...m, categoryLabel: c.label, categoryId: c.id };
    ALL_METHODS.push(m);
  });
});
const GLOBAL_IDX = {};
ALL_METHODS.forEach((m, i) => { GLOBAL_IDX[m.fase] = i; });

// ─────────────────────────────────────────────────────────────────────────────
// Logo
// ─────────────────────────────────────────────────────────────────────────────
function AnclaLogo({ size = 18 }) {
  // Simple anchor mark + wordmark. Calm, abstracted.
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="5.5" r="2.3" stroke="currentColor" strokeWidth="1.4" />
        <path d="M12 8 L12 20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M6.5 14 Q 12 22 17.5 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        <path d="M8.5 12 L15.5 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <span style={{
        fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 500,
        letterSpacing: '-0.01em', color: 'var(--c-text)',
      }}>Ancla</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Top bar
// ─────────────────────────────────────────────────────────────────────────────
function TopBar({ activeMethod, onBack, onExit }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 10,
      background: 'rgba(245,242,238,0.85)',
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--c-bdr)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center', height: 56,
        padding: '0 18px',
      }}>
        <button onClick={onBack} style={navBtnStyle}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>←</span>
          <span>{activeMethod ? 'Métodos' : 'Atrás'}</span>
        </button>
        <AnclaLogo />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {activeMethod && (
            <button onClick={onExit} style={{ ...navBtnStyle, gap: 6 }}>
              <span>Salir</span>
              <span style={{ fontSize: 13, opacity: 0.6 }}>✕</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

const navBtnStyle = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 450,
  color: 'var(--c-muted)',
  padding: '6px 10px',
  borderRadius: 999,
  transition: 'color .2s ease, background .2s ease',
  background: 'transparent',
  justifySelf: 'start',
};

// ─────────────────────────────────────────────────────────────────────────────
// Catalog view (Vista A)
// ─────────────────────────────────────────────────────────────────────────────
function Catalog({ onSelect, density, blobVariant }) {
  const pad = density === 'compact' ? 22 : density === 'comfy' ? 32 : 28;
  const gap = density === 'compact' ? 12 : density === 'comfy' ? 22 : 18;
  const orbSize = density === 'compact' ? 64 : density === 'comfy' ? 92 : 80;

  const OrbCmp = blobVariant === 'geo' ? window.BlobOrbGeo
               : blobVariant === 'ring' ? window.BlobOrbRing
               : window.BlobOrb;

  return (
    <div style={{
      maxWidth: 1200, margin: '0 auto',
      padding: 'clamp(28px, 5vw, 52px) clamp(18px, 4vw, 60px) 80px',
    }}>
      {/* Hero */}
      <div style={{ marginBottom: 'clamp(36px, 6vw, 56px)', maxWidth: 720 }}>
        <p style={eyebrowStyle}>BASADOS EN INVESTIGACIÓN CIENTÍFICA</p>
        <h1 style={h1Style}>Métodos para calmarte.</h1>
        <p style={leadStyle}>
          Elige según lo que estás sintiendo ahora. Ninguno necesita motricidad fina,
          ni te pone reloj, ni guarda nada.
        </p>
      </div>

      {/* Categories */}
      {CATEGORIES.map((cat, cIdx) => (
        <section key={cat.id} style={{ marginBottom: 'clamp(32px, 5vw, 48px)' }}>
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            paddingBottom: 16,
            borderBottom: `1px solid var(--c-bdr)`,
            marginBottom: 22,
          }}>
            <span style={{
              width: 9, height: 9, borderRadius: '50%', background: cat.color,
              marginTop: 9, flexShrink: 0,
              boxShadow: `0 0 0 3px ${cat.color}18`,
            }} />
            <div>
              <h2 style={categoryTitleStyle}>{cat.label}</h2>
              <p style={categoryHintStyle}>{cat.hint}</p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap,
          }}>
            {cat.methods.map((m, idx) => (
              <MethodCard
                key={m.fase}
                method={m}
                onSelect={() => onSelect(m.fase)}
                pad={pad}
                orbSize={orbSize}
                OrbCmp={OrbCmp}
                idx={GLOBAL_IDX[m.fase]}
                delay={(cIdx * 100) + (idx * 55)}
              />
            ))}
          </div>
        </section>
      ))}

      {/* Crisis */}
      <div style={{
        marginTop: 32,
        padding: '20px 22px',
        borderRadius: 18,
        background: 'rgba(167,199,231,0.13)',
        border: '1px solid rgba(167,199,231,0.32)',
        display: 'flex', gap: 14, alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: '1 1 240px' }}>
          <p style={{
            fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--c-text)',
            margin: 0, fontWeight: 400,
          }}>
            Si en este momento te sientes en crisis,
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--c-body)', margin: '4px 0 0' }}>
            no necesitas estar solo/a. Puedes hablar con ANA ahora mismo.
          </p>
        </div>
        <button style={{
          padding: '11px 22px',
          borderRadius: 999,
          background: 'var(--c-text)',
          color: 'var(--c-bg)',
          fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
        }}>Habla con ANA →</button>
      </div>
    </div>
  );
}

function MethodCard({ method, onSelect, pad, orbSize, OrbCmp, idx, delay }) {
  const [hover, setHover] = useState(false);
  return (
    <article
      onClick={onSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--c-card)',
        border: '1px solid var(--c-bdr)',
        borderRadius: 22,
        padding: pad,
        display: 'flex', flexDirection: 'column', gap: 16,
        cursor: 'pointer',
        transition: 'transform .35s cubic-bezier(.4,0,.2,1), box-shadow .35s cubic-bezier(.4,0,.2,1), border-color .25s',
        transform: hover ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hover
          ? '0 2px 6px rgba(44,44,42,0.05), 0 12px 30px rgba(44,44,42,0.08)'
          : '0 1px 3px rgba(44,44,42,0.04)',
        borderColor: hover ? 'rgba(44,44,42,0.12)' : 'var(--c-bdr)',
        animation: `ancla-fade-up .55s cubic-bezier(.4,0,.2,1) both`,
        animationDelay: `${delay}ms`,
        minHeight: 240,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <OrbCmp color={method.color} idx={idx} size={orbSize} />
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.14em',
          color: 'var(--c-faint)',
        }}>{method.time}</span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22, lineHeight: 1.18, fontWeight: 400,
          color: 'var(--c-text)',
          letterSpacing: '-0.012em',
          textWrap: 'balance',
          margin: 0,
        }}>{method.name}</h3>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: 1.55,
          color: 'var(--c-body)', margin: 0,
        }}>{method.desc}</p>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 6,
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.14em',
          color: method.color,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: method.color }} />
          Practicar
        </span>
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 500,
          color: 'var(--c-text)',
          transform: hover ? 'translateX(3px)' : 'translateX(0)',
          transition: 'transform .3s cubic-bezier(.4,0,.2,1)',
        }}>→</span>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Active method view (Vista B)
// ─────────────────────────────────────────────────────────────────────────────
function ActiveMethod({ method, onExit, onGoToFase }) {
  const Cmp = window.METHOD_COMPONENTS[method.fase];
  // Method 9 (Burbujas) is full-bleed overlay — render without the standard shell wrapper
  const isOverlay = method.fase === '9';
  if (isOverlay) {
    return <Cmp color={method.color} onExit={onExit} onGoToFase={onGoToFase} />;
  }
  return (
    <div style={{
      maxWidth: 720, margin: '0 auto',
      padding: 'clamp(28px, 5vw, 48px) clamp(18px, 4vw, 32px) 60px',
      display: 'flex', flexDirection: 'column', gap: 28,
      minHeight: 'calc(100dvh - 56px)',
    }}>
      {/* Header strip */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'ancla-fade-up .5s both' }}>
        <p style={eyebrowStyle}>{method.categoryLabel.toUpperCase()}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 400, letterSpacing: '-0.015em',
            margin: 0, color: 'var(--c-text)',
          }}>{method.name}</h2>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em',
            color: 'var(--c-faint)',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: method.color }} />
            {method.time}
          </span>
        </div>
      </div>

      {/* Method body */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Cmp color={method.color} onExit={onExit} onGoToFase={onGoToFase} />
      </div>

      {/* Privacy footer */}
      <div style={{
        paddingTop: 22,
        borderTop: '1px solid var(--c-bdr)',
        display: 'flex', alignItems: 'center', gap: 10,
        color: 'var(--c-faint)',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2 L20 6 V12 C20 16 16 20 12 22 C8 20 4 16 4 12 V6 Z"
                stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none" />
        </svg>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 12.5, lineHeight: 1.5,
          margin: 0,
        }}>Nada de lo que hagas aquí se guarda en tu dispositivo.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tweaks defaults
// ─────────────────────────────────────────────────────────────────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "displayFont": "Newsreader",
  "bodyFont": "Inter",
  "density": "regular",
  "blobVariant": "blob",
  "bgTone": "warm"
}/*EDITMODE-END*/;

const FONT_OPTIONS = {
  display: {
    'Newsreader': '"Newsreader", "Georgia", serif',
    'Fraunces':   '"Fraunces", "Georgia", serif',
    'Spectral':   '"Spectral", "Georgia", serif',
    'Instrument Serif': '"Instrument Serif", "Georgia", serif',
  },
  body: {
    'Inter':       '"Inter", system-ui, sans-serif',
    'IBM Plex Sans':'"IBM Plex Sans", system-ui, sans-serif',
    'Söhne fallback':'-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
  },
};

const BG_TONES = {
  warm:    { bg: '#F5F2EE', card: '#FBF9F5' },
  neutral: { bg: '#F4F4F2', card: '#FAFAF8' },
  cool:    { bg: '#F0F2F4', card: '#F8F9FB' },
  deeper:  { bg: '#ECE8E2', card: '#F5F2EC' },
};

// load extra Google fonts on demand
function injectFont(family) {
  const id = 'g-' + family.replace(/\s+/g, '-');
  if (document.getElementById(id)) return;
  const fam = family.replace(/ /g, '+');
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fam}:ital,wght@0,300;0,400;0,500;1,400&display=swap`;
  document.head.appendChild(link);
}

// ─────────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [fase, setFase] = useState(() => {
    try { return new URLSearchParams(window.location.search).get('fase'); } catch (_) { return null; }
  });

  // Apply tweaks: font + bg
  useEffect(() => {
    if (t.displayFont !== 'Newsreader') injectFont(t.displayFont);
    if (t.bodyFont !== 'Inter' && t.bodyFont !== 'Söhne fallback') injectFont(t.bodyFont);
    const r = document.documentElement;
    r.style.setProperty('--font-display', FONT_OPTIONS.display[t.displayFont] || FONT_OPTIONS.display.Newsreader);
    r.style.setProperty('--font-body', FONT_OPTIONS.body[t.bodyFont] || FONT_OPTIONS.body.Inter);
    const tone = BG_TONES[t.bgTone] || BG_TONES.warm;
    r.style.setProperty('--c-bg', tone.bg);
    r.style.setProperty('--c-card', tone.card);
    document.body.style.background = tone.bg;
  }, [t.displayFont, t.bodyFont, t.bgTone]);

  const activeMethod = fase ? METHOD_BY_FASE[fase] : null;

  // Update URL when fase changes (without reload)
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (fase) url.searchParams.set('fase', fase);
      else url.searchParams.delete('fase');
      window.history.replaceState({}, '', url);
    } catch (_) {}
  }, [fase]);

  // Listen for back/forward
  useEffect(() => {
    const onPop = () => {
      try { setFase(new URLSearchParams(window.location.search).get('fase')); } catch (_) {}
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return (
    <div data-screen-label={activeMethod ? `Método · ${activeMethod.name}` : 'Catálogo'}>
      <TopBar
        activeMethod={activeMethod}
        onBack={() => setFase(null)}
        onExit={() => setFase(null)}
      />

      {activeMethod ? (
        <ActiveMethod
          key={activeMethod.fase}
          method={activeMethod}
          onExit={() => setFase(null)}
          onGoToFase={(f) => setFase(f)}
        />
      ) : (
        <Catalog
          onSelect={(f) => setFase(f)}
          density={t.density}
          blobVariant={t.blobVariant}
        />
      )}

      {/* Floating "Ya fue suficiente" close for burbujas — handled inside method */}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Tipografía" />
        <TweakSelect label="Display"
          value={t.displayFont}
          options={Object.keys(FONT_OPTIONS.display)}
          onChange={(v) => setTweak('displayFont', v)} />
        <TweakSelect label="Body"
          value={t.bodyFont}
          options={Object.keys(FONT_OPTIONS.body)}
          onChange={(v) => setTweak('bodyFont', v)} />

        <TweakSection label="Catálogo" />
        <TweakRadio label="Densidad"
          value={t.density}
          options={['compact', 'regular', 'comfy']}
          onChange={(v) => setTweak('density', v)} />
        <TweakRadio label="Visual de orb"
          value={t.blobVariant}
          options={['blob', 'geo', 'ring']}
          onChange={(v) => setTweak('blobVariant', v)} />

        <TweakSection label="Atmósfera" />
        <TweakRadio label="Tono fondo"
          value={t.bgTone}
          options={['warm', 'neutral', 'cool', 'deeper']}
          onChange={(v) => setTweak('bgTone', v)} />

        <TweakSection label="Navegación rápida" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginTop: 4 }}>
          {ALL_METHODS.map((m) => (
            <button key={m.fase}
              onClick={() => setFase(m.fase)}
              title={m.name}
              style={{
                padding: '6px 0', borderRadius: 6,
                background: fase === m.fase ? m.color : 'rgba(255,255,255,0.5)',
                color: fase === m.fase ? '#fff' : '#29261b',
                border: '1px solid rgba(0,0,0,0.08)',
                fontSize: 11, fontFamily: 'var(--font-mono)',
              }}>{m.fase}</button>
          ))}
        </div>
        <button
          onClick={() => setFase(null)}
          style={{
            marginTop: 6, padding: '7px 10px', borderRadius: 8,
            background: !fase ? '#29261b' : 'rgba(255,255,255,0.5)',
            color: !fase ? '#FBF9F5' : '#29261b',
            border: '1px solid rgba(0,0,0,0.08)',
            fontSize: 11,
          }}
        >← Ver catálogo</button>
      </TweaksPanel>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared text styles
// ─────────────────────────────────────────────────────────────────────────────
const eyebrowStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--c-faint)',
  margin: 0,
  fontWeight: 500,
};

const h1Style = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(34px, 6vw, 56px)',
  lineHeight: 1.08,
  fontWeight: 400,
  letterSpacing: '-0.02em',
  color: 'var(--c-text)',
  margin: '14px 0 14px',
  textWrap: 'balance',
};

const leadStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: 'clamp(15px, 1.5vw, 17px)',
  lineHeight: 1.55,
  color: 'var(--c-body)',
  margin: 0,
  textWrap: 'pretty',
  maxWidth: 560,
};

const categoryTitleStyle = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(20px, 2.6vw, 24px)',
  fontWeight: 400,
  letterSpacing: '-0.012em',
  color: 'var(--c-text)',
  margin: 0,
};

const categoryHintStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  lineHeight: 1.5,
  color: 'var(--c-faint)',
  margin: '4px 0 0',
  maxWidth: 540,
};

// ─────────────────────────────────────────────────────────────────────────────
// Mount
// ─────────────────────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
