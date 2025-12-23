import { NextRequest, NextResponse } from 'next/server';
import { PRODUCTION_CONFIG } from '@/lib/environment';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const backendUrl = `${PRODUCTION_CONFIG.api.baseUrl}/admin/api/info`;

  try {
    const response = await fetch(backendUrl, {
      headers: {
        Authorization: authHeader,
      },
      // Short cache for build info
      next: { revalidate: 60 },
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
    console.error('Failed to fetch build info:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Connection failed' },
      { status: 503 }
    );
  }
}
