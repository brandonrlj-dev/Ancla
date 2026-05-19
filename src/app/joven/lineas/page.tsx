'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Phone, ExternalLink, ChevronLeft, ChevronDown } from 'lucide-react';

const LINEAS = [
  {
    name: 'Guardia Nacional',
    phone: '088',
    hours: '24/7 · sin costo',
    type: 'phone',
    desc: 'Línea de emergencias nacionales. Reporta delitos cibernéticos en curso o amenazas inmediatas.',
    guion: `Hola, llamo a la línea 088 para reportar un caso de extorsión digital en contra de un menor de edad.

El agresor tiene material íntimo y amenaza con difundirlo. Tengo un reporte folio ANCLA #A-7F4C2 con capturas y hashes verificables.

¿Pueden orientarme sobre los pasos a seguir o transferirme con la Policía Cibernética?`,
  },
  {
    name: 'Policía Cibernética',
    phone: 'policiacibernetica@ssc.cdmx.gob.mx',
    hours: 'Lun-Vie · 8h-20h',
    type: 'email',
    desc: 'Unidad especializada en delitos digitales. Acepta reportes por correo con evidencia adjunta.',
    guion: `Buen día, quiero reportar un caso activo de sextorsión.

Soy víctima de extorsión digital. El agresor (usuario @kevindiaz_mx en Instagram) tiene imágenes íntimas mías y exige dinero para no difundirlas.

Adjunto el reporte ANCLA #A-7F4C2 con capturas, conversaciones y hashes SHA-256 de la evidencia.

Solicito que se inicie una investigación.`,
  },
  {
    name: 'CEAV',
    phone: '800 842 84 62',
    hours: '24/7 · gratuito',
    type: 'phone',
    desc: 'Comisión Ejecutiva de Atención a Víctimas. Apoyo psicológico, jurídico y económico para víctimas.',
    guion: `Hola, soy víctima de extorsión sexual en línea y necesito orientación.

Un tercero tiene imágenes íntimas mías y me amenaza. Quiero saber qué derechos tengo como víctima y si pueden asignarme un asesor jurídico.

Tengo documentación digital del caso generada por ANCLA.`,
  },
  {
    name: 'CyberTipline · NCMEC',
    phone: 'cybertipline.org',
    hours: 'Reporte 24/7 · internacional',
    type: 'web',
    desc: 'Centro Nacional para Menores Desaparecidos y Explotados. Ideal para reportar material de abuso en plataformas globales.',
    guion: `I want to report online sexual exploitation (sextortion) involving a minor.

The perpetrator (Instagram: @kevindiaz_mx) possesses intimate images and is threatening to distribute them unless paid.

I have a documented ANCLA report with SHA-256 verified evidence. The incident is ongoing.`,
  },
] as const;

export default function LineasPage() {
  const router   = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-background)' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 56, borderBottom: '1px solid var(--color-border-subtle)', background: 'rgba(250,249,247,0.95)', backdropFilter: 'blur(12px)', flexShrink: 0 }}>
        <button onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', fontSize: '0.82rem', padding: 0 }}>
          <ChevronLeft size={16} /> Atrás
        </button>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Líneas de atención
        </div>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ flex: 1, padding: isMobile ? '24px 20px' : '40px 48px', maxWidth: 780, margin: '0 auto', width: '100%' }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 10 }}>
            Personas reales · respuesta inmediata
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 4vw, 1.85rem)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 10 }}>
            Aquí hay alguien que puede ayudarte
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.65, maxWidth: 560 }}>
            Todas estas líneas son gratuitas y confidenciales. El guión de abajo te dice exactamente qué decir para no perder tiempo.
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {LINEAS.map((l, i) => (
            <motion.div
              key={l.name}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              style={{ background: 'white', borderRadius: 18, border: '1px solid var(--color-border-subtle)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}
            >
              {/* Card top */}
              <div style={{ padding: '22px 24px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                      {l.name}
                    </h2>
                    <div style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 999, background: 'var(--color-gray-100)', fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--color-text-tertiary)', letterSpacing: '0.05em' }}>
                      {l.hours}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
                    {l.type === 'phone' ? l.phone : ''}
                  </div>
                </div>

                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.83rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                  {l.desc}
                </p>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {l.type === 'phone' && (
                    <a
                      href={`tel:${l.phone.replace(/\s/g, '')}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 999, background: 'var(--color-terra-500)', color: 'white', textDecoration: 'none', fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600 }}
                    >
                      <Phone size={14} /> Llamar ahora
                    </a>
                  )}
                  {l.type === 'email' && (
                    <a
                      href={`mailto:${l.phone}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 999, background: 'var(--color-terra-500)', color: 'white', textDecoration: 'none', fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600 }}
                    >
                      <ExternalLink size={14} /> Enviar correo
                    </a>
                  )}
                  {l.type === 'web' && (
                    <a
                      href={`https://${l.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 999, background: 'var(--color-terra-500)', color: 'white', textDecoration: 'none', fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600 }}
                    >
                      <ExternalLink size={14} /> Ir al sitio
                    </a>
                  )}
                </div>
              </div>

              {/* Script accordion */}
              <details style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
                <summary style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500, listStyle: 'none', userSelect: 'none' }}>
                  <span>Qué decir cuando contesten</span>
                  <ChevronDown size={15} color="var(--color-text-tertiary)" />
                </summary>
                <div style={{ padding: '4px 24px 20px' }}>
                  <div style={{ background: 'var(--color-calm-50)', border: '1px solid var(--color-calm-200)', borderRadius: 12, padding: '16px 18px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-calm-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                      Guión sugerido
                    </div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-text-primary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                      {l.guion}
                    </p>
                  </div>
                </div>
              </details>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-tertiary)', textAlign: 'center', marginTop: 32, lineHeight: 1.6 }}
        >
          Tu llamada es anónima. No necesitas dar tu nombre completo para recibir orientación.
        </motion.p>
      </div>
    </div>
  );
}
