'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ServiceIncident, IncidentsResponse } from '@/app/api/status/incidents/route';

export type { ServiceIncident, IncidentsResponse };

interface UseIncidentsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  recentLimit?: number;
}

interface UseIncidentsResult {
  ongoing: ServiceIncident[];
  recent: ServiceIncident[];
  hasOngoing: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useIncidents(options: UseIncidentsOptions = {}): UseIncidentsResult {
  const { autoRefresh = true, refreshInterval = 30000, recentLimit = 10 } = options;

  const [ongoing, setOngoing] = useState<ServiceIncident[]>([]);
  const [recent, setRecent] = useState<ServiceIncident[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/status/incidents?limit=${recentLimit}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: IncidentsResponse = await response.json();
      setOngoing(data.ongoing || []);
      setRecent(data.recent || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch incidents');
    } finally {
      setIsLoading(false);
    }
  }, [recentLimit]);

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
    ongoing,
    recent,
    hasOngoing: ongoing.length > 0,
    isLoading,
    error,
    refresh,
  };
}

// Helper to calculate incident duration
export function getIncidentDuration(incident: ServiceIncident): string {
  const start = new Date(incident.started_at);
  const end = incident.resolved_at ? new Date(incident.resolved_at) : new Date();
  const diffMs = end.getTime() - start.getTime();

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
}

// Helper to format incident time
export function formatIncidentTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
