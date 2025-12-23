import { NextResponse } from 'next/server';
import { getServicesStatus } from '@/lib/services';

export async function GET() {
  const status = await getServicesStatus();
  return NextResponse.json(status);
}
