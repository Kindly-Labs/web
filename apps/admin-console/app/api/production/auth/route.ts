import { NextRequest, NextResponse } from 'next/server';
import { PRODUCTION_CONFIG } from '@/lib/environment';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Call production API to get JWT token
    const response = await fetch(`${PRODUCTION_CONFIG.api.baseUrl}/v1/common/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const text = await response.text();
      let errorMessage = 'Authentication failed';
      try {
        const errorData = JSON.parse(text);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = text || errorMessage;
      }
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const data = await response.json();

    // Return token info to client
    return NextResponse.json({
      token: data.access_token,
      email: email,
      expiresAt: Date.now() + (data.expires_in || 86400) * 1000, // Default 24 hours
    });
  } catch (error) {
    console.error('Production auth error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Connection to production failed' },
      { status: 503 }
    );
  }
}
