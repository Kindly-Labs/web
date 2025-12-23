import { NextRequest, NextResponse } from 'next/server';
import { PRODUCTION_CONFIG } from '@/lib/environment';

// Restart a Docker container
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ container: string }> }
) {
  const { container } = await params;
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const backendUrl = `${PRODUCTION_CONFIG.api.baseUrl}/admin/api/docker/containers/${container}/restart`;

  try {
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: text || 'Backend error' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to restart container:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Connection failed' },
      { status: 503 }
    );
  }
}
