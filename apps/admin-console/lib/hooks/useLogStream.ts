'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { parseLog, stripAnsi, isNoise, hashLog, type LogLevel } from '@/lib/log-parser';

export interface LogEntry {
  timestamp: Date;
  service: string;
  level: LogLevel;
  message: string;
  category: string;
  raw: string;
}

export type ServiceState = 'stopped' | 'starting' | 'running' | 'stopping' | 'error';

interface UseLogStreamOptions {
  services: string[];
  serviceStates: Record<string, ServiceState>;
  maxLogs?: number;
  dedupeWindowMs?: number;
}

interface UseLogStreamReturn {
  logs: LogEntry[];
  connections: Record<string, boolean>;
  clearLogs: () => void;
  isConnected: boolean;
  hasRunningServices: boolean;
}

export function useLogStream({
  services,
  serviceStates,
  maxLogs = 2000,
  dedupeWindowMs = 30000,
}: UseLogStreamOptions): UseLogStreamReturn {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connections, setConnections] = useState<Record<string, boolean>>({});

  const eventSourcesRef = useRef<Record<string, EventSource>>({});
  const buffersRef = useRef<Record<string, string>>({});
  const clearedAtRef = useRef<number>(0);
  const recentLogHashesRef = useRef<Map<string, number>>(new Map());

  const clearLogs = useCallback(() => {
    clearedAtRef.current = Date.now();
    setLogs([]);
  }, []);

  useEffect(() => {
    // Close connections for services that are no longer running
    Object.keys(eventSourcesRef.current).forEach((service) => {
      const state = serviceStates[service];
      const shouldDisconnect = !services.includes(service) || state !== 'running';

      if (shouldDisconnect) {
        eventSourcesRef.current[service]?.close();
        delete eventSourcesRef.current[service];
        setConnections((prev) => {
          const next = { ...prev };
          delete next[service];
          return next;
        });
      }
    });

    // Connect only to running services
    services.forEach((service) => {
      const state = serviceStates[service];

      // Skip control logs (virtual service)
      if (service === 'control') return;

      // Only connect if service is running
      if (state !== 'running') return;

      // Skip if already connected
      if (eventSourcesRef.current[service]) return;

      const es = new EventSource(`/api/logs/${service}`);
      eventSourcesRef.current[service] = es;

      es.onopen = () => {
        setConnections((prev) => ({ ...prev, [service]: true }));
      };

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle service stopped signal
          if (data.type === 'status' && data.status === 'service_stopped') {
            es.close();
            delete eventSourcesRef.current[service];
            setConnections((prev) => {
              const next = { ...prev };
              delete next[service];
              return next;
            });
            return;
          }

          // Buffer and split by newline
          const rawText = data.text || '';
          const currentBuffer = (buffersRef.current[service] || '') + rawText;
          const lines = currentBuffer.split('\n');
          buffersRef.current[service] = lines.pop() || '';

          const now = Date.now();
          const newEntries: LogEntry[] = [];

          for (const line of lines) {
            if (!line.trim()) continue;

            const text = stripAnsi(line);

            // Skip noise
            if (isNoise(text)) continue;

            // Skip logs right after clear
            if (now - clearedAtRef.current < 100) continue;

            // Parse log
            const parsed = parseLog(text);

            // Deduplicate
            const logHashKey = hashLog(service, parsed.message);
            const lastSeen = recentLogHashesRef.current.get(logHashKey);
            if (lastSeen && now - lastSeen < dedupeWindowMs) {
              continue;
            }
            recentLogHashesRef.current.set(logHashKey, now);

            newEntries.push({
              timestamp: new Date(),
              service,
              level: parsed.level,
              message: parsed.message,
              category: parsed.category,
              raw: line,
            });
          }

          // Clean up old hashes
          if (recentLogHashesRef.current.size > 500) {
            const cutoff = now - dedupeWindowMs;
            for (const [hash, ts] of recentLogHashesRef.current.entries()) {
              if (ts < cutoff) recentLogHashesRef.current.delete(hash);
            }
          }

          if (newEntries.length > 0) {
            setLogs((prev) => {
              const newLogs = [...prev, ...newEntries];
              return newLogs.length > maxLogs ? newLogs.slice(-maxLogs) : newLogs;
            });
          }
        } catch {
          // Ignore parse errors
        }
      };

      es.onerror = () => {
        setConnections((prev) => ({ ...prev, [service]: false }));
        if (serviceStates[service] !== 'running') {
          es.close();
          delete eventSourcesRef.current[service];
        }
      };
    });

    return () => {
      Object.values(eventSourcesRef.current).forEach((es) => es.close());
      eventSourcesRef.current = {};
    };
  }, [services, serviceStates, maxLogs, dedupeWindowMs]);

  const connectedCount = Object.values(connections).filter(Boolean).length;
  const runningCount = services.filter((s) => serviceStates[s] === 'running').length;

  return {
    logs,
    connections,
    clearLogs,
    isConnected: connectedCount > 0,
    hasRunningServices: runningCount > 0,
  };
}
