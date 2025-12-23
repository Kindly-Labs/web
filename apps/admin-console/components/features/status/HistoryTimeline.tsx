'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HealthCheckRecord, ServiceHistoryResponse } from '@/lib/hooks/useStatusHistory';

interface HistoryTimelineProps {
  serviceName: string;
  getServiceHistory: (name: string) => Promise<ServiceHistoryResponse | null>;
  className?: string;
}

export function HistoryTimeline({
  serviceName,
  getServiceHistory,
  className,
}: HistoryTimelineProps) {
  const [expanded, setExpanded] = useState(false);
  const [history, setHistory] = useState<HealthCheckRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (expanded && history.length === 0) {
      setIsLoading(true);
      getServiceHistory(serviceName)
        .then((data) => {
          if (data?.history) {
            setHistory(data.history);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [expanded, serviceName, getServiceHistory, history.length]);

  return (
    <div className={cn('rounded-lg border border-slate-700/50', className)}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-3 text-left hover:bg-slate-700/20"
      >
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-300">Health History</span>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-slate-400" />
        ) : (
          <ChevronDown size={16} className="text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-slate-700/50 p-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
            </div>
          ) : history.length === 0 ? (
            <p className="py-2 text-center text-sm text-slate-500">No history available</p>
          ) : (
            <div className="space-y-2">
              {/* Mini Timeline Bar */}
              <StatusBar history={history} />

              {/* Recent Checks List */}
              <div className="mt-3 space-y-1">
                {history.slice(0, 5).map((check) => (
                  <div
                    key={check.id}
                    className="flex items-center justify-between text-xs text-slate-400"
                  >
                    <div className="flex items-center gap-2">
                      <StatusDot status={check.status} />
                      <span>{new Date(check.check_time).toLocaleTimeString()}</span>
                    </div>
                    <span>{check.latency_ms.toFixed(0)}ms</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface StatusBarProps {
  history: HealthCheckRecord[];
  maxPoints?: number;
}

export function StatusBar({ history, maxPoints = 24 }: StatusBarProps) {
  // Take the most recent points, reversed so oldest is first
  const points = history.slice(0, maxPoints).reverse();

  if (points.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-0.5">
      {points.map((check, index) => (
        <div
          key={check.id || index}
          className={cn(
            'h-6 flex-1 rounded-sm transition-opacity hover:opacity-80',
            check.status === 'healthy' && 'bg-emerald-500',
            check.status === 'degraded' && 'bg-amber-500',
            check.status === 'unhealthy' && 'bg-red-500',
            check.status === 'offline' && 'bg-slate-600'
          )}
          title={`${new Date(check.check_time).toLocaleString()} - ${check.status} (${check.latency_ms}ms)`}
        />
      ))}
    </div>
  );
}

interface StatusDotProps {
  status: HealthCheckRecord['status'];
  size?: 'sm' | 'md';
}

export function StatusDot({ status, size = 'sm' }: StatusDotProps) {
  const sizeClass = size === 'sm' ? 'h-2 w-2' : 'h-3 w-3';

  return (
    <span
      className={cn(
        'rounded-full',
        sizeClass,
        status === 'healthy' && 'bg-emerald-500',
        status === 'degraded' && 'bg-amber-500',
        status === 'unhealthy' && 'bg-red-500',
        status === 'offline' && 'bg-slate-600'
      )}
    />
  );
}

interface LatencySparklineProps {
  history: HealthCheckRecord[];
  maxPoints?: number;
  height?: number;
  className?: string;
}

export function LatencySparkline({
  history,
  maxPoints = 20,
  height = 24,
  className,
}: LatencySparklineProps) {
  const points = history.slice(0, maxPoints).reverse();

  if (points.length < 2) {
    return null;
  }

  const latencies = points.map((p) => p.latency_ms);
  const maxLatency = Math.max(...latencies);
  const minLatency = Math.min(...latencies);
  const range = maxLatency - minLatency || 1;

  const width = points.length * 4;
  const pathPoints = points.map((point, i) => {
    const x = i * 4 + 2;
    const y = height - ((point.latency_ms - minLatency) / range) * (height - 4) - 2;
    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
  });

  return (
    <svg
      width={width}
      height={height}
      className={cn('flex-shrink-0', className)}
      viewBox={`0 0 ${width} ${height}`}
    >
      <path
        d={pathPoints.join(' ')}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-slate-400"
      />
    </svg>
  );
}
