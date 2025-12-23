'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CheckResult, StatusCheckResponse } from '@/app/api/status/check/route';

export type { CheckResult, StatusCheckResponse };

interface UseStatusCheckOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseStatusCheckResult {
  data: StatusCheckResponse | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useStatusCheck(options: UseStatusCheckOptions = {}): UseStatusCheckResult {
  const { autoRefresh = true, refreshInterval = 30000 } = options;

  const [data, setData] = useState<StatusCheckResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/status/check');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result: StatusCheckResponse = await response.json();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    data,
    isLoading,
    error,
    refresh,
    lastUpdated,
  };
}

// Helper to group checks by site
export function groupChecksBySite(checks: CheckResult[]): Record<string, CheckResult[]> {
  return checks.reduce(
    (acc, check) => {
      if (!acc[check.site]) {
        acc[check.site] = [];
      }
      acc[check.site].push(check);
      return acc;
    },
    {} as Record<string, CheckResult[]>
  );
}

// Helper to get site status from its checks
export function getSiteStatus(checks: CheckResult[]): 'pass' | 'warn' | 'fail' {
  if (checks.some((c) => c.status === 'fail')) return 'fail';
  if (checks.some((c) => c.status === 'warn')) return 'warn';
  return 'pass';
}
