import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

const baseConfig: NextConfig = {
  reactCompiler: true,
};

// withPWA injects webpack plugins into the config object.
// Turbopack (used by `next dev`) sees that and errors even when the SW is disabled.
// Only wrap with PWA in production builds — `next build --webpack` generates the SW.
const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  workboxOptions: { disableDevLogs: true },
});

export default process.env.NODE_ENV === 'production'
  ? withPWA(baseConfig)
  : baseConfig;
