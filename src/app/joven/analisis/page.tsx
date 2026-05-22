'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import RiskShape from '@/components/viz/RiskShape';
import JovenHeader from '@/components/joven/JovenHeader';
import { useAnclaStore } from '@/lib/store';
import { getAnalysisJobResult } from '@/actions/analysis';
import { ShieldCheck, MessageCircle, Lock, Loader2 } from 'lucide-react';
import type { AnalysisResult } from '@/lib/store';

// Human-readable labels for pattern keys returned by ANA / Claude
const PATTERN_LABELS: Record<string, string> = {
  love_bombing:           'Love bombing',
  aislamiento:            'Aislamiento',
  secretismo:             'Secretismo',
  gradualidad_sexual:     'Gradualidad sexual',
  solicitud_imagen:       'Solicitud de imágenes',
  amenaza_difusion:       'Amenaza de difusión',
  presion:                'Presión repetida',
  manipulacion_emocional: 'Manipulación emocional',
};

function labelFor(key: string): string {
  return PATTERN_LABELS[key] ?? key.replace(/_/g, ' ');
}

async function computeHash(input: string): Promise<{ folio: string; hex: string }> {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(input),
  );
  const hex = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return { folio: 'A-' + hex.slice(0, 6).toUpperCase(), hex };
}

export default function AnalisisPage() {
  const router = useRouter();
  const {
    riskLevel,
    analysisPatterns,
    analysisJobId,
    analysisResult,
    setAnalysisResult,
    sessionToken,
    setFolio: storeFolio,
    setHashHex: storeHashHex,
  } = useAnclaStore();

  const [progress, setProgress]     = useState(0);
  const [revealed, setRevealed]     = useState(false);
  const [folio, setFolio]           = useState('');
  const [hashHex, setHashHex]       = useState('');
  const [jobState, setJobState]     = useState<'idle' | 'polling' | 'done' | 'failed'>('idle');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate SHA-256 hash from session token + current patterns (client-side, Web Crypto)
  useEffect(() => {
    const input = sessionToken + analysisPatterns.join(',');
    computeHash(input).then(({ folio: f, hex }) => {
      setFolio(f);
      setHashHex(hex);
      storeFolio(f);
      storeHashHex(hex);
    });
  }, [sessionToken, analysisPatterns, storeFolio, storeHashHex]);

  // Animate risk bar on mount
  useEffect(() => {
    const t = setTimeout(() => {
      setProgress(riskLevel);
      setTimeout(() => setRevealed(true), 900);
    }, 400);
    return () => clearTimeout(t);
  }, [riskLevel]);

  // Poll for deep analysis job result if one is running
  useEffect(() => {
    if (!analysisJobId || analysisResult) return;

    setJobState('polling');

    pollRef.current = setInterval(async () => {
      try {
        const { estado, resultado } = await getAnalysisJobResult({
          jobId: analysisJobId,
          sessionToken,
        });

        if (estado === 'completado' && resultado) {
          setAnalysisResult(resultado as AnalysisResult);
          setJobState('done');
          if (pollRef.current) clearInterval(pollRef.current);
        } else if (estado === 'fallido') {
          setJobState('failed');
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        // Keep polling on transient errors
      }
    }, 3000);

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [analysisJobId, analysisResult, sessionToken, setAnalysisResult]);

  // Merge patterns from ANA conversation + deep analysis job (deduplicated)
  const allPatterns = Array.from(
    new Set([
      ...analysisPatterns,
      ...(analysisResult?.patrones_detectados ?? []),
    ]),
  );

  const faseGrooming = analysisResult?.fase_grooming ?? null;
  const resumen      = analysisResult?.resumen_comportamiento ?? null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-background)' }}>
      <JovenHeader title="Tu análisis" back="/joven/chat" />

      <div style={{ flex: 1, padding: '32px 24px', maxWidth: 680, margin: '0 auto', width: '100%' }}>

        {/* Folio + hash identity */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}
        >
          <Lock size={13} color="var(--color-text-tertiary)" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>
            {folio ? `Folio ${folio} · Cifrado` : 'Generando folio…'}
          </span>
        </motion.div>

        {/* Risk orb + bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, marginBottom: 36 }}
        >
          <RiskShape risk={riskLevel} size={220} breathing />

          <div style={{ width: '100%', maxWidth: 360 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                Nivel de preocupación
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>
                {progress}%
              </span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: 'var(--color-gray-100)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.9, ease: 'easeOut', delay: 0.5 }}
                style={{
                  height: '100%',
                  borderRadius: 999,
                  background: riskLevel <= 25 ? 'var(--color-sage-500)'
                    : riskLevel <= 50 ? 'var(--color-calm-500)'
                    : riskLevel <= 75 ? 'var(--color-sand-500)'
                    : 'var(--color-terra-500)',
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Deep analysis job status */}
        <AnimatePresence>
          {jobState === 'polling' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'var(--color-calm-50)', border: '1px solid var(--color-calm-200)', marginBottom: 20 }}
            >
              <Loader2 size={15} color="var(--color-calm-500)" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-calm-600)' }}>
                Analizando capturas en profundidad…
              </span>
            </motion.div>
          )}
          {resumen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--color-sand-50)', border: '1px solid var(--color-sand-200)', marginBottom: 20 }}
            >
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-body)', marginBottom: 6 }}>
                Resumen del análisis
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {resumen}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pattern chips */}
        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ marginBottom: 32 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                  Patrones detectados
                </h3>
                {faseGrooming && (
                  <span style={{ padding: '2px 10px', borderRadius: 999, background: 'var(--color-terra-100)', border: '1px solid var(--color-terra-200)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--color-terra-700)', whiteSpace: 'nowrap' }}>
                    Fase {faseGrooming} de 5
                  </span>
                )}
              </div>

              {allPatterns.length === 0 ? (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
                  ANA no detectó patrones aún. Continúa la conversación para un análisis más completo.
                </p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {allPatterns.map((p, i) => (
                    <motion.div
                      key={p}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08 }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 999,
                        fontSize: '0.82rem',
                        fontFamily: 'var(--font-body)',
                        fontWeight: 500,
                        background: 'var(--color-terra-100)',
                        color: 'var(--color-terra-700)',
                        border: '1px solid var(--color-terra-200)',
                      }}
                    >
                      ⚠ {labelFor(p)}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* SHA-256 hash */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--color-gray-50)', border: '1px solid var(--color-border)', marginBottom: 28 }}
        >
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-body)', marginBottom: 4 }}>
            Evidencia digital preservada
          </div>
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-text-secondary)', wordBreak: 'break-all' }}>
            {hashHex ? `sha256:${hashHex}` : 'Calculando…'}
          </code>
        </motion.div>

        {/* CTAs */}
        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              <button
                onClick={() => router.push('/joven/reporte')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--color-calm-500)', color: 'white', border: 'none', borderRadius: 999, padding: '13px 28px', fontSize: '0.95rem', fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--shadow-calm)', transition: 'all 250ms' }}
              >
                <ShieldCheck size={18} />
                Generar mi reporte
              </button>
              <button
                onClick={() => router.push('/joven/chat')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'transparent', color: 'var(--color-calm-700)', border: '1.5px solid var(--color-calm-300)', borderRadius: 999, padding: '12px 28px', fontSize: '0.95rem', fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer', transition: 'all 250ms' }}
              >
                <MessageCircle size={18} />
                Seguir hablando con ANA
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
