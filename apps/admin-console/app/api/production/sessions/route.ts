import { NextRequest, NextResponse } from 'next/server';
import { PRODUCTION_CONFIG } from '@/lib/environment';

// GET /api/production/sessions - List all sessions
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const response = await fetch(`${PRODUCTION_CONFIG.api.baseUrl}/v1/admin/sessions`, {
      headers: {
        Authorization: authHeader,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch sessions: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 503 });
  }
}
