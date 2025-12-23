'use client';

import { useState, useCallback } from 'react';
import type { ServiceStatus } from '@/lib/types';
import type { CockpitMetrics } from '@/lib/cockpit-types';

export interface DebugState {
  rawServices: ServiceStatus[] | null;
  rawMetrics: CockpitMetrics | null;
  lastFetchTime: {
    services: Date | null;
    metrics: Date | null;
  };
}

export function useDebugState() {
  const [debugState, setDebugState] = useState<DebugState>({
    rawServices: null,
    rawMetrics: null,
    lastFetchTime: {
      services: null,
      metrics: null,
    },
  });

  const captureServices = useCallback((data: ServiceStatus[]) => {
    setDebugState((prev) => ({
      ...prev,
      rawServices: data,
      lastFetchTime: {
        ...prev.lastFetchTime,
        services: new Date(),
      },
    }));
  }, []);

  const captureMetrics = useCallback((data: CockpitMetrics) => {
    setDebugState((prev) => ({
      ...prev,
      rawMetrics: data,
      lastFetchTime: {
        ...prev.lastFetchTime,
        metrics: new Date(),
      },
    }));
  }, []);

  return {
    debugState,
    captureServices,
    captureMetrics,
  };
}
