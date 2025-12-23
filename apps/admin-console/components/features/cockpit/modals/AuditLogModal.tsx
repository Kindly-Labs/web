'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import {
  Shield,
  RefreshCw,
  Loader2,
  Clock,
  Globe,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useEnvironment } from '@/lib/context/EnvironmentContext';
import { cn } from '@/lib/utils';

interface AuditEvent {
  id: string;
  type: string;
  timestamp: string;
  actor: string;
  data: {
    method?: string;
    path?: string;
    ip?: string;
    user_agent?: string;
    status?: number;
    action?: string;
    container?: string;
    success?: boolean;
    message?: string;
  };
}

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuditLogModal({ isOpen, onClose }: AuditLogModalProps) {
  const { environment, getAuthHeaders } = useEnvironment();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'admin' | 'container'>('all');

  const fetchAuditLog = useCallback(async () => {
    if (environment !== 'production') {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/production/audit?limit=100', {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audit log');
      }

      const data = await response.json();
      setEvents(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audit log');
    } finally {
      setIsLoading(false);
    }
  }, [environment, getAuthHeaders]);

  useEffect(() => {
    if (isOpen && environment === 'production') {
      fetchAuditLog();
    }
  }, [isOpen, environment, fetchAuditLog]);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getMethodColor = (method?: string) => {
    switch (method) {
      case 'POST':
        return 'text-emerald-400';
      case 'PUT':
        return 'text-amber-400';
      case 'DELETE':
        return 'text-red-400';
      case 'PATCH':
        return 'text-purple-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusIcon = (status?: number, success?: boolean) => {
    if (success !== undefined) {
      return success ? (
        <CheckCircle size={12} className="text-emerald-400" />
      ) : (
        <XCircle size={12} className="text-red-400" />
      );
    }
    if (status === undefined) return null;
    if (status >= 200 && status < 300) {
      return <CheckCircle size={12} className="text-emerald-400" />;
    }
    if (status >= 400) {
      return <AlertCircle size={12} className="text-red-400" />;
    }
    return <AlertCircle size={12} className="text-amber-400" />;
  };

  const filteredEvents = events.filter((e) => {
    if (filter === 'all') return true;
    if (filter === 'admin') return e.type === 'admin.action';
    if (filter === 'container') return e.type === 'container.action';
    return true;
  });

  const adminCount = events.filter((e) => e.type === 'admin.action').length;
  const containerCount = events.filter((e) => e.type === 'container.action').length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Audit Log" size="xl">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-cyan-400" />
            <span className="text-sm text-slate-400">
              {events.length} events (last 7 days)
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Filter tabs */}
            <div className="flex rounded-lg border border-slate-700 bg-slate-800/50 p-0.5">
              <button
                onClick={() => setFilter('all')}
                className={cn(
                  'rounded px-2 py-1 text-[10px] font-medium transition-colors',
                  filter === 'all'
                    ? 'bg-slate-600 text-white'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                All ({events.length})
              </button>
              <button
                onClick={() => setFilter('admin')}
                className={cn(
                  'rounded px-2 py-1 text-[10px] font-medium transition-colors',
                  filter === 'admin'
                    ? 'bg-slate-600 text-white'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                Admin ({adminCount})
              </button>
              <button
                onClick={() => setFilter('container')}
                className={cn(
                  'rounded px-2 py-1 text-[10px] font-medium transition-colors',
                  filter === 'container'
                    ? 'bg-slate-600 text-white'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                Container ({containerCount})
              </button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchAuditLog}
              disabled={isLoading}
              className="text-slate-400 hover:text-white"
            >
              <RefreshCw size={14} className={cn('mr-2', isLoading && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading && events.length === 0 && (
          <div className="flex items-center justify-center py-8 text-slate-400">
            <Loader2 size={24} className="animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && events.length === 0 && (
          <div className="py-8 text-center text-slate-500">
            No audit events found. Actions will appear here when admins perform operations.
          </div>
        )}

        {/* Events List */}
        {filteredEvents.length > 0 && (
          <div className="max-h-[400px] space-y-1 overflow-y-auto">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/50 p-3"
              >
                {/* Status indicator */}
                {getStatusIcon(event.data.status, event.data.success)}

                {/* Event info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {event.type === 'admin.action' ? (
                      <>
                        <span className={cn('font-mono text-xs font-bold', getMethodColor(event.data.method))}>
                          {event.data.method}
                        </span>
                        <span className="truncate font-mono text-xs text-slate-300">
                          {event.data.path}
                        </span>
                        {event.data.status && (
                          <span
                            className={cn(
                              'rounded px-1.5 py-0.5 text-[10px] font-medium',
                              event.data.status >= 200 && event.data.status < 300
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : event.data.status >= 400
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-amber-500/20 text-amber-400'
                            )}
                          >
                            {event.data.status}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="font-mono text-xs font-bold text-purple-400">
                          {event.data.action?.toUpperCase()}
                        </span>
                        <span className="font-mono text-xs text-slate-300">
                          {event.data.container}
                        </span>
                        {event.data.success !== undefined && (
                          <span
                            className={cn(
                              'rounded px-1.5 py-0.5 text-[10px] font-medium',
                              event.data.success
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/20 text-red-400'
                            )}
                          >
                            {event.data.success ? 'success' : 'failed'}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {formatTime(event.timestamp)}
                    </span>
                    {event.data.ip && (
                      <span className="flex items-center gap-1">
                        <Globe size={10} />
                        {event.data.ip}
                      </span>
                    )}
                    {event.data.message && (
                      <span className="text-slate-400">{event.data.message}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between pt-2">
          <div className="text-[10px] text-slate-600">
            Audit logs are retained for 7 days
          </div>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
