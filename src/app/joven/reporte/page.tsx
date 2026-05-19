'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Download, Copy, Send, CheckCircle, Phone, ChevronLeft, ExternalLink } from 'lucide-react';

const FOLIO = 'A-7F4C2';
const HASH  = 'sha256:e3b0c44298fc1c149afb...f855a141290';
const DATE  = '1 may 2026 · 19:47';

const AUTHORITY_MSG = `Estimada autoridad:

Adjunto el reporte #${FOLIO} generado por ANCLA, sistema de apoyo a víctimas de extorsión digital.

La víctima (menor de edad) reporta sextorsión activa desde el 28 de abril de 2026. Los materiales incluyen capturas de conversaciones en Instagram y WhatsApp donde el agresor exige dinero bajo amenaza de difundir imágenes íntimas.

Los hashes de integridad SHA-256 han sido registrados automáticamente para preservar la cadena de custodia digital.

Solicito atención prioritaria.

ANCLA · ancla.org`;

export default function ReportePage() {
  const router   = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [email,  setEmail]  = useState('');
  const [copied, setCopied] = useState(false);
  const [sent,   setSent]   = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(AUTHORITY_MSG);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  function handleSend() {
    setSent(true);
  }

  /* ── Sent confirmation ── */
  if (sent) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-background)', padding: '40px 24px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--color-calm-50)', border: '2px solid var(--color-calm-300)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={38} color="var(--color-calm-500)" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 12 }}>
            Reporte enviado
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: 1.65, maxWidth: 380, margin: '0 auto 40px' }}>
            La Policía Cibernética recibió tu reporte #{FOLIO}. Pueden tardarse hasta 24 horas en responder. Mientras tanto, sigue los pasos que ya revisaste.
          </p>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={() => router.push('/joven/lineas')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 28px', borderRadius: 999, background: 'var(--color-terra-500)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600 }}
            >
              <Phone size={16} /> Ver líneas de atención
            </button>
            <button
              onClick={() => router.push('/joven/regulacion')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 28px', borderRadius: 999, background: 'white', color: 'var(--color-text-secondary)', border: '1.5px solid var(--color-border)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}
            >
              Métodos para calmarme
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Main layout ── */
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-background)' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 56, borderBottom: '1px solid var(--color-border-subtle)', background: 'rgba(250,249,247,0.95)', backdropFilter: 'blur(12px)', flexShrink: 0 }}>
        <button onClick={() => router.push('/joven/acciones')}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', fontSize: '0.82rem', padding: 0 }}>
          <ChevronLeft size={16} /> Atrás
        </button>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Tu reporte ANA
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-text-tertiary)', letterSpacing: '0.06em' }}>
          #{FOLIO}
        </div>
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', padding: '10px 24px', borderBottom: '1px solid var(--color-border-subtle)' }}>
        Paso 5 de 5
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 0, maxWidth: 1100, margin: '0 auto', width: '100%' }}>

        {/* ── Left sidebar ── */}
        <div style={{ width: isMobile ? '100%' : 340, flexShrink: 0, padding: isMobile ? '24px 20px' : '32px 32px', borderRight: isMobile ? 'none' : '1px solid var(--color-border-subtle)', borderBottom: isMobile ? '1px solid var(--color-border-subtle)' : 'none', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Download PDF */}
          <button
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 20px', borderRadius: 14, background: 'var(--color-text-primary)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600, width: '100%', justifyContent: 'center' }}
          >
            <Download size={17} /> Descargar PDF
          </button>

          {/* Authority message */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--color-border-subtle)', padding: '18px 18px 14px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 10 }}>
              Mensaje para autoridades
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.65, whiteSpace: 'pre-line', marginBottom: 14 }}>
              {AUTHORITY_MSG}
            </p>
            <button
              onClick={handleCopy}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 999, background: copied ? 'var(--color-calm-50)' : 'var(--color-gray-100)', border: `1.5px solid ${copied ? 'var(--color-calm-300)' : 'var(--color-border)'}`, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: copied ? 'var(--color-calm-600)' : 'var(--color-text-secondary)', transition: 'all 200ms', width: '100%', justifyContent: 'center' }}
            >
              {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
              {copied ? 'Copiado' : 'Copiar mensaje'}
            </button>
          </div>

          {/* Send to police */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--color-border-subtle)', padding: '18px 18px 18px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 10 }}>
              Enviar a Policía Cibernética
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>
              ANCLA enviará el reporte con hash verificable por correo oficial.
            </p>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="opcional@correo.com"
              style={{ width: '100%', padding: '9px 14px', borderRadius: 10, border: '1.5px solid var(--color-border)', background: 'var(--color-gray-50)', fontFamily: 'var(--font-body)', fontSize: '0.82rem', outline: 'none', color: 'var(--color-text-primary)', marginBottom: 12, boxSizing: 'border-box' }}
            />
            <button
              onClick={handleSend}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 999, background: 'var(--color-terra-500)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 600, width: '100%', justifyContent: 'center' }}
            >
              <Send size={15} /> Enviar reporte
            </button>
          </div>

          {/* Lines button */}
          <button
            onClick={() => router.push('/joven/lineas')}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '11px 20px', borderRadius: 999, background: 'white', border: '1.5px solid var(--color-border)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', justifyContent: 'center' }}
          >
            <Phone size={15} /> Ver líneas de atención
          </button>
        </div>

        {/* ── Report document ── */}
        <div style={{ flex: 1, padding: isMobile ? '24px 20px' : '32px 40px', overflowY: 'auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{ background: 'white', borderRadius: 20, border: '1px solid var(--color-border-subtle)', boxShadow: '0 4px 32px rgba(0,0,0,0.06)', overflow: 'hidden' }}
          >
            {/* Document header */}
            <div style={{ background: 'var(--color-text-primary)', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'white', letterSpacing: '-0.01em', marginBottom: 4 }}>
                  ANCLA
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Reporte de extorsión digital
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'white', marginBottom: 2 }}>
                  #{FOLIO}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'rgba(255,255,255,0.5)' }}>
                  {DATE}
                </div>
              </div>
            </div>

            <div style={{ padding: '28px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Hash integrity */}
              <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--color-calm-50)', border: '1px solid var(--color-calm-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-calm-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
                    Hash de integridad
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-text-primary)', wordBreak: 'break-all' }}>
                    {HASH}
                  </div>
                </div>
                <div style={{ padding: '4px 10px', borderRadius: 999, background: 'var(--color-calm-100)', border: '1px solid var(--color-calm-300)', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--color-calm-700)', whiteSpace: 'nowrap' }}>
                  Verificado
                </div>
              </div>

              {/* Fields */}
              {[
                { label: 'Plataforma', value: 'Instagram · WhatsApp' },
                { label: 'Tipo', value: 'Sextorsión — amenaza de difusión' },
                { label: 'Fecha inicio', value: '28 de abril de 2026' },
                { label: 'Evidencia adjuntada', value: '6 capturas de pantalla · conversaciones completas' },
              ].map(({ label, value }) => (
                <div key={label} style={{ borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 16 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>
                    {label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                    {value}
                  </div>
                </div>
              ))}

              {/* Patterns */}
              <div style={{ borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 16 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                  Patrones detectados por ANA
                </div>
                {[
                  { n: '01', text: 'Love bombing acelerado — 3 semanas de escalada emocional intensa' },
                  { n: '02', text: 'Solicitud progresiva de material íntimo con chantaje implícito' },
                  { n: '03', text: 'Amenaza directa de difusión a contactos identificados' },
                ].map(({ n, text }) => (
                  <div key={n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-tertiary)', marginTop: 2, flexShrink: 0 }}>{n}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>{text}</div>
                  </div>
                ))}
              </div>

              {/* Aggressor profile */}
              <div style={{ borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 16 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                  Perfil del agresor
                </div>
                {[
                  { k: 'Usuario', v: '@kevindiaz_mx (Instagram)' },
                  { k: 'Tel. WhatsApp', v: '+52 55 XXXX XXXX' },
                  { k: 'País estimado', v: 'México (IP aproximada)' },
                ].map(({ k, v }) => (
                  <div key={k} style={{ display: 'flex', gap: 16, marginBottom: 7 }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text-tertiary)', minWidth: 110 }}>{k}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-primary)' }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Actions taken */}
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                  Acciones ya tomadas
                </div>
                {[
                  'Evidencia descargada y hasheada',
                  'Perfil restringido en Instagram',
                  'Hash subido a StopNCII.org',
                ].map((action, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <CheckCircle size={14} color="var(--color-calm-500)" style={{ flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{action}</span>
                  </div>
                ))}
              </div>

              {/* Footer stamp */}
              <div style={{ marginTop: 8, padding: '14px 18px', borderRadius: 12, background: 'var(--color-gray-50)', border: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--color-text-tertiary)' }}>
                  ANCLA #{FOLIO} · {DATE}
                </div>
                <a
                  href="https://stopncii.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--color-calm-500)', textDecoration: 'none' }}
                >
                  <ExternalLink size={11} /> ancla.org
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
