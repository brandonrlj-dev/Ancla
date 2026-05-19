'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import AnclaLogo from '@/components/brand/AnclaLogo';

interface JovenHeaderProps {
  title?: string;
  showBack?: boolean;
  rightSlot?: React.ReactNode;
}

export default function JovenHeader({ title, showBack = true, rightSlot }: JovenHeaderProps) {
  const router = useRouter();

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-overlay)' as never,
        background: 'rgba(250,249,247,0.90)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border-subtle)',
        padding: '0 20px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {showBack && (
        <button
          onClick={() => router.back()}
          aria-label="Volver"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
            transition: 'background 200ms',
          }}
          onMouseEnter={(e) => ((e.target as HTMLElement).closest('button')!.style.background = 'var(--color-gray-100)')}
          onMouseLeave={(e) => ((e.target as HTMLElement).closest('button')!.style.background = 'transparent')}
        >
          <ArrowLeft size={20} />
        </button>
      )}

      {!showBack && (
        <AnclaLogo size="sm" color="var(--color-sage-700)" />
      )}

      {title && (
        <span
          style={{
            flex: 1,
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}
        >
          {title}
        </span>
      )}

      {rightSlot && (
        <div style={{ marginLeft: 'auto' }}>{rightSlot}</div>
      )}
    </motion.header>
  );
}
