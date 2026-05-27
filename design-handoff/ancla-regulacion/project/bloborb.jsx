// bloborb.jsx — animated organic orb used on every catalog card
// 80x80 by default. Morphs its border-radius and rotates slowly. Has an
// internal highlight that drifts to read as "liquid".
//
// Variants (idx % 3):
//   0 — soft pulse, slowest
//   1 — figure-8 morph, medium
//   2 — pinch/blob, faster
// idx also nudges initial rotation so a row of orbs feels alive (not synced).

const BLOB_KEYS = `
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
`;

(function injectBlobKeys() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('ancla-blob-keys')) return;
  const s = document.createElement('style');
  s.id = 'ancla-blob-keys';
  s.textContent = BLOB_KEYS;
  document.head.appendChild(s);
})();

function BlobOrb({ color = '#5b81a8', idx = 0, size = 80, style: extraStyle = null }) {
  const variant = idx % 3;
  const speeds = [9.6, 10.1, 8.4];
  const dur = speeds[variant];
  const rot0 = (idx * 23) % 360;

  const wrap = {
    position: 'relative',
    width: size,
    height: size,
    flex: '0 0 auto',
    ...(extraStyle || {}),
  };

  // Sphere: radial gradient with sealed lower-right edge to read 3D.
  const blob = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: '100%',
    height: '100%',
    background: `radial-gradient(circle at 35% 30%, ${color}f2, ${color} 55%, ${color}cc 100%)`,
    boxShadow: `
      0 4px 14px ${color}55,
      0 1px 2px rgba(0,0,0,0.08),
      inset -4px -6px 14px ${color}44,
      inset 4px 4px 14px rgba(255,255,255,0.18)
    `,
    animation: `ancla-blob-${variant} ${dur}s ease-in-out infinite`,
    '--rot0': `${rot0}deg`,
    willChange: 'border-radius, transform',
  };

  // Bright specular highlight that drifts inside the orb
  const hi = {
    position: 'absolute',
    left: '35%',
    top: '30%',
    width: '32%',
    height: '24%',
    background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.85), rgba(255,255,255,0) 70%)',
    filter: 'blur(2px)',
    animation: `ancla-highlight ${dur * 1.3}s ease-in-out infinite`,
    pointerEvents: 'none',
  };

  return (
    <div style={wrap} aria-hidden="true">
      <div style={blob} />
      <div style={hi} />
    </div>
  );
}

// Geometric variant — softer pill/squircle morph for users who want less "blob"
function BlobOrbGeo({ color = '#5b81a8', idx = 0, size = 80, style: extraStyle = null }) {
  const variant = idx % 3;
  const dur = [9.0, 11.0, 10.0][variant];
  const rot0 = (idx * 17) % 360;
  const wrap = { position: 'relative', width: size, height: size, flex: '0 0 auto', ...(extraStyle || {}) };
  const sq = {
    position: 'absolute', left: '50%', top: '50%', width: '88%', height: '88%',
    background: `linear-gradient(135deg, ${color}, ${color}d0 60%, ${color}b0)`,
    boxShadow: `0 6px 18px ${color}44, inset -3px -4px 10px ${color}55, inset 3px 3px 8px rgba(255,255,255,0.22)`,
    animation: `ancla-blob-${variant} ${dur}s ease-in-out infinite`,
    '--rot0': `${rot0}deg`,
    borderRadius: '36%',
  };
  const hi = {
    position: 'absolute', left: '32%', top: '28%', width: '28%', height: '22%',
    background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.7), rgba(255,255,255,0) 75%)',
    filter: 'blur(1.5px)',
    animation: `ancla-highlight ${dur * 1.2}s ease-in-out infinite`,
  };
  return <div style={wrap} aria-hidden="true"><div style={sq} /><div style={hi} /></div>;
}

// Flat ring variant — minimal, no gloss; rings ripple gently.
function BlobOrbRing({ color = '#5b81a8', idx = 0, size = 80, style: extraStyle = null }) {
  const dur = 6 + (idx % 3) * 1.3;
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: '0 0 auto', ...(extraStyle || {}) }} aria-hidden="true">
      <div style={{
        position: 'absolute', inset: '12%', borderRadius: '50%',
        background: `radial-gradient(circle at 50% 50%, ${color}25, ${color}10 65%, transparent 75%)`,
      }} />
      <div style={{
        position: 'absolute', inset: '22%', borderRadius: '50%',
        border: `1.5px solid ${color}`,
        animation: `ancla-ring-pulse ${dur}s ease-in-out infinite`,
      }} />
      <div style={{
        position: 'absolute', inset: '34%', borderRadius: '50%',
        background: color,
        boxShadow: `0 2px 8px ${color}66`,
        animation: `ancla-ring-pulse ${dur * 1.1}s ease-in-out infinite`,
        animationDelay: '-1.5s',
      }} />
    </div>
  );
}

(function injectRingKeys() {
  if (document.getElementById('ancla-ring-keys')) return;
  const s = document.createElement('style');
  s.id = 'ancla-ring-keys';
  s.textContent = `
    @keyframes ancla-ring-pulse {
      0%,100% { transform: scale(1); opacity: .9; }
      50% { transform: scale(1.08); opacity: .7; }
    }
  `;
  document.head.appendChild(s);
})();

window.BlobOrb = BlobOrb;
window.BlobOrbGeo = BlobOrbGeo;
window.BlobOrbRing = BlobOrbRing;
