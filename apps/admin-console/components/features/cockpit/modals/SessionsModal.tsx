'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import {
  Users,
  RefreshCw,
  Loader2,
  XCircle,
  Clock,
  MessageSquare,
  Globe,
  Trash2,
} from 'lucide-react';
import { useEnvironment } from '@/lib/context/EnvironmentContext';
import { cn } from '@/lib/utils';

interface Session {
  id: string;
  startTime: string;
  messageCount: number;
  language?: string;
  status: 'active' | 'ended';
  clientId?: string;
}

interface SessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SessionsModal({ isOpen, onClose }: SessionsModalProps) {
  const { environment, productionAuth } = useEnvironment();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [killingSession, setKillingSession] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (environment !== 'production' || !productionAuth) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/production/sessions', {
        headers: {
          Authorization: `Bearer ${productionAuth.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
    } finally {
      setIsLoading(false);
    }
  }, [environment, productionAuth]);

  useEffect(() => {
    if (isOpen && environment === 'production' && productionAuth) {
      fetchSessions();
    }
  }, [isOpen, environment, productionAuth, fetchSessions]);

  const handleKillSession = async (sessionId: string) => {
    if (!productionAuth) return;

    setKillingSession(sessionId);

    try {
      const response = await fetch(`/api/production/sessions/${sessionId}/kill`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${productionAuth.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to kill session');
      }

      // Remove from list or mark as ended
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, status: 'ended' } : s))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to kill session');
    } finally {
      setKillingSession(null);
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const activeSessions = sessions.filter((s) => s.status === 'active');
  const endedSessions = sessions.filter((s) => s.status === 'ended');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Active Sessions" size="lg">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Users size={14} />
            <span>
              {activeSessions.length} active, {endedSessions.length} ended
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchSessions}
            disabled={isLoading}
            className="text-slate-400 hover:text-white"
          >
            <RefreshCw size={14} className={cn('mr-2', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading && sessions.length === 0 && (
          <div className="flex items-center justify-center py-8 text-slate-400">
            <Loader2 size={24} className="animate-spin" />
          </div>
        )}

        {/* Sessions List */}
        {!isLoading && sessions.length === 0 && (
          <div className="py-8 text-center text-slate-500">No sessions found</div>
        )}

        {sessions.length > 0 && (
          <div className="max-h-[400px] space-y-2 overflow-y-auto">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-3',
                  session.status === 'active'
                    ? 'border-slate-700 bg-slate-800/50'
                    : 'border-slate-800 bg-slate-900/30 opacity-60'
                )}
              >
                {/* Status indicator */}
                <div
                  className={cn(
                    'h-2 w-2 flex-shrink-0 rounded-full',
                    session.status === 'active' ? 'bg-emerald-500' : 'bg-slate-600'
                  )}
                />

                {/* Session info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-300">
                      {session.id.slice(0, 8)}...
                    </span>
                    {session.language && (
                      <span className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] text-slate-400">
                        {session.language}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {formatTime(session.startTime)} ({formatDuration(session.startTime)})
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare size={10} />
                      {session.messageCount} msgs
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {session.status === 'active' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleKillSession(session.id)}
                    disabled={killingSession === session.id}
                    className="h-7 px-2 text-red-400 hover:bg-red-950/50 hover:text-red-300"
                  >
                    {killingSession === session.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Trash2 size={12} />
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2">
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
