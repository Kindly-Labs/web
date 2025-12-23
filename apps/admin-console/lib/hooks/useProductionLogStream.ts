'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useEnvironment } from '@/lib/context/EnvironmentContext';

export interface ProductionLogEntry {
  timestamp: string;
  container: string;
  stream: 'stdout' | 'stderr';
  message: string;
}

interface UseProductionLogStreamOptions {
  containers: string[];
  maxLogs?: number;
  enabled?: boolean;
}

interface UseProductionLogStreamReturn {
  logs: ProductionLogEntry[];
  connections: Record<string, 'connected' | 'connecting' | 'disconnected' | 'error'>;
  clearLogs: () => void;
  isConnected: boolean;
  error: string | null;
}

export function useProductionLogStream({
  containers,
  maxLogs = 2000,
  enabled = true,
}: UseProductionLogStreamOptions): UseProductionLogStreamReturn {
  const { environment, isAuthenticated, getAuthHeaders } = useEnvironment();
  const [logs, setLogs] = useState<ProductionLogEntry[]>([]);
  const [connections, setConnections] = useState<Record<string, 'connected' | 'connecting' | 'disconnected' | 'error'>>({});
  const [error, setError] = useState<string | null>(null);

  const eventSourcesRef = useRef<Record<string, EventSource>>({});
  const reconnectTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  useEffect(() => {
    // Only connect in production mode with authentication
    if (environment !== 'production' || !isAuthenticated || !enabled) {
      // Close all connections
      Object.values(eventSourcesRef.current).forEach((es) => es.close());
      eventSourcesRef.current = {};
      setConnections({});
      return;
    }

    const connectToContainer = (container: string) => {
      // Skip if already connected
      if (eventSourcesRef.current[container]) return;

      setConnections((prev) => ({ ...prev, [container]: 'connecting' }));

      // Build URL with auth token as query param (EventSource doesn't support headers)
      const authHeaders = getAuthHeaders();
      const authToken = authHeaders['Authorization']?.replace('Basic ', '') || '';
      const url = `/api/production/docker/logs?container=${container}&auth=${encodeURIComponent(authToken)}`;

      const es = new EventSource(url);
      eventSourcesRef.current[container] = es;

      es.onopen = () => {
        setConnections((prev) => ({ ...prev, [container]: 'connected' }));
        setError(null);
      };

      es.onmessage = (event) => {
        try {
          const entry: ProductionLogEntry = JSON.parse(event.data);
          setLogs((prev) => {
            const newLogs = [...prev, entry];
            return newLogs.length > maxLogs ? newLogs.slice(-maxLogs) : newLogs;
          });
        } catch {
          // Ignore parse errors
        }
      };

      es.onerror = () => {
        setConnections((prev) => ({ ...prev, [container]: 'error' }));
        es.close();
        delete eventSourcesRef.current[container];

        // Attempt reconnect after 5 seconds
        reconnectTimeoutsRef.current[container] = setTimeout(() => {
          if (containers.includes(container)) {
            connectToContainer(container);
          }
        }, 5000);
      };
    };

    // Connect to all containers
    containers.forEach(connectToContainer);

    // Cleanup removed containers
    Object.keys(eventSourcesRef.current).forEach((container) => {
      if (!containers.includes(container)) {
        eventSourcesRef.current[container]?.close();
        delete eventSourcesRef.current[container];
        clearTimeout(reconnectTimeoutsRef.current[container]);
        setConnections((prev) => {
          const next = { ...prev };
          delete next[container];
          return next;
        });
      }
    });

    return () => {
      Object.values(eventSourcesRef.current).forEach((es) => es.close());
      Object.values(reconnectTimeoutsRef.current).forEach(clearTimeout);
      eventSourcesRef.current = {};
      reconnectTimeoutsRef.current = {};
    };
  }, [containers, environment, isAuthenticated, enabled, getAuthHeaders, maxLogs]);

  const connectedCount = Object.values(connections).filter((c) => c === 'connected').length;

  return {
    logs,
    connections,
    clearLogs,
    isConnected: connectedCount > 0,
    error,
  };
}
