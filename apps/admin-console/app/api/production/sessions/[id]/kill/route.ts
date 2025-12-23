import { NextRequest, NextResponse } from 'next/server';
import { PRODUCTION_CONFIG } from '@/lib/environment';

// POST /api/production/sessions/[id]/kill - Kill a session
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const response = await fetch(`${PRODUCTION_CONFIG.api.baseUrl}/v1/admin/sessions/${id}/kill`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to kill session: ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, message: `Session ${id} terminated` });
  } catch (error) {
    console.error('Failed to kill session:', error);
    return NextResponse.json({ error: 'Failed to kill session' }, { status: 503 });
  }
}
