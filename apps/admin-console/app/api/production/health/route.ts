import { NextResponse } from 'next/server';
import { PRODUCTION_CONFIG, checkSiteHealth } from '@/lib/environment';

export async function GET() {
  try {
    // Check all production sites in parallel
    const siteEntries = Object.entries(PRODUCTION_CONFIG.sites);
    const healthChecks = await Promise.all(
      siteEntries.map(async ([key, site]) => {
        const health = await checkSiteHealth(site.url);
        return [key, { ...site, health }];
      })
    );

    const sites = Object.fromEntries(healthChecks);

    // Determine overall status
    const statuses = Object.values(sites).map((s: any) => s.health.status);
    let overall: 'healthy' | 'degraded' | 'offline' = 'healthy';
    if (statuses.includes('offline')) {
      overall = statuses.every((s) => s === 'offline') ? 'offline' : 'degraded';
    } else if (statuses.includes('degraded')) {
      overall = 'degraded';
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      overall,
      sites,
    });
  } catch (error) {
    console.error('Failed to check production health:', error);
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        overall: 'offline',
        error: error instanceof Error ? error.message : 'Health check failed',
        sites: {},
      },
      { status: 503 }
    );
  }
}
