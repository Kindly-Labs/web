import { NextResponse } from 'next/server';

export interface CheckResult {
  name: string;
  site: 'backend' | 'auralnet' | 'aether' | 'console';
  status: 'pass' | 'fail' | 'warn';
  latencyMs: number;
  error?: string;
  details?: Record<string, unknown>;
}

export interface StatusCheckResponse {
  checks: CheckResult[];
  timestamp: string;
  overall: 'healthy' | 'degraded' | 'unhealthy';
}

const BACKEND_URL = process.env.BACKEND_URL || 'https://api.cogito.cv';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

const SITES = {
  auralnet: 'https://www.kindly-labs.org',
  aether: 'https://aether.kindly-labs.org',
  console: 'https://app.kindly-labs.org',
};

async function checkEndpoint(
  url: string,
  name: string,
  site: CheckResult['site'],
  options?: RequestInit
): Promise<CheckResult> {
  const start = performance.now();
  try {
    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    const latencyMs = Math.round(performance.now() - start);

    if (response.ok) {
      let details: Record<string, unknown> | undefined;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          details = await response.json();
        }
      } catch {
        // Ignore JSON parse errors
      }
      return { name, site, status: 'pass', latencyMs, details };
    }

    return {
      name,
      site,
      status: response.status >= 500 ? 'fail' : 'warn',
      latencyMs,
      error: `HTTP ${response.status}`,
    };
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      name,
      site,
      status: 'fail',
      latencyMs,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkSiteReachable(
  url: string,
  name: string,
  site: CheckResult['site']
): Promise<CheckResult> {
  const start = performance.now();
  try {
    // Use HEAD request to check if site is reachable
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000),
    });
    const latencyMs = Math.round(performance.now() - start);

    if (response.ok || response.status === 304) {
      return { name, site, status: 'pass', latencyMs };
    }

    // Redirect is okay for site checks
    if (response.status >= 300 && response.status < 400) {
      return { name, site, status: 'pass', latencyMs };
    }

    return {
      name,
      site,
      status: response.status >= 500 ? 'fail' : 'warn',
      latencyMs,
      error: `HTTP ${response.status}`,
    };
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      name,
      site,
      status: 'fail',
      latencyMs,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkSession(): Promise<CheckResult> {
  const start = performance.now();
  try {
    const response = await fetch(`${BACKEND_URL}/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: `status-check-${Date.now()}`,
        userAgent: 'StatusCheck/1.0',
      }),
      signal: AbortSignal.timeout(10000),
    });
    const latencyMs = Math.round(performance.now() - start);

    if (response.ok) {
      const data = await response.json();
      return {
        name: 'Session Creation',
        site: 'aether',
        status: 'pass',
        latencyMs,
        details: { sessionId: data.id || data.sessionId },
      };
    }

    return {
      name: 'Session Creation',
      site: 'aether',
      status: 'fail',
      latencyMs,
      error: `HTTP ${response.status}`,
    };
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      name: 'Session Creation',
      site: 'aether',
      status: 'fail',
      latencyMs,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkWebSocket(): Promise<CheckResult> {
  // WebSocket checks from server-side are limited
  // We check if the upgrade endpoint responds correctly
  const start = performance.now();
  try {
    const response = await fetch(`${BACKEND_URL}/session/stream`, {
      method: 'GET',
      headers: {
        Connection: 'Upgrade',
        Upgrade: 'websocket',
        'Sec-WebSocket-Version': '13',
        'Sec-WebSocket-Key': 'dGhlIHNhbXBsZSBub25jZQ==',
      },
      signal: AbortSignal.timeout(5000),
    });
    const latencyMs = Math.round(performance.now() - start);

    // WebSocket upgrade should return 101 or connection-related response
    // From server-side we might get 400 (Bad Request) which is expected
    // since we're not doing a real WS handshake
    if (response.status === 101 || response.status === 400 || response.status === 426) {
      return {
        name: 'WebSocket Endpoint',
        site: 'aether',
        status: 'pass',
        latencyMs,
        details: { note: 'Endpoint reachable' },
      };
    }

    return {
      name: 'WebSocket Endpoint',
      site: 'aether',
      status: response.status >= 500 ? 'fail' : 'warn',
      latencyMs,
      error: `HTTP ${response.status}`,
    };
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    // Connection errors are expected when WS upgrade fails
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';

    // If we get a connection reset or similar, the endpoint exists
    if (errorMsg.includes('reset') || errorMsg.includes('ECONNRESET')) {
      return {
        name: 'WebSocket Endpoint',
        site: 'aether',
        status: 'pass',
        latencyMs,
        details: { note: 'Endpoint reachable (connection reset expected)' },
      };
    }

    return {
      name: 'WebSocket Endpoint',
      site: 'aether',
      status: 'fail',
      latencyMs,
      error: errorMsg,
    };
  }
}

export async function GET() {
  const authHeader = `Basic ${Buffer.from(`${ADMIN_USER}:${ADMIN_PASSWORD}`).toString('base64')}`;

  const checks = await Promise.all([
    // Backend health checks
    checkEndpoint(`${BACKEND_URL}/health`, 'Health Endpoint', 'backend'),
    checkEndpoint(`${BACKEND_URL}/admin/api/info`, 'Admin Auth', 'backend', {
      headers: { Authorization: authHeader },
    }),
    checkEndpoint(`${BACKEND_URL}/admin/api/services`, 'Services Registry', 'backend', {
      headers: { Authorization: authHeader },
    }),

    // Site reachability
    checkSiteReachable(SITES.auralnet, 'Site Reachable', 'auralnet'),
    checkSiteReachable(SITES.aether, 'Site Reachable', 'aether'),
    checkSiteReachable(SITES.console, 'Site Reachable', 'console'),

    // Workflow checks
    checkSession(),
    checkWebSocket(),

    // Admin Console specific checks
    checkEndpoint(`${BACKEND_URL}/admin/api/cockpit/metrics`, 'Cockpit Metrics', 'console', {
      headers: { Authorization: authHeader },
    }),
    checkEndpoint(`${BACKEND_URL}/admin/api/sessions`, 'Sessions API', 'console', {
      headers: { Authorization: authHeader },
    }),
  ]);

  // Calculate overall status
  const failCount = checks.filter((c) => c.status === 'fail').length;
  const warnCount = checks.filter((c) => c.status === 'warn').length;

  let overall: StatusCheckResponse['overall'] = 'healthy';
  if (failCount > 0) {
    overall = 'unhealthy';
  } else if (warnCount > 0) {
    overall = 'degraded';
  }

  const response: StatusCheckResponse = {
    checks,
    timestamp: new Date().toISOString(),
    overall,
  };

  return NextResponse.json(response);
}
