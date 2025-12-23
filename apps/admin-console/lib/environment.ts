// Environment configuration for local vs production control plane

export type Environment = 'local' | 'production';

/**
 * Detect environment from NEXT_PUBLIC_BACKEND_URL or BACKEND_URL
 * If URL contains production domain, return 'production', otherwise 'local'
 */
export function detectEnvironment(): Environment {
  // Check client-side env var first
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';

  // Production indicators
  const productionDomains = ['api.cogito.cv', 'cogito.cv', 'kindly-labs.org'];

  if (productionDomains.some(domain => backendUrl.includes(domain))) {
    return 'production';
  }

  return 'local';
}

// Production URLs for live sites
export const PRODUCTION_CONFIG = {
  api: {
    baseUrl: 'https://api.cogito.cv',
    healthEndpoint: '/health',
    adminEndpoint: '/v1/admin',
    metricsEndpoint: '/v1/admin/cockpit/metrics',
  },
  sites: {
    workbench: {
      name: 'Workbench',
      url: 'https://app.kindly-labs.org',
      description: 'Crowdsourcing Platform',
      icon: 'ClipboardList',
    },
    auralnet: {
      name: 'AuralNet',
      url: 'https://www.kindly-labs.org',
      description: 'B2B Marketing Site',
      icon: 'Building2',
    },
    aether: {
      name: 'Aether PWA',
      url: 'https://aether.kindly-labs.org',
      description: 'Consumer Voice App',
      icon: 'Smartphone',
    },
    api: {
      name: 'Owly API',
      url: 'https://api.cogito.cv',
      description: 'Backend Services',
      icon: 'Server',
    },
  },
} as const;

// Local development URLs
export const LOCAL_CONFIG = {
  api: {
    baseUrl: 'http://localhost:3002',
    healthEndpoint: '/health',
    adminEndpoint: '/admin/api',
    metricsEndpoint: '/admin/api/cockpit/metrics',
  },
  sites: {
    backend: {
      name: 'Backend',
      url: 'http://localhost:3002',
      description: 'Core API & Logic',
      icon: 'Server',
    },
    frontend: {
      name: 'Frontend',
      url: 'http://localhost:3004',
      description: 'Consumer PWA',
      icon: 'Smartphone',
    },
    tts: {
      name: 'TTS',
      url: 'http://localhost:8880',
      description: 'Kokoro Speech Engine',
      icon: 'Activity',
    },
    mlx: {
      name: 'MLX',
      url: 'http://localhost:8000',
      description: 'Local LLM Inference',
      icon: 'Brain',
    },
    langdetect: {
      name: 'Lang Detect',
      url: 'http://localhost:8001',
      description: 'Language Detection',
      icon: 'Languages',
    },
  },
} as const;

export type ProductionSite = keyof typeof PRODUCTION_CONFIG.sites;
export type LocalService = keyof typeof LOCAL_CONFIG.sites;

// Get config based on environment
export function getConfig(env: Environment) {
  return env === 'production' ? PRODUCTION_CONFIG : LOCAL_CONFIG;
}

// Timeout for health checks (10 seconds)
const HEALTH_CHECK_TIMEOUT_MS = 10000;

// Check if we can connect to production
export async function checkProductionHealth(): Promise<{
  healthy: boolean;
  latencyMs: number;
  error?: string;
}> {
  const start = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);

  try {
    const response = await fetch(`${PRODUCTION_CONFIG.api.baseUrl}${PRODUCTION_CONFIG.api.healthEndpoint}`, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });
    const latencyMs = Date.now() - start;

    if (response.ok) {
      return { healthy: true, latencyMs };
    }
    return { healthy: false, latencyMs, error: `Status ${response.status}` };
  } catch (error) {
    const latencyMs = Date.now() - start;
    // AbortError indicates timeout - return degraded status
    if (error instanceof Error && error.name === 'AbortError') {
      return { healthy: false, latencyMs, error: 'Request timeout' };
    }
    return {
      healthy: false,
      latencyMs,
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

// Check individual site health
export async function checkSiteHealth(url: string): Promise<{
  status: 'online' | 'degraded' | 'offline';
  latencyMs: number;
  statusCode?: number;
}> {
  const start = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-store',
      mode: 'no-cors', // Allow cross-origin requests
      signal: controller.signal,
    });
    const latencyMs = Date.now() - start;

    // With no-cors, we can't read the response, but if we get here, the site is reachable
    return {
      status: latencyMs > 2000 ? 'degraded' : 'online',
      latencyMs,
      statusCode: response.status,
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    // AbortError indicates timeout - return degraded (slow but maybe reachable)
    if (error instanceof Error && error.name === 'AbortError') {
      return { status: 'degraded', latencyMs };
    }
    return { status: 'offline', latencyMs };
  } finally {
    clearTimeout(timeoutId);
  }
}
