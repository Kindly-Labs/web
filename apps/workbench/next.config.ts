import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@owly-labs/api-client', '@owly-labs/ui-kit'],
};

export default nextConfig;
