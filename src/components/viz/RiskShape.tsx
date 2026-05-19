'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';

/* Evocative labels — non-numeric */
function getRiskLabel(risk: number): string {
  if (risk <= 20)  return 'Tranquila';
  if (risk <= 40)  return 'Algo nerviosa';
  if (risk <= 60)  return 'Preocupada';
  if (risk <= 80)  return 'Asustada';
  return 'En crisis';
}

function getRiskColor(risk: number): string {
  if (risk <= 25)  return 'var(--color-sage-500)';
  if (risk <= 50)  return 'var(--color-calm-500)';
  if (risk <= 75)  return 'var(--color-sand-500)';
  return 'var(--color-terra-500)';
}

function getRiskFill(risk: number): string {
  if (risk <= 25)  return 'var(--color-sage-100)';
  if (risk <= 50)  return 'var(--color-calm-100)';
  if (risk <= 75)  return 'var(--color-sand-100)';
  return 'var(--color-terra-100)';
}

/* Generate smooth 14-point path */
function generateRiskPath(risk: number): string {
  const cx = 100, cy = 105, baseR = 78;
  const n = 14;
  const gapFactor = Math.max(0, (risk - 28) / 72);

  // Fixed organic radii per point
  const organicMul = [1.0, 1.06, 0.93, 1.08, 0.95, 1.04, 0.91, 1.07, 0.97, 1.02, 0.94, 1.09, 0.96, 1.01];
  // Risk-based outward push per point (highest at sides, lowest at top/bottom)
  const riskPush   = [0.0, 0.3, 0.7, 1.0, 0.8, 0.5, 0.2, 0.5, 0.8, 1.0, 0.7, 0.3, 0.0, 0.0];

  const pts: [number, number][] = [];

  for (let i = 0; i < n; i++) {
    const baseAngle = -Math.PI / 2 + (2 * Math.PI / n) * i;

    // Spread top-two points apart for high risk gap
    let angleOffset = 0;
    if (i === 0)     angleOffset = -gapFactor * 0.38;
    if (i === n - 1) angleOffset =  gapFactor * 0.38;

    const angle = baseAngle + angleOffset;
    const r = baseR * organicMul[i] + risk * riskPush[i] * 0.14;

    pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }

  // Midpoint-based smooth path (all Q commands → consistent structure)
  const mids: [number, number][] = pts.map((p, i) => {
    const next = pts[(i + 1) % n];
    return [(p[0] + next[0]) / 2, (p[1] + next[1]) / 2];
  });

  let d = `M ${mids[0][0].toFixed(1)} ${mids[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const cp  = pts[i];
    const end = mids[(i + 1) % n];
    d += ` Q ${cp[0].toFixed(1)} ${cp[1].toFixed(1)} ${end[0].toFixed(1)} ${end[1].toFixed(1)}`;
  }
  if (risk < 72) d += ' Z'; // open gap above 72
  return d;
}

interface RiskShapeProps {
  risk: number;   // 0–100
  size?: number;
  showLabel?: boolean;
  breathing?: boolean;
  className?: string;
}

export default function RiskShape({ risk, size = 210, showLabel = true, breathing = false, className }: RiskShapeProps) {
  const color = getRiskColor(risk);
  const fill  = getRiskFill(risk);
  const label = getRiskLabel(risk);
  const path  = generateRiskPath(risk);

  return (
    <div
      className={className}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 210"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={`Nivel de riesgo: ${label}`}
      >
        <defs>
          <filter id="risk-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Breathing fill animation */}
        <motion.path
          d={path}
          fill={fill}
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={risk > 60 ? 'url(#risk-glow)' : undefined}
          animate={{
            d: path,
            scale: breathing ? [1, 1.03, 1] : 1,
            fill,
            stroke: color,
          }}
          transition={{
            d: { duration: 0.9, ease: 'easeInOut' },
            scale: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
            fill: { duration: 0.6 },
            stroke: { duration: 0.6 },
          }}
          style={{ transformOrigin: '100px 105px' }}
        />
      </svg>

      {/* Evocative label */}
      {showLabel && (
        <motion.span
          animate={{ color }}
          transition={{ duration: 0.6 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}
        >
          {label}
        </motion.span>
      )}
    </div>
  );
}
