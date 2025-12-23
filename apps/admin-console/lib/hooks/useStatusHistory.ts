'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  HealthCheckRecord,
  ServiceHistoryResponse,
  ServiceUptimeResponse,
} from '@/app/api/status/history/route';

export type { HealthCheckRecord, ServiceHistoryResponse, ServiceUptimeResponse };

interface UseStatusHistoryOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  hours?: number;
}

interface UseStatusHistoryResult {
  uptimes: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getServiceHistory: (serviceName: string) => Promise<ServiceHistoryResponse | null>;
}

export function useStatusHistory(options: UseStatusHistoryOptions = {}): UseStatusHistoryResult {
  const { autoRefresh = true, refreshInterval = 60000, hours = 24 } = options;

  const [uptimes, setUptimes] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/status/history?hours=${hours}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: ServiceUptimeResponse = await response.json();
      setUptimes(data.uptimes || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch uptime data');
    } finally {
      setIsLoading(false);
    }
  }, [hours]);

  const getServiceHistory = useCallback(
    async (serviceName: string): Promise<ServiceHistoryResponse | null> => {
      try {
        const response = await fetch(
          `/api/status/history?service=${encodeURIComponent(serviceName)}&hours=${hours}`
        );

        if (!response.ok) {
          return null;
        }

        return await response.json();
      } catch {
        return null;
      }
    },
    [hours]
  );

  // Initial fetch
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    uptimes,
    isLoading,
    error,
    refresh,
    getServiceHistory,
  };
}

// Helper to get uptime badge color
export function getUptimeBadgeColor(uptime: number): {
  bg: string;
  text: string;
  border: string;
} {
  if (uptime >= 99.9) {
    return {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
    };
  }
  if (uptime >= 99) {
    return {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
    };
  }
  return {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/30',
  };
}

// Helper to format uptime percentage
export function formatUptime(uptime: number): string {
  if (uptime >= 99.99) return '99.99%';
  if (uptime >= 99.9) return `${uptime.toFixed(2)}%`;
  if (uptime >= 99) return `${uptime.toFixed(1)}%`;
  return `${uptime.toFixed(0)}%`;
}
