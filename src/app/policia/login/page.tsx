'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAnclaStore } from '@/lib/store';
import { Shield, Eye, EyeOff, Lock } from 'lucide-react';
import AnclaLogo from '@/components/brand/AnclaLogo';
import useMediaQuery from '@mui/material/useMediaQuery';

export default function PCLoginPage() {
  const router      = useRouter();
  const isMobile    = useMediaQuery('(max-width: 768px)');
  const { setPcAuthenticated } = useAnclaStore();
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setPcAuthenticated(true);
    router.push('/policia');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
      {/* Left — dark branding panel */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        style={{
          width: isMobile ? '100%' : '50%',
          minHeight: isMobile ? 200 : '100vh',
          background: '#2c3e50',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 48px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background pattern */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ position: 'absolute', width: 200, height: 200, border: '1px solid #9ab7d5', borderRadius: '50%', top: `${i * 15}%`, left: `${i * 12 - 20}%` }} />
          ))}
        </div>

        <div style={{ position: 'relative', textAlign: isMobile ? 'center' : 'left', maxWidth: 360 }}>
          <AnclaLogo size="lg" color="#dce8f0" />
          <div style={{ marginTop: 24 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, color: '#dce8f0', lineHeight: 1.3, marginBottom: 8 }}>
              Policía Cibernética
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: '#8aaac4', lineHeight: 1.6 }}>
              Sistema de monitoreo y protección contra el grooming digital en Nayarit.
            </div>
          </div>

          {!isMobile && (
            <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                '247 alertas activas en monitoreo',
                '34 agresores identificados',
                'Cifrado de extremo a extremo',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#5b81a8', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#6889a8' }}>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Right — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', background: 'white' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{ width: '100%', maxWidth: 400 }}
        >
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6 }}>
              Acceso institucional
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Sistema ANCLA — Policía Cibernética Nayarit
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                Correo institucional
              </label>
              <input
                type="email"
                defaultValue="morales@policiacibernetica.gob.mx"
                readOnly
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 10,
                  border: '1.5px solid var(--color-border)', background: 'var(--color-gray-50)',
                  fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--color-text-secondary)',
                  boxSizing: 'border-box', outline: 'none',
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  defaultValue="Ancla2025#Segura"
                  readOnly
                  style={{
                    width: '100%', padding: '11px 44px 11px 14px', borderRadius: 10,
                    border: '1.5px solid var(--color-border)', background: 'var(--color-gray-50)',
                    fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--color-text-secondary)',
                    boxSizing: 'border-box', outline: 'none',
                  }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', padding: 0 }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* MFA Token */}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                Token MFA
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  defaultValue="847-291"
                  readOnly
                  style={{
                    width: '100%', padding: '11px 14px 11px 44px', borderRadius: 10,
                    border: '1.5px solid var(--color-calm-300)', background: 'var(--color-calm-50)',
                    fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 600,
                    color: 'var(--color-calm-700)', letterSpacing: '0.1em',
                    boxSizing: 'border-box', outline: 'none', textAlign: 'center',
                  }}
                />
                <Lock size={15} color="var(--color-calm-400)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--color-text-tertiary)', marginTop: 4 }}>
                Token pre-rellenado para demo. Válido por 28s.
              </p>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.01 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: loading ? 'var(--color-night-500)' : '#2c3e50',
                color: 'white', border: 'none', borderRadius: 999,
                padding: '13px 28px', fontSize: '0.95rem',
                fontFamily: 'var(--font-body)', fontWeight: 600, cursor: loading ? 'default' : 'pointer',
                transition: 'all 200ms', marginTop: 4,
              }}
            >
              <Shield size={17} />
              {loading ? 'Verificando...' : 'Iniciar sesión'}
            </motion.button>

            <button type="button" style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', fontSize: '0.8rem', fontFamily: 'var(--font-body)', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3, padding: 0, textAlign: 'center' }}>
              ¿Olvidaste tu contraseña?
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
