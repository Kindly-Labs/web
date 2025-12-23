'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CockpitMetrics, CockpitState } from '@/lib/cockpit-types';

const POLL_INTERVAL = 5000; // 5 seconds

export function useCockpitMetrics(): CockpitState & { refetch: () => Promise<void> } {
  const [metrics, setMetrics] = useState<CockpitMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/cockpit/metrics');

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      const data: CockpitMetrics = await response.json();
      setMetrics(data);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      // Keep stale data on error, just update error state
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  return {
    metrics,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchMetrics,
  };
}
