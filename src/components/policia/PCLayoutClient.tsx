'use client';

import { useState, useEffect, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import useMediaQuery from '@mui/material/useMediaQuery';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, AlertTriangle, Heart, BarChart3, Users, Menu, X, Bell, LogOut } from 'lucide-react';
import AnclaLogo from '@/components/brand/AnclaLogo';
import Jumper from '@/components/nav/Jumper';
import { logoutPolicia } from '@/actions/auth';
import { getDashboardData } from '@/actions/policia';
import { createClient } from '@/lib/supabase/client';

const SIDEBAR_BG = '#2c3e50';
const SIDEBAR_W  = 280;
const TOP_H      = 56;

const NAV_BASE = [
  { href: '/policia',              label: 'Dashboard',           icon: LayoutDashboard, badgeKey: null as null | 'alertasActivas' | 'totalReportes', exact: true  },
  { href: '/policia/alertas',      label: 'Alertas',             icon: AlertTriangle,   badgeKey: 'alertasActivas' as const,                         exact: false },
  { href: '/policia/reportes',     label: 'Reportes directos',   icon: Heart,           badgeKey: 'totalReportes' as const,                          exact: false },
  { href: '/policia/perfiles',     label: 'Perfiles de agresores', icon: Users,         badgeKey: null,                                              exact: false },
  { href: '/policia/estadisticas', label: 'Estadísticas',        icon: BarChart3,       badgeKey: null,                                              exact: false },
];

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname.startsWith(href);
}

function NavItem({ item, pathname, router, onNav, badge }: {
  item: typeof NAV_BASE[0];
  pathname: string;
  router: ReturnType<typeof useRouter>;
  onNav?: () => void;
  badge: number | null;
}) {
  const active = isActive(pathname, item.href, item.exact);
  return (
    <button
      onClick={() => { router.push(item.href); onNav?.(); }}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '11px 20px', border: 'none', cursor: 'pointer', textAlign: 'left',
        background: active ? 'rgba(255,255,255,0.10)' : 'transparent',
        borderLeft: `3px solid ${active ? '#5b81a8' : 'transparent'}`,
        transition: 'all 200ms',
      }}
      onMouseEnter={(e) => { if (!active) (e.currentTarget.style.background = 'rgba(255,255,255,0.06)'); }}
      onMouseLeave={(e) => { if (!active) (e.currentTarget.style.background = 'transparent'); }}
    >
      <item.icon size={18} color={active ? '#9ab7d5' : '#8aaac4'} />
      <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: active ? 600 : 400, color: active ? '#dce8f0' : '#8aaac4', transition: 'color 200ms' }}>
        {item.label}
      </span>
      {badge !== null && badge > 0 && (
        <span style={{
          background: item.href.includes('reportes') ? '#6b7f5e' : '#bf6b4a',
          color: 'white', borderRadius: 999, padding: '2px 7px',
          fontSize: '0.65rem', fontFamily: 'var(--font-mono)', fontWeight: 700, flexShrink: 0,
        }}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}

function SidebarContent({ pathname, router, agentName, onNav, alertasActivas, totalReportes }: {
  pathname: string;
  router: ReturnType<typeof useRouter>;
  agentName: string;
  onNav?: () => void;
  alertasActivas: number;
  totalReportes: number;
}) {
  const [isPending, startTransition] = useTransition();
  const initials = agentName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  const badges: Record<string, number | null> = {
    alertasActivas,
    totalReportes,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: SIDEBAR_BG }}>
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <AnclaLogo size="sm" color="#dce8f0" />
        <div style={{ marginTop: 6, fontSize: '0.68rem', color: '#6889a8', fontFamily: 'var(--font-body)', letterSpacing: '0.04em' }}>
          Policía Cibernética · Nayarit
        </div>
      </div>

      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {NAV_BASE.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            pathname={pathname}
            router={router}
            onNav={onNav}
            badge={item.badgeKey ? (badges[item.badgeKey] ?? null) : null}
          />
        ))}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#3d5e81', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ab7d5', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#dce8f0', fontFamily: 'var(--font-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {agentName}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#8aaac4', fontFamily: 'var(--font-mono)' }}>
              {totalReportes} reportes activos
            </div>
          </div>
          <button
            onClick={() => startTransition(() => logoutPolicia())}
            disabled={isPending}
            title="Cerrar sesión"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6889a8', padding: 4, flexShrink: 0, opacity: isPending ? 0.5 : 1 }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PCLayoutClient({ children, agentName }: { children: React.ReactNode; agentName: string }) {
  const pathname = usePathname();
  const router   = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [open,            setOpen]            = useState(false);
  const [alertasActivas,  setAlertasActivas]  = useState(0);
  const [totalReportes,   setTotalReportes]   = useState(0);

  useEffect(() => {
    getDashboardData().then((d) => {
      setAlertasActivas(d.alertasActivas);
      setTotalReportes(d.totalReportes);
    });
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const ch = supabase
      .channel('sidebar-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alertas' }, () => {
        getDashboardData().then((d) => setAlertasActivas(d.alertasActivas));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reportes_directos' }, () => {
        getDashboardData().then((d) => setTotalReportes(d.totalReportes));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  if (pathname === '/policia/login') return <>{children}<Jumper /></>;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <div style={{ width: SIDEBAR_W, flexShrink: 0 }}>
          <SidebarContent pathname={pathname} router={router} agentName={agentName} alertasActivas={alertasActivas} totalReportes={totalReportes} />
        </div>
      )}

      {/* Mobile top bar */}
      {isMobile && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: TOP_H, background: SIDEBAR_BG, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12 }}>
          <button onClick={() => setOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dce8f0', display: 'flex', padding: 4 }} aria-label="Abrir menú">
            <Menu size={22} />
          </button>
          <AnclaLogo size="sm" color="#dce8f0" />
          <div style={{ marginLeft: 'auto', position: 'relative', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Bell size={18} color="#dce8f0" />
            <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: '#bf6b4a', border: '1.5px solid #2c3e50' }} />
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobile && open && (
          <>
            <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 250, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
            <motion.div key="dr" initial={{ x: -SIDEBAR_W }} animate={{ x: 0 }} exit={{ x: -SIDEBAR_W }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: SIDEBAR_W, zIndex: 260 }}>
              <SidebarContent pathname={pathname} router={router} agentName={agentName} onNav={() => setOpen(false)} alertasActivas={alertasActivas} totalReportes={totalReportes} />
              <button onClick={() => setOpen(false)} aria-label="Cerrar menú"
                style={{ position: 'absolute', top: 16, right: -44, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={18} color="white" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Content */}
      <main style={{ flex: 1, overflowY: 'auto', marginTop: isMobile ? TOP_H : 0, background: 'var(--color-gray-50)' }}>
        {children}
      </main>

      <Jumper />
    </div>
  );
}
