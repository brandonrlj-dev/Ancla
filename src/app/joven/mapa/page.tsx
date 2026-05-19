'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import JovenHeader from '@/components/joven/JovenHeader';
import { temporalEvents } from '@/lib/mock-data';
import { UserX, MessageCircle, AlertTriangle, Flag, Clock, FileText } from 'lucide-react';

const typeConfig: Record<string, { color: string; Icon: React.ElementType }> = {
  contact:  { color: 'var(--color-calm-500)',  Icon: MessageCircle },
  talk:     { color: 'var(--color-sage-500)',   Icon: Clock },
  isolate:  { color: 'var(--color-sand-500)',   Icon: UserX },
  request:  { color: 'var(--color-terra-500)',  Icon: AlertTriangle },
  pressure: { color: 'var(--color-terra-700)',  Icon: AlertTriangle },
  report:   { color: 'var(--color-sage-600, #4a6148)',   Icon: Flag },
};

export default function MapaPage() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-background)' }}>
      <JovenHeader title="Lo que pasó" />

      <div style={{ flex: 1, padding: isMobile ? '28px 20px' : '40px 48px', display: 'flex', flexDirection: 'column' }}>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--color-text-secondary)', marginBottom: 40, maxWidth: 520 }}
        >
          Este mapa muestra los momentos importantes de lo que viviste. Es tuyo, y ayuda a entender el patrón.
        </motion.p>

        {/* Desktop: horizontal rail  |  Mobile: vertical rail */}
        {isMobile ? (
          /* VERTICAL — Mobile */
          <div style={{ position: 'relative', paddingLeft: 40 }}>
            {/* Vertical line */}
            <div style={{ position: 'absolute', left: 12, top: 8, bottom: 8, width: 2, background: 'linear-gradient(180deg, var(--color-calm-300), var(--color-terra-400))', borderRadius: 1 }} />

            {temporalEvents.map((ev, i) => {
              const cfg   = typeConfig[ev.type] ?? typeConfig.talk;
              const isHov = hoveredId === ev.id;
              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  style={{ position: 'relative', marginBottom: 28 }}
                  onMouseEnter={() => setHoveredId(ev.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Dot */}
                  <motion.div
                    animate={{ scale: isHov ? 1.4 : 1 }}
                    style={{
                      position: 'absolute',
                      left: -28,
                      top: 4,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: cfg.color,
                      border: `3px solid white`,
                      boxShadow: `0 0 0 2px ${cfg.color}50`,
                      zIndex: 2,
                    }}
                  />

                  {/* Card */}
                  <div style={{ background: 'white', borderRadius: 12, padding: '12px 16px', boxShadow: 'var(--shadow-sm)', border: `1px solid ${isHov ? cfg.color + '50' : 'var(--color-border)'}`, transition: 'border 200ms' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <cfg.Icon size={14} color={cfg.color} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: cfg.color, fontWeight: 600 }}>{ev.date}</span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{ev.label}</span>
                    </div>
                    <AnimatePresence>
                      {isHov && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', lineHeight: 1.5, overflow: 'hidden' }}
                        >
                          {ev.detail}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* HORIZONTAL — Desktop */
          <div style={{ flex: 1, overflowX: 'auto', paddingBottom: 24 }}>
            <div style={{ minWidth: 700, position: 'relative', paddingTop: 80 }}>
              {/* Horizontal rail */}
              <div style={{
                position: 'absolute',
                top: 32,
                left: 40,
                right: 40,
                height: 2,
                background: 'linear-gradient(90deg, var(--color-calm-300), var(--color-terra-400))',
                borderRadius: 1,
              }} />

              {/* Events */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 40px' }}>
                {temporalEvents.map((ev, i) => {
                  const cfg   = typeConfig[ev.type] ?? typeConfig.talk;
                  const isHov = hoveredId === ev.id;
                  const above = i % 2 === 0;

                  return (
                    <motion.div
                      key={ev.id}
                      initial={{ opacity: 0, y: above ? -16 : 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        flex: 1,
                      }}
                      onMouseEnter={() => setHoveredId(ev.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      {/* Above content */}
                      {above && (
                        <div style={{ marginBottom: 8, textAlign: 'center', maxWidth: 100 }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: cfg.color, fontWeight: 600, marginBottom: 2 }}>{ev.date}</div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>{ev.label}</div>
                        </div>
                      )}

                      {/* Dot on rail */}
                      <motion.div
                        animate={{ scale: isHov ? 1.4 : 1 }}
                        style={{
                          width: 18, height: 18, borderRadius: '50%',
                          background: cfg.color,
                          border: '3px solid white',
                          boxShadow: `0 0 0 2px ${cfg.color}50`,
                          flexShrink: 0,
                          zIndex: 2,
                          position: above ? 'relative' : 'relative',
                          marginTop: above ? 0 : -9,
                          marginBottom: above ? -9 : 0,
                        }}
                      />

                      {/* Below content */}
                      {!above && (
                        <div style={{ marginTop: 8, textAlign: 'center', maxWidth: 100 }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: cfg.color, fontWeight: 600, marginBottom: 2 }}>{ev.date}</div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>{ev.label}</div>
                        </div>
                      )}

                      {/* Hover pill */}
                      <AnimatePresence>
                        {isHov && (
                          <motion.div
                            initial={{ opacity: 0, y: above ? -8 : 8, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            style={{
                              position: 'absolute',
                              top: above ? -60 : 'auto',
                              bottom: !above ? -70 : 'auto',
                              zIndex: 10,
                              background: 'var(--color-gray-900)',
                              color: 'white',
                              padding: '8px 12px',
                              borderRadius: 10,
                              fontSize: '0.75rem',
                              fontFamily: 'var(--font-body)',
                              maxWidth: 180,
                              textAlign: 'center',
                              lineHeight: 1.4,
                              boxShadow: 'var(--shadow-lg)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {ev.detail}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
