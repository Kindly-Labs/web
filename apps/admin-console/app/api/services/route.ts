import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

export async function GET() {
  try {
    // Fetch services from backend API
    const response = await fetch(`${BACKEND_URL}/admin/api/services`, {
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

    const data = await response.json();

    // Transform backend response to match expected format for frontend
    // Backend returns: { environment, services: [{name, status, url, ...}], timestamp }
    // Frontend expects: array of ServiceStatus objects
    const services = data.services?.map((svc: {
      name: string;
      status: string;
      url: string;
      version?: string;
      uptime_seconds?: number;
      latency_ms?: number;
      message?: string;
      required?: boolean;
    }) => ({
      name: svc.name,
      running: svc.status === 'healthy' || svc.status === 'degraded',
      url: svc.url,
      description: svc.message || '',
      _detectionMethod: 'api' as const,
    })) || [];

    return NextResponse.json(services);
  } catch (error) {
    console.error('Failed to fetch services from backend:', error);
    return NextResponse.json(
      { error: 'Backend unavailable' },
      { status: 503 }
    );
  }
}
