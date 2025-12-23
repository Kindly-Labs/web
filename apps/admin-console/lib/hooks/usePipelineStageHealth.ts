'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PipelineStageHealthCheck } from '@/lib/cockpit-types';

interface PipelineStageHealthState {
  data: PipelineStageHealthCheck | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastChecked: Date | null;
}

const POLL_INTERVAL = 10000; // 10 seconds (less frequent than metrics)

export function usePipelineStageHealth(): PipelineStageHealthState & {
  refresh: () => Promise<void>;
} {
  const [data, setData] = useState<PipelineStageHealthCheck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchHealth = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    }

    try {
      const response = await fetch('/api/cockpit/pipeline/health');

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      const healthData: PipelineStageHealthCheck = await response.json();
      setData(healthData);
      setError(null);
      setLastChecked(new Date());
    } catch (err) {
      // Keep stale data on error
      setError(err instanceof Error ? err.message : 'Failed to fetch stage health');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchHealth(true);
  }, [fetchHealth]);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(() => fetchHealth(false), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    lastChecked,
    refresh,
  };
}
