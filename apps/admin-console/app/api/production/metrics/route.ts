import { NextRequest, NextResponse } from 'next/server';
import { PRODUCTION_CONFIG } from '@/lib/environment';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    // Proxy the request to production API
    const response = await fetch(
      `${PRODUCTION_CONFIG.api.baseUrl}${PRODUCTION_CONFIG.api.metricsEndpoint}`,
      {
        method: 'GET',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `Production API returned ${response.status}: ${text}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Pass through any partial error headers
    const partialErrors = response.headers.get('X-Partial-Errors');
    const headers: Record<string, string> = {};
    if (partialErrors) {
      headers['X-Partial-Errors'] = partialErrors;
    }

    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error('Failed to fetch production metrics:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Production unavailable' },
      { status: 503 }
    );
  }
}
