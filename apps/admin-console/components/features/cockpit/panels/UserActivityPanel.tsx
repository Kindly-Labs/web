'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  MessageSquare,
  Globe,
  Mic,
  CheckCircle,
  Flag,
  Clock,
  Play,
  ChevronRight,
  Volume2,
  BarChart3,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { MetricTile } from './MetricTile';
import { cn } from '@/lib/utils';
import type {
  CockpitSessions,
  ReviewQueue,
  ReviewItem,
  AILabel,
  UserAnalytics,
} from '@/lib/cockpit-types';

type TabId = 'sessions' | 'analytics' | 'review';

interface UserActivityPanelProps {
  sessions: CockpitSessions | null;
  reviewQueue?: ReviewQueue | null;
  users?: UserAnalytics | null;
  onVerifyItem?: (itemId: string) => void;
  onFlagItem?: (itemId: string, notes?: string) => void;
  className?: string;
}

export function UserActivityPanel({
  sessions,
  reviewQueue,
  users,
  onVerifyItem,
  onFlagItem,
  className,
}: UserActivityPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('sessions');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const formatSessionTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-emerald-500' : 'bg-slate-500';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-emerald-400';
    if (confidence >= 0.7) return 'text-amber-400';
    return 'text-red-400';
  };

  const getLabelIcon = (type: AILabel['type']) => {
    switch (type) {
      case 'language':
        return Globe;
      case 'dialect':
        return MessageSquare;
      case 'quality':
        return Volume2;
      default:
        return MessageSquare;
    }
  };

  const handleVerify = useCallback(
    (itemId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onVerifyItem?.(itemId);
    },
    [onVerifyItem]
  );

  const handleFlag = useCallback(
    (itemId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onFlagItem?.(itemId);
    },
    [onFlagItem]
  );

  const pendingCount = reviewQueue?.pending ?? 0;

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Panel Header with Tabs */}
      <div className="flex items-center justify-between border-b border-slate-700/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-amber-400" />
          <span className="text-xs font-medium tracking-wider text-white uppercase">
            User Activity
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-800/50 bg-slate-900/30 px-2 py-1.5">
        <button
          onClick={() => setActiveTab('sessions')}
          className={cn(
            'flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium transition-all',
            activeTab === 'sessions'
              ? 'border border-amber-500/30 bg-amber-500/20 text-amber-400'
              : 'border border-transparent text-slate-500 hover:text-slate-300'
          )}
        >
          <Users size={10} />
          Sessions
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={cn(
            'flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium transition-all',
            activeTab === 'analytics'
              ? 'border border-sky-500/30 bg-sky-500/20 text-sky-400'
              : 'border border-transparent text-slate-500 hover:text-slate-300'
          )}
        >
          <BarChart3 size={10} />
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('review')}
          className={cn(
            'relative flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium transition-all',
            activeTab === 'review'
              ? 'border border-violet-500/30 bg-violet-500/20 text-violet-400'
              : 'border border-transparent text-slate-500 hover:text-slate-300'
          )}
        >
          <Mic size={10} />
          Review
          {pendingCount > 0 && (
            <span className="ml-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {activeTab === 'sessions' && (
          <>
            {/* Session Counts */}
            <div className="grid grid-cols-2 gap-2">
              <MetricTile
                label="Active"
                value={sessions?.active ?? 0}
                icon={Users}
                size="md"
                className="border-emerald-500/20"
              />
              <MetricTile label="Today" value={sessions?.todayTotal ?? 0} size="md" />
            </div>

            {/* Recent Sessions */}
            <div className="space-y-2">
              <span className="text-[10px] tracking-wider text-slate-500 uppercase">
                Recent Sessions
              </span>
              <div className="space-y-1.5">
                {sessions?.recentSessions && sessions.recentSessions.length > 0 ? (
                  sessions.recentSessions.map((session) => (
                    <motion.div
                      key={session.id}
                      whileHover={{ x: 4, backgroundColor: 'rgba(51, 65, 85, 0.8)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className="flex cursor-default items-center justify-between rounded bg-slate-800/50 px-2 py-1.5"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <div
                          className={cn(
                            'h-2 w-2 flex-shrink-0 rounded-full',
                            getStatusColor(session.status)
                          )}
                        />
                        <span className="truncate font-mono text-xs text-slate-300">
                          {session.id.slice(0, 8)}...
                        </span>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-3">
                        {session.language && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            <Globe size={10} />
                            {session.language}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <MessageSquare size={10} />
                          {session.messageCount}
                        </div>
                        <span className="text-[10px] text-slate-600">
                          {formatTimeAgo(session.startTime)}
                        </span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-slate-500">No recent sessions</div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <>
            {/* User Counts */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded border border-sky-500/20 bg-sky-500/10 px-2 py-2 text-center">
                <div className="font-mono text-lg text-sky-400">{users?.totalUsers ?? 0}</div>
                <div className="text-[9px] text-slate-500">Total Users</div>
              </div>
              <div className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-2 text-center">
                <div className="font-mono text-lg text-emerald-400">{users?.activeToday ?? 0}</div>
                <div className="text-[9px] text-slate-500">Active Today</div>
              </div>
              <div className="rounded border border-violet-500/20 bg-violet-500/10 px-2 py-2 text-center">
                <div className="font-mono text-lg text-violet-400">
                  {users?.activeThisWeek ?? 0}
                </div>
                <div className="text-[9px] text-slate-500">This Week</div>
              </div>
            </div>

            {/* Session Time Stats */}
            <div className="space-y-1.5">
              <span className="text-[10px] tracking-wider text-slate-500 uppercase">
                Session Duration
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded bg-slate-800/50 px-2 py-1.5 text-center">
                  <div className="font-mono text-sm text-white">
                    {users?.avgSessionTimeSec ? formatSessionTime(users.avgSessionTimeSec) : '--'}
                  </div>
                  <div className="text-[9px] text-slate-500">Average</div>
                </div>
                <div className="rounded bg-slate-800/50 px-2 py-1.5 text-center">
                  <div className="font-mono text-sm text-emerald-400">
                    {users?.p50SessionTimeSec ? formatSessionTime(users.p50SessionTimeSec) : '--'}
                  </div>
                  <div className="text-[9px] text-slate-500">P50</div>
                </div>
                <div className="rounded bg-slate-800/50 px-2 py-1.5 text-center">
                  <div className="font-mono text-sm text-amber-400">
                    {users?.p95SessionTimeSec ? formatSessionTime(users.p95SessionTimeSec) : '--'}
                  </div>
                  <div className="text-[9px] text-slate-500">P95</div>
                </div>
              </div>
            </div>

            {/* Turn Stats */}
            <div className="space-y-1.5">
              <span className="text-[10px] tracking-wider text-slate-500 uppercase">
                Conversation Engagement
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded bg-slate-800/50 px-2 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare size={12} className="text-slate-500" />
                    <span className="text-[10px] text-slate-400">Total Turns</span>
                  </div>
                  <div className="mt-1 font-mono text-lg text-white">{users?.totalTurns ?? 0}</div>
                </div>
                <div className="rounded bg-slate-800/50 px-2 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={12} className="text-slate-500" />
                    <span className="text-[10px] text-slate-400">Avg Turns/Session</span>
                  </div>
                  <div className="mt-1 font-mono text-lg text-white">
                    {users?.avgTurnsPerSession?.toFixed(1) ?? '0'}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Users */}
            <div className="space-y-1.5">
              <span className="text-[10px] tracking-wider text-slate-500 uppercase">
                Top Users by Activity
              </span>
              <div className="space-y-1">
                {users?.topUsers && users.topUsers.length > 0 ? (
                  users.topUsers.slice(0, 5).map((user, idx) => (
                    <div
                      key={user.clientId}
                      className="flex items-center justify-between rounded bg-slate-800/50 px-2 py-1.5"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded bg-slate-700 text-[9px] font-bold text-slate-400">
                          {idx + 1}
                        </div>
                        <span className="truncate text-xs text-slate-300">
                          {user.email || user.clientId.slice(0, 8)}
                        </span>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-3 text-[10px]">
                        <span className="text-slate-400">{user.sessionCount} sessions</span>
                        <span className="text-emerald-400">{user.turnCount} turns</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-slate-500">No user data yet</div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'review' && (
          <>
            {/* Queue Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-2 text-center">
                <div className="mb-1 flex items-center justify-center gap-1">
                  <Clock size={10} className="text-amber-400" />
                </div>
                <div className="font-mono text-lg text-amber-400">{reviewQueue?.pending ?? 0}</div>
                <div className="text-[9px] text-slate-500">Pending</div>
              </div>
              <div className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-2 text-center">
                <div className="mb-1 flex items-center justify-center gap-1">
                  <CheckCircle size={10} className="text-emerald-400" />
                </div>
                <div className="font-mono text-lg text-emerald-400">
                  {reviewQueue?.verified ?? 0}
                </div>
                <div className="text-[9px] text-slate-500">Verified</div>
              </div>
              <div className="rounded border border-red-500/20 bg-red-500/10 px-2 py-2 text-center">
                <div className="mb-1 flex items-center justify-center gap-1">
                  <Flag size={10} className="text-red-400" />
                </div>
                <div className="font-mono text-lg text-red-400">{reviewQueue?.flagged ?? 0}</div>
                <div className="text-[9px] text-slate-500">Flagged</div>
              </div>
            </div>

            {/* Review Items */}
            <div className="space-y-2">
              <span className="text-[10px] tracking-wider text-slate-500 uppercase">
                Pending Review
              </span>
              <div className="space-y-1.5">
                {reviewQueue?.items &&
                reviewQueue.items.filter((i) => i.status === 'pending').length > 0 ? (
                  reviewQueue.items
                    .filter((item) => item.status === 'pending')
                    .slice(0, 5)
                    .map((item) => (
                      <div key={item.id}>
                        <motion.div
                          whileHover={{ backgroundColor: 'rgba(51, 65, 85, 0.8)' }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          onClick={() =>
                            setExpandedItemId(expandedItemId === item.id ? null : item.id)
                          }
                          className="flex cursor-pointer items-center justify-between rounded bg-slate-800/50 px-2 py-2"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <button
                              className="flex h-6 w-6 items-center justify-center rounded bg-violet-500/20 transition-colors hover:bg-violet-500/30"
                              title="Play audio"
                            >
                              <Play size={10} className="text-violet-400" />
                            </button>
                            <div className="min-w-0">
                              <span className="block truncate font-mono text-xs text-slate-300">
                                {item.id.slice(0, 12)}
                              </span>
                              <span className="text-[9px] text-slate-500">
                                {formatDuration(item.durationMs)} · {formatFileSize(item.fileSize)}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-shrink-0 items-center gap-2">
                            {/* AI Labels Preview */}
                            {item.aiLabels.slice(0, 2).map((label, idx) => (
                              <span
                                key={idx}
                                className={cn(
                                  'rounded px-1.5 py-0.5 text-[9px]',
                                  getConfidenceColor(label.confidence),
                                  'bg-slate-700/50'
                                )}
                                title={`${label.type}: ${label.value} (${(label.confidence * 100).toFixed(0)}%)`}
                              >
                                {label.value}
                              </span>
                            ))}
                            <ChevronRight
                              size={12}
                              className={cn(
                                'text-slate-500 transition-transform',
                                expandedItemId === item.id && 'rotate-90'
                              )}
                            />
                          </div>
                        </motion.div>

                        {/* Expanded Details */}
                        {expandedItemId === item.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-1 rounded border border-slate-700/30 bg-slate-900/50 px-2 py-2"
                          >
                            {/* AI Labels */}
                            <div className="mb-3 space-y-1.5">
                              <span className="text-[9px] text-slate-500 uppercase">AI Labels</span>
                              <div className="flex flex-wrap gap-1">
                                {item.aiLabels.map((label, idx) => {
                                  const Icon = getLabelIcon(label.type);
                                  return (
                                    <div
                                      key={idx}
                                      className={cn(
                                        'flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px]',
                                        'border border-slate-700/30 bg-slate-800/50'
                                      )}
                                    >
                                      <Icon size={9} className="text-slate-500" />
                                      <span className="text-slate-400">{label.type}:</span>
                                      <span className={getConfidenceColor(label.confidence)}>
                                        {label.value}
                                      </span>
                                      <span className="text-slate-600">
                                        ({(label.confidence * 100).toFixed(0)}%)
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => handleVerify(item.id, e)}
                                className="flex flex-1 items-center justify-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/20 px-2 py-1.5 text-[10px] font-medium text-emerald-400 transition-colors hover:bg-emerald-500/30"
                              >
                                <CheckCircle size={10} />
                                Verify
                              </button>
                              <button
                                onClick={(e) => handleFlag(item.id, e)}
                                className="flex flex-1 items-center justify-center gap-1 rounded border border-red-500/30 bg-red-500/20 px-2 py-1.5 text-[10px] font-medium text-red-400 transition-colors hover:bg-red-500/30"
                              >
                                <Flag size={10} />
                                Flag
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    ))
                ) : (
                  <div className="py-6 text-center">
                    <CheckCircle size={24} className="mx-auto mb-2 text-emerald-500/50" />
                    <div className="text-xs text-slate-500">No items pending review</div>
                    <div className="mt-1 text-[10px] text-slate-600">All caught up!</div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
