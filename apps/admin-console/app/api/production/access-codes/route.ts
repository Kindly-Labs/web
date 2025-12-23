import { NextRequest, NextResponse } from 'next/server';
import { PRODUCTION_CONFIG } from '@/lib/environment';

// GET /api/production/access-codes - List all access codes
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const response = await fetch(`${PRODUCTION_CONFIG.api.baseUrl}/v1/admin/access-codes`, {
      headers: {
        Authorization: authHeader,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch access codes: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch access codes:', error);
    return NextResponse.json({ error: 'Failed to fetch access codes' }, { status: 503 });
  }
}

// POST /api/production/access-codes - Create a new access code
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${PRODUCTION_CONFIG.api.baseUrl}/v1/admin/access-codes`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to create access code: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to create access code:', error);
    return NextResponse.json({ error: 'Failed to create access code' }, { status: 503 });
  }
}
