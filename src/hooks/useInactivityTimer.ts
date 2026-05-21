'use client';

import { useEffect, useRef } from 'react';
import { useAnclaStore } from '@/lib/store';

const INACTIVITY_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Clears the chat session after 15 minutes of no user activity.
 * Mount this hook once inside any chat page component.
 */
export function useInactivityTimer() {
  const lastActivity = useAnclaStore((s) => s.lastActivity);
  const clearSession = useAnclaStore((s) => s.clearSession);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!lastActivity) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      clearSession();
    }, INACTIVITY_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [lastActivity, clearSession]);
}
