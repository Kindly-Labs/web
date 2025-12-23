import { NextResponse } from 'next/server';

export interface HealthCheckRecord {
  id: string;
  service_name: string;
  check_time: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'offline';
  latency_ms: number;
  version?: string;
  message?: string;
}

export interface ServiceHistoryResponse {
  service_name: string;
  history: HealthCheckRecord[];
  uptime_percent: number;
  period_hours: number;
}

export interface ServiceUptimeResponse {
  uptimes: Record<string, number>;
  period_hours: number;
  timestamp: string;
}

const BACKEND_URL = process.env.BACKEND_URL || 'https://api.cogito.cv';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const service = searchParams.get('service');
  const hours = searchParams.get('hours') || '24';

  const authHeader = `Basic ${Buffer.from(`${ADMIN_USER}:${ADMIN_PASSWORD}`).toString('base64')}`;

  try {
    if (service) {
      // Get history for specific service
      const response = await fetch(
        `${BACKEND_URL}/admin/api/services/history?service=${encodeURIComponent(service)}&hours=${hours}`,
        {
          headers: { Authorization: authHeader },
          signal: AbortSignal.timeout(10000),
        }
      );

      if (!response.ok) {
        return NextResponse.json(
          { error: `Backend returned ${response.status}` },
          { status: response.status }
        );
      }

      const data: ServiceHistoryResponse = await response.json();
      return NextResponse.json(data);
    } else {
      // Get uptime for all services
      const response = await fetch(
        `${BACKEND_URL}/admin/api/services/uptime?hours=${hours}`,
        {
          headers: { Authorization: authHeader },
          signal: AbortSignal.timeout(10000),
        }
      );

      if (!response.ok) {
        return NextResponse.json(
          { error: `Backend returned ${response.status}` },
          { status: response.status }
        );
      }

      const data: ServiceUptimeResponse = await response.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Failed to fetch status history:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
