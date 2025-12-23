import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/admin/api/cockpit/metrics`, {
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${ADMIN_USER}:${ADMIN_PASSWORD}`).toString('base64'),
      },
      // Don't cache - we want fresh data
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `Backend returned ${response.status}: ${text}` },
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
    console.error('Failed to fetch cockpit metrics:', error);
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 503 });
  }
}
