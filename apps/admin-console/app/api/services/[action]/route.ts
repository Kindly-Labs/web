import { NextRequest, NextResponse } from 'next/server';
import { startService, stopService } from '@/lib/services';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> } // Params are Promises in Next.js 15
) {
  // Await the params
  const { action } = await params;

  // Parse body for service name
  const body = await request.json();
  const { service } = body;

  if (!service) {
    return NextResponse.json({ error: 'Service name required' }, { status: 400 });
  }

  try {
    if (action === 'start') {
      await startService(service);
      return NextResponse.json({ message: 'Started' });
    }

    if (action === 'stop') {
      await stopService(service);
      return NextResponse.json({ message: 'Stopped' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
