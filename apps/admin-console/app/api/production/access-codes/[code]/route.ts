import { NextRequest, NextResponse } from 'next/server';
import { PRODUCTION_CONFIG } from '@/lib/environment';

// DELETE /api/production/access-codes/[code] - Revoke an access code
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const response = await fetch(
      `${PRODUCTION_CONFIG.api.baseUrl}/v1/admin/access-codes/${encodeURIComponent(code)}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: authHeader,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to revoke access code: ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, message: `Access code revoked` });
  } catch (error) {
    console.error('Failed to revoke access code:', error);
    return NextResponse.json({ error: 'Failed to revoke access code' }, { status: 503 });
  }
}
