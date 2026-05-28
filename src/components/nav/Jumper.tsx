'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { Map, Compass, Navigation, X, ChevronRight } from 'lucide-react';
import { useAnclaStore } from '@/lib/store';

interface NavItem {
  label: string;
  href: string;
  description?: string;
}

const sections = [
  {
    id: 'joven',
    label: 'Portal Joven',
    color: 'var(--color-sage-500)',
    bgColor: 'var(--color-sage-50)',
    items: [
      { label: 'Bienvenida',           href: '/joven',             description: 'Pantalla de inicio' },
      { label: 'Termómetro emocional', href: '/joven/termometro',  description: '5 estados con ThermOrb' },
      { label: 'Respiración',          href: '/joven/respiracion', description: 'Ciclo 4-4-4 guiado' },
      { label: 'Selección de modo',     href: '/joven/modo',            description: 'ANA / Escudo / Ancla' },
      { label: 'ANA (chat libre)',      href: '/joven/chat',            description: 'Apoyo emocional y orientación' },
      { label: 'Modo Escudo',          href: '/joven/escudo',          description: 'Cuestionario de señales de riesgo' },
      { label: 'Modo Ancla',           href: '/joven/ancla',           description: 'Flujo guiado de reporte' },
      { label: 'Líneas de atención',   href: '/joven/lineas',          description: '4 líneas con guión' },
      { label: 'Modo silencioso',      href: '/joven/silencioso',      description: 'Calculadora discreta' },
      { label: 'Regulación',           href: '/joven/regulacion',      description: 'Métodos de apoyo' },
    ] as NavItem[],
  },
  {
    id: 'policia',
    label: 'Portal Policía',
    color: 'var(--color-night-700)',
    bgColor: 'var(--color-night-50)',
    items: [
      { label: 'Login',             href: '/policia/login',             description: 'Acceso institucional' },
      { label: 'Dashboard',         href: '/policia',                   description: 'KPIs + mapa + feed' },
      { label: 'Alertas',           href: '/policia/alertas',           description: 'Tabla con urgencias' },
      { label: 'Detalle de alerta', href: '/policia/alerta/ALT-0847',   description: 'Folio #A-7F4C2' },
      { label: 'Reportes directos', href: '/policia/reportes',          description: '9 reportes activos' },
      { label: 'Estadísticas',      href: '/policia/estadisticas',      description: 'Embudo + heatmap' },
    ] as NavItem[],
  },
  {
    id: 'puente',
    label: 'Vista Jueces',
    color: 'var(--color-calm-500)',
    bgColor: 'var(--color-calm-50)',
    items: [
      { label: 'Pantalla puente', href: '/puente', description: 'Doble portal + BridgeWires' },
    ] as NavItem[],
  },
];

export default function Jumper() {
  const router   = useRouter();
  const pathname = usePathname();
  const { jumperOpen, setJumperOpen } = useAnclaStore();

  function navigate(href: string) {
    router.push(href);
    setJumperOpen(false);
  }

  return (
    <>
      {/* Trigger button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setJumperOpen(!jumperOpen)}
        aria-label="Navegación de demo"
        aria-expanded={jumperOpen}
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 'var(--z-jumper)' as never,
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: jumperOpen ? 'var(--color-gray-800)' : 'var(--color-sage-700)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}
      >
        <AnimatePresence mode="wait">
          {jumperOpen ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X size={20} />
            </motion.span>
          ) : (
            <motion.span key="nav" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Compass size={20} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {jumperOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setJumperOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.25)',
                backdropFilter: 'blur(4px)',
                zIndex: 299,
              }}
            />

            {/* Drawer */}
            <motion.div
              key="panel"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: 320,
                background: 'var(--color-white)',
                zIndex: 'var(--z-jumper)' as never,
                overflowY: 'auto',
                boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '20px 24px 16px',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <Navigation size={18} color="var(--color-sage-600, #4a6148)" />
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                    Navegador de demo
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-body)' }}>
                    Acceso directo a todas las pantallas
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div style={{ padding: '12px 16px', flex: 1 }}>
                {sections.map((section, si) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: si * 0.06 }}
                    style={{ marginBottom: 20 }}
                  >
                    {/* Section header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 10px',
                        borderRadius: 8,
                        backgroundColor: section.bgColor,
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: section.color,
                        }}
                      />
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          fontFamily: 'var(--font-body)',
                          color: section.color,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {section.label}
                      </span>
                    </div>

                    {/* Items */}
                    {section.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <motion.button
                          key={item.href}
                          onClick={() => navigate(item.href)}
                          whileHover={{ x: 3, backgroundColor: section.bgColor }}
                          whileTap={{ scale: 0.98 }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: 8,
                            border: 'none',
                            background: isActive ? section.bgColor : 'transparent',
                            cursor: 'pointer',
                            textAlign: 'left',
                            marginBottom: 2,
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: '0.84rem',
                                fontWeight: isActive ? 600 : 400,
                                fontFamily: 'var(--font-body)',
                                color: isActive ? section.color : 'var(--color-text-primary)',
                              }}
                            >
                              {item.label}
                            </div>
                            {item.description && (
                              <div
                                style={{
                                  fontSize: '0.7rem',
                                  color: 'var(--color-text-tertiary)',
                                  fontFamily: 'var(--font-body)',
                                }}
                              >
                                {item.description}
                              </div>
                            )}
                          </div>
                          {isActive && <ChevronRight size={14} color={section.color} />}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: '12px 24px',
                  borderTop: '1px solid var(--color-border)',
                  fontSize: '0.7rem',
                  color: 'var(--color-text-tertiary)',
                  fontFamily: 'var(--font-mono)',
                  textAlign: 'center',
                }}
              >
                ANCLA · Demo · {new Date().getFullYear()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
