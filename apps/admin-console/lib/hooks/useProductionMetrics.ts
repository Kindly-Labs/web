'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useEnvironment } from '../context/EnvironmentContext';
import type { CockpitMetrics } from '../cockpit-types';

// Timeout for metrics fetch (8 seconds, less than 10s poll interval)
const METRICS_FETCH_TIMEOUT_MS = 8000;

interface UseProductionMetricsResult {
  metrics: CockpitMetrics | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export function useProductionMetrics(): UseProductionMetricsResult {
  const { environment, isAuthenticated, productionAuth } = useEnvironment();
  const [metrics, setMetrics] = useState<CockpitMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Track current fetch abort controller to prevent race conditions
  const abortControllerRef = useRef<AbortController | null>(null);
  // Track interval for cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMetrics = useCallback(async () => {
    // Only fetch in production mode when authenticated
    if (environment !== 'production' || !isAuthenticated || !productionAuth) {
      return;
    }

    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), METRICS_FETCH_TIMEOUT_MS);

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/production/metrics', {
        headers: {
          Authorization: `Bearer ${productionAuth.token}`,
        },
        cache: 'no-store',
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to fetch metrics: ${text}`);
      }

      const data = await response.json();
      setMetrics(data);
      setLastUpdated(new Date());
    } catch (err) {
      // Ignore abort errors (expected when component unmounts or new request starts)
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }, [environment, isAuthenticated, productionAuth]);

  // Fetch on mount and when environment changes
  useEffect(() => {
    if (environment === 'production' && isAuthenticated) {
      fetchMetrics();
    } else {
      // Clear metrics when switching to local
      setMetrics(null);
      setError(null);
    }

    // Cleanup on unmount or environment change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [environment, isAuthenticated, fetchMetrics]);

  // Poll for updates every 10 seconds when in production mode
  useEffect(() => {
    // Clear any existing interval first to prevent memory leaks
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (environment !== 'production' || !isAuthenticated) {
      return;
    }

    intervalRef.current = setInterval(fetchMetrics, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [environment, isAuthenticated, fetchMetrics]);

  return {
    metrics,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchMetrics,
  };
}
