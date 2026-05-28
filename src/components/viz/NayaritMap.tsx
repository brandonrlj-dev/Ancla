'use client';

import { motion } from 'framer-motion';

/* Simplified SVG outline of Nayarit state — approximate polygon */
const NAYARIT_PATH = `
  M 88 12
  L 110 8
  L 138 18
  L 160 24
  L 178 38
  L 190 58
  L 192 82
  L 186 108
  L 178 136
  L 168 162
  L 152 184
  L 134 200
  L 112 208
  L 88 206
  L 68 196
  L 52 178
  L 40 156
  L 32 130
  L 28 104
  L 30 78
  L 36 54
  L 48 34
  L 64 20
  Z
`;

/* Approximate positions of zones within the 220×220 viewBox */
const zonePositions: Record<string, { x: number; y: number }> = {
  tepic:    { x: 110, y: 110 },
  bahia:    { x: 60,  y: 175 },
  compostela:{ x: 88, y: 148 },
  xalisco:  { x: 105, y: 125 },
  santiago: { x: 88,  y: 78  },
  ruiz:     { x: 100, y: 55  },
};

const riskColors = {
  high:   'var(--color-terra-500)',
  medium: 'var(--color-sand-500)',
  low:    'var(--color-sage-500)',
};

// Static zone metadata — positions and display names only, no alert counts
const ZONE_META: { id: string; name: string; pos: { x: number; y: number } }[] = [
  { id: 'Tepic',                name: 'Tepic',              pos: { x: 110, y: 110 } },
  { id: 'Bahía de Banderas',    name: 'Bahía de Banderas',  pos: { x: 60,  y: 175 } },
  { id: 'Compostela',           name: 'Compostela',         pos: { x: 88,  y: 148 } },
  { id: 'Xalisco',              name: 'Xalisco',            pos: { x: 105, y: 125 } },
  { id: 'Santiago Ixcuintla',   name: 'Santiago Ixcuintla', pos: { x: 88,  y: 78  } },
  { id: 'Ruiz',                 name: 'Ruiz',               pos: { x: 100, y: 55  } },
]

interface NayaritMapProps {
  size?: number;
  highlightZone?: string;
  className?: string;
  zonaStats?: { name: string; alerts: number }[];
}

export default function NayaritMap({ size = 260, highlightZone, className, zonaStats = [] }: NayaritMapProps) {
  const maxAlerts = Math.max(1, ...zonaStats.map((z) => z.alerts))
  const alertsByZone = Object.fromEntries(zonaStats.map((z) => [z.name, z.alerts]))
  return (
    <div className={className} style={{ position: 'relative' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 220 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Mapa de Nayarit"
      >
        <defs>
          <filter id="map-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* State fill */}
        <path
          d={NAYARIT_PATH}
          fill="var(--color-night-50)"
          stroke="var(--color-night-300)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Zone markers */}
        {ZONE_META.map((zone) => {
          const alerts = alertsByZone[zone.id] ?? 0
          const ratio  = alerts / maxAlerts  // 0–1
          const col    = ratio >= 0.66 ? riskColors.high : ratio >= 0.33 ? riskColors.medium : riskColors.low
          const isHighlighted = highlightZone === zone.id
          const glowRings = alerts > 0 ? Math.min(3, Math.ceil(ratio * 3)) : 0

          return (
            <g key={zone.id} transform={`translate(${zone.pos.x}, ${zone.pos.y})`}>
              {/* Glow rings — proportional to alert count */}
              {Array.from({ length: glowRings }).map((_, ri) => (
                <motion.circle
                  key={ri}
                  r={8 + ri * 9}
                  fill="none"
                  stroke={col}
                  strokeWidth="1"
                  opacity={0}
                  animate={{ r: [8 + ri * 9, 8 + ri * 9 + 10], opacity: [0.5, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: ri * 0.8, ease: 'easeOut' }}
                />
              ))}

              {/* Zone dot */}
              <motion.circle
                r={isHighlighted ? 7 : alerts > 0 ? 5 : 3}
                fill={alerts > 0 ? col : 'var(--color-night-200)'}
                filter={alerts > 0 ? 'url(#map-glow)' : undefined}
                animate={{ r: isHighlighted ? [6, 8, 6] : undefined, opacity: 1 }}
                transition={{ duration: 1.5, repeat: isHighlighted ? Infinity : 0, ease: 'easeInOut' }}
              />

              {/* Zone label */}
              <text y={-10} textAnchor="middle" fontSize="8" fill="var(--color-night-700)" fontFamily="var(--font-body)" fontWeight="500">
                {zone.name}
              </text>

              {/* Alert count chip — only when there's data */}
              {alerts > 0 && (
                <g transform="translate(6, -14)">
                  <rect x="0" y="-7" width="20" height="12" rx="6" fill={col} />
                  <text y="1" textAnchor="middle" x="10" fontSize="7" fill="white" fontFamily="var(--font-body)" fontWeight="700">
                    {alerts}
                  </text>
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  );
}
