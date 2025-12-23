import { NextResponse } from 'next/server';

export interface ServiceIncident {
  id: string;
  service_name: string;
  started_at: string;
  resolved_at?: string;
  status: 'ongoing' | 'resolved';
  previous_status?: string;
  new_status?: string;
  duration_minutes?: number;
}

export interface IncidentsResponse {
  ongoing: ServiceIncident[];
  recent: ServiceIncident[];
  timestamp: string;
}

const BACKEND_URL = process.env.BACKEND_URL || 'https://api.cogito.cv';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '10';

  const authHeader = `Basic ${Buffer.from(`${ADMIN_USER}:${ADMIN_PASSWORD}`).toString('base64')}`;

  try {
    // Fetch both ongoing and recent incidents in parallel
    const [ongoingRes, recentRes] = await Promise.all([
      fetch(`${BACKEND_URL}/admin/api/incidents`, {
        headers: { Authorization: authHeader },
        signal: AbortSignal.timeout(10000),
      }),
      fetch(`${BACKEND_URL}/admin/api/incidents/recent?limit=${limit}`, {
        headers: { Authorization: authHeader },
        signal: AbortSignal.timeout(10000),
      }),
    ]);

    if (!ongoingRes.ok || !recentRes.ok) {
      const status = !ongoingRes.ok ? ongoingRes.status : recentRes.status;
      return NextResponse.json(
        { error: `Backend returned ${status}` },
        { status }
      );
    }

    const ongoing: ServiceIncident[] = await ongoingRes.json();
    const recent: ServiceIncident[] = await recentRes.json();

    const response: IncidentsResponse = {
      ongoing,
      recent,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch incidents:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
