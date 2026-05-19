'use client';

import { motion } from 'framer-motion';
import { activityHeatmap } from '@/lib/mock-data';

const DAYS   = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const HOURS  = Array.from({ length: 24 }, (_, i) => i);

function intensityColor(v: number): string {
  if (v === 0) return 'var(--color-gray-100)';
  if (v < 20)  return 'var(--color-calm-100)';
  if (v < 40)  return 'var(--color-calm-200)';
  if (v < 60)  return 'var(--color-calm-400)';
  if (v < 80)  return 'var(--color-terra-400)';
  return 'var(--color-terra-600, #9e4a28)';
}

interface ActivityHeatmapProps {
  className?: string;
}

export default function ActivityHeatmap({ className }: ActivityHeatmapProps) {
  const CELL = 20;
  const GAP  = 3;

  return (
    <div className={className} style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ minWidth: 600 }}>
        {/* Hour labels */}
        <div style={{ display: 'flex', marginLeft: 36, gap: GAP, marginBottom: 4 }}>
          {HOURS.map((h) => (
            <div
              key={h}
              style={{
                width: CELL,
                textAlign: 'center',
                fontSize: '0.6rem',
                color: 'var(--color-gray-400)',
                fontFamily: 'var(--font-mono)',
                flexShrink: 0,
              }}
            >
              {h % 4 === 0 ? `${h.toString().padStart(2, '0')}h` : ''}
            </div>
          ))}
        </div>

        {/* Grid */}
        {DAYS.map((day, di) => (
          <div
            key={day}
            style={{ display: 'flex', alignItems: 'center', gap: GAP, marginBottom: GAP }}
          >
            {/* Day label */}
            <div
              style={{
                width: 32,
                fontSize: '0.7rem',
                fontFamily: 'var(--font-body)',
                color: 'var(--color-gray-500)',
                fontWeight: 500,
                textAlign: 'right',
                flexShrink: 0,
              }}
            >
              {day}
            </div>

            {/* Hour cells */}
            {HOURS.map((h) => {
              const val = activityHeatmap[di]?.[h] ?? 0;
              return (
                <motion.div
                  key={h}
                  title={`${day} ${h}:00 — ${val}%`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (di * 24 + h) * 0.001, duration: 0.3 }}
                  whileHover={{ scale: 1.3, zIndex: 10 }}
                  style={{
                    width: CELL,
                    height: CELL,
                    borderRadius: 4,
                    backgroundColor: intensityColor(val),
                    flexShrink: 0,
                    cursor: 'default',
                  }}
                />
              );
            })}
          </div>
        ))}

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, marginLeft: 36 }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-gray-400)', fontFamily: 'var(--font-body)' }}>Menos</span>
          {[0, 20, 40, 60, 80, 100].map((v) => (
            <div
              key={v}
              style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: intensityColor(v) }}
            />
          ))}
          <span style={{ fontSize: '0.7rem', color: 'var(--color-gray-400)', fontFamily: 'var(--font-body)' }}>Más</span>
        </div>
      </div>
    </div>
  );
}
