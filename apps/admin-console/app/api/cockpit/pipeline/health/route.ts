import { NextResponse } from 'next/server';
import type { PipelineStageHealthCheck } from '@/lib/cockpit-types';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

// Mock data for development without backend
const mockPipelineStageHealth: PipelineStageHealthCheck = {
  timestamp: new Date().toISOString(),
  overall: 'healthy',
  stages: {
    stt: {
      status: 'online',
      latencyMs: 45,
      message: 'healthy',
      lastChecked: new Date().toISOString(),
      endpoint: 'google',
    },
    llm: {
      status: 'online',
      latencyMs: 120,
      message: 'healthy',
      lastChecked: new Date().toISOString(),
      endpoint: 'gemini/mlx',
    },
    mlx: {
      status: 'online',
      latencyMs: 85,
      message: 'healthy',
      lastChecked: new Date().toISOString(),
      endpoint: 'http://localhost:8000/health',
    },
    tts: {
      status: 'online',
      latencyMs: 62,
      message: 'healthy',
      lastChecked: new Date().toISOString(),
      endpoint: 'http://localhost:8880/health',
    },
    langdetect: {
      status: 'online',
      latencyMs: 28,
      message: 'healthy',
      lastChecked: new Date().toISOString(),
      endpoint: 'http://localhost:8001/health',
    },
  },
};

export async function GET() {
  // Return mock data for visual testing
  if (USE_MOCKS) {
    return NextResponse.json({
      ...mockPipelineStageHealth,
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const response = await fetch(`${BACKEND_URL}/admin/api/pipeline/stages/health`, {
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
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch pipeline stage health:', error);
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 503 });
  }
}
