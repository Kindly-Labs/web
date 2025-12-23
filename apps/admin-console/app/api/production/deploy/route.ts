import { NextRequest, NextResponse } from 'next/server';
import { PRODUCTION_CONFIG } from '@/lib/environment';

// Deploy to production via SSH or webhook
// This is a placeholder - in production this would:
// 1. Connect via SSH to the Oracle Cloud instance
// 2. Run git pull && make build && sudo systemctl restart owly-api
// 3. Stream the output back to the client

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const { target } = await request.json();

    if (target !== 'backend') {
      return NextResponse.json({ error: 'Invalid deploy target' }, { status: 400 });
    }

    // For now, we'll call a deploy webhook endpoint on the production backend
    // In a real implementation, this could:
    // 1. Use SSH to connect to the server
    // 2. Run deployment commands
    // 3. Stream output via SSE

    const response = await fetch(`${PRODUCTION_CONFIG.api.baseUrl}/v1/admin/deploy`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ target }),
    });

    if (!response.ok) {
      // If the endpoint doesn't exist yet, return a helpful message
      if (response.status === 404) {
        return NextResponse.json(
          {
            error: 'Deploy endpoint not implemented on backend yet',
            message: 'Manual deployment: SSH to server and run: cd /app && git pull && make build && sudo systemctl restart owly-api',
          },
          { status: 501 }
        );
      }
      return NextResponse.json(
        { error: `Deploy failed: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Deploy error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Deployment failed' },
      { status: 503 }
    );
  }
}
