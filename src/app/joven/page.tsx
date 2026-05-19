'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import AnclaArt from '@/components/brand/AnclaArt';
import AnclaLogo from '@/components/brand/AnclaLogo';
import { ArrowRight, EyeOff, ExternalLink } from 'lucide-react';

export default function BienvenidaPage() {
  const router   = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: isMobile ? 'column' : 'row', overflow: 'hidden' }}>
      {/* Left — AnclaArt illustration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0 }}
        style={{
          width: isMobile ? '100%' : '50%',
          height: isMobile ? 280 : '100vh',
          flexShrink: 0,
          position: isMobile ? 'relative' : 'sticky',
          top: 0,
          background: 'linear-gradient(160deg, var(--color-sage-50) 0%, var(--color-calm-50) 60%, var(--color-sand-50) 100%)',
        }}
      >
        <AnclaArt width="100%" height="100%" />
      </motion.div>

      {/* Right — content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: isMobile ? '32px 24px 48px' : '48px 64px', overflowY: 'auto', minHeight: isMobile ? 'auto' : '100vh', position: 'relative' }}>

        {/* Modo silencioso — top right of content pane */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          style={{ position: 'absolute', top: isMobile ? 16 : 24, right: isMobile ? 16 : 32 }}
        >
          <button
            onClick={() => router.push('/joven/silencioso')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 999, background: 'var(--color-gray-100)', border: '1px solid var(--color-border-subtle)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}
          >
            <EyeOff size={13} /> Modo silencioso
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          style={{ maxWidth: 480 }}
        >
          {/* Logo */}
          <div style={{ marginBottom: 32 }}>
            <AnclaLogo size="lg" animated />
          </div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.25, marginBottom: 16 }}
          >
            Cuando algo no{' '}
            <em style={{ fontStyle: 'normal', color: 'var(--color-terra-500)' }}>está bien</em>
            {', '}aquí estás{' '}
            <em style={{ fontStyle: 'normal', color: 'var(--color-calm-500)' }}>seguro/a</em>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}
            style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: 40, fontFamily: 'var(--font-body)' }}
          >
            Lo que compartas aquí es privado. Nadie puede ver tus conversaciones.
            ANA te acompaña paso a paso, sin juzgarte.
          </motion.p>

          {/* Primary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            style={{ marginBottom: 32 }}
          >
            <motion.button
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/joven/termometro')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: 'var(--color-calm-500)', color: 'white', border: 'none', borderRadius: 999, padding: '15px 40px', fontSize: '1.05rem', fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--shadow-calm)', width: '100%' }}
            >
              Entrar <ArrowRight size={20} />
            </motion.button>
          </motion.div>

          {/* Secondary links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 16, paddingBottom: 32 }}
          >
            {[
              { label: 'Métodos de relajación', href: '/joven/regulacion' },
              { label: 'Ejercicio de respiración', href: '/joven/respiracion' },
            ].map((link) => (
              <button
                key={link.href}
                onClick={() => router.push(link.href)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '0.875rem', fontFamily: 'var(--font-body)', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3, padding: 0, transition: 'color 200ms' }}
                onMouseEnter={(e) => { (e.currentTarget.style.color = 'var(--color-calm-500)'); }}
                onMouseLeave={(e) => { (e.currentTarget.style.color = 'var(--color-text-secondary)'); }}
              >
                {link.label}
              </button>
            ))}
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            style={{ paddingTop: 24, borderTop: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}
          >
            <button
              onClick={() => router.push('/puente')}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', fontSize: '0.78rem', fontFamily: 'var(--font-body)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, padding: 0 }}
            >
              <ExternalLink size={13} /> Vista para jueces
            </button>
            <button
              onClick={() => router.push('/policia')}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', fontSize: '0.78rem', fontFamily: 'var(--font-body)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, padding: 0 }}
            >
              <ExternalLink size={13} /> Acceso institucional
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
