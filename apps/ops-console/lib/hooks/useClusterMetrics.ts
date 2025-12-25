'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ClusterMetrics } from '@/lib/types';

const POLL_INTERVAL = 10000; // 10 seconds
const METRICS_API_URL = process.env.NEXT_PUBLIC_METRICS_API_URL || 'http://localhost:9090';

interface UseClusterMetricsResult {
  metrics: ClusterMetrics | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export function useClusterMetrics(): UseClusterMetricsResult {
  const [metrics, setMetrics] = useState<ClusterMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch(`${METRICS_API_URL}/metrics`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: ClusterMetrics = await response.json();
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
