import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/admin/api/export/jsonl`, {
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${ADMIN_USER}:${ADMIN_PASSWORD}`).toString('base64'),
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `Backend returned ${response.status}: ${text}` },
        { status: response.status }
      );
    }

    // Stream the JSONL file back
    const blob = await response.blob();
    const timestamp = new Date().toISOString().split('T')[0];

    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/jsonl',
        'Content-Disposition': `attachment; filename="dataset-${timestamp}.jsonl"`,
      },
    });
  } catch (error) {
    console.error('Failed to export dataset:', error);
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 503 });
  }
}
