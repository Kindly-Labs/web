import type { NextConfig } from 'next';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';
const monorepoRoot = path.resolve(__dirname, '../..');

const nextConfig: NextConfig = {
  // Disables the X-Powered-By header for security and cleaner headers
  poweredByHeader: false,

  // Transpile @owly-labs packages from GitHub Packages
  transpilePackages: ['@owly-labs/api-client', '@owly-labs/ui-kit', '@owly-labs/voice-utils'],

  // Configure workspace root for proper module resolution (dev only)
  ...(isDev && {
    turbopack: {
      root: monorepoRoot,
      resolveAlias: {
        picocolors: path.join(monorepoRoot, 'node_modules/picocolors'),
        'source-map-js': path.join(monorepoRoot, 'node_modules/source-map-js'),
      },
    },
  }),
};

export default nextConfig;
