'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Timer,
  DollarSign,
  AlertCircle,
  Activity,
  RefreshCw,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type {
  CockpitAI,
  PipelineHealth,
  PipelineStageHealthCheck,
  StageHealthProbe,
} from '@/lib/cockpit-types';

interface AIPerformancePanelProps {
  ai: CockpitAI | null;
  pipeline?: PipelineHealth | null;
  stageHealth?: PipelineStageHealthCheck | null;
  isRefreshingHealth?: boolean;
  onRefreshHealth?: () => void;
  className?: string;
}

// Stage display configuration
const STAGE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  stt: { label: 'STT', icon: Activity, color: 'sky' },
  langdetect: { label: 'Lang', icon: Zap, color: 'rose' },
  llm: { label: 'LLM', icon: Zap, color: 'purple' },
  mlx: { label: 'MLX', icon: Zap, color: 'violet' },
  tts: { label: 'TTS', icon: Activity, color: 'emerald' },
};

// Order of stages in the pipeline
const STAGE_ORDER = ['stt', 'langdetect', 'llm', 'mlx', 'tts'];

export function AIPerformancePanel({
  ai,
  pipeline,
  stageHealth,
  isRefreshingHealth,
  onRefreshHealth,
  className,
}: AIPerformancePanelProps) {
  const [showLiveHealth, setShowLiveHealth] = useState(true);

  const formatLatency = (ms: number) => {
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.round(ms)}ms`;
  };

  const formatTokens = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const errorRatePercent = ai ? (ai.errorRate * 100).toFixed(1) : '0';

  // Get status style for live health probes
  const getProbeStatusStyle = (status?: string) => {
    switch (status) {
      case 'online':
        return { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/30' };
      case 'degraded':
        return { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/30' };
      case 'offline':
        return { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/30' };
      default:
        return { bg: 'bg-slate-500', text: 'text-slate-400', border: 'border-slate-500/30' };
    }
  };

  // Determine overall status from stageHealth or pipeline
  const overallStatus = stageHealth?.overall || pipeline?.overall || 'unknown';

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Panel Header with Status Badge and Refresh */}
      <div className="flex items-center justify-between border-b border-slate-700/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-purple-400" />
          <span className="text-xs font-medium tracking-wider text-white uppercase">
            AI Pipeline
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Live Health Toggle */}
          <button
            onClick={() => setShowLiveHealth(!showLiveHealth)}
            className={cn(
              'rounded p-1 transition-colors',
              showLiveHealth
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'text-slate-500 hover:text-slate-400'
            )}
            title={showLiveHealth ? 'Live health enabled' : 'Live health disabled'}
          >
            {showLiveHealth ? <Wifi size={12} /> : <WifiOff size={12} />}
          </button>

          {/* Refresh Button */}
          {onRefreshHealth && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefreshHealth}
              disabled={isRefreshingHealth}
              className="h-5 w-5 p-0 text-slate-500 hover:text-white"
              title="Refresh health checks"
            >
              <RefreshCw size={12} className={cn(isRefreshingHealth && 'animate-spin')} />
            </Button>
          )}

          {/* Status Badge */}
          <span
            className={cn(
              'flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium',
              overallStatus === 'healthy' && 'bg-emerald-500/20 text-emerald-400',
              overallStatus === 'degraded' && 'bg-amber-500/20 text-amber-400',
              overallStatus === 'unhealthy' && 'bg-red-500/20 text-red-400',
              overallStatus === 'unknown' && 'bg-slate-500/20 text-slate-400'
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                overallStatus === 'healthy' && 'animate-pulse bg-emerald-400',
                overallStatus === 'degraded' && 'bg-amber-400',
                overallStatus === 'unhealthy' && 'bg-red-400',
                overallStatus === 'unknown' && 'bg-slate-400'
              )}
            />
            {overallStatus.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {/* Pipeline Summary Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded bg-slate-800/50 px-2 py-1.5 text-center">
            <div className="font-mono text-lg text-white">
              {pipeline ? `${(pipeline.score * 100).toFixed(0)}%` : '--'}
            </div>
            <div className="text-[9px] text-slate-500">Health</div>
          </div>
          <div className="rounded bg-slate-800/50 px-2 py-1.5 text-center">
            <div className="font-mono text-lg text-emerald-400">
              {pipeline ? formatLatency(pipeline.avgE2ELatencyMs) : '--'}
            </div>
            <div className="text-[9px] text-slate-500">E2E Latency</div>
          </div>
          <div className="rounded bg-slate-800/50 px-2 py-1.5 text-center">
            <div className="font-mono text-lg text-sky-400">
              {pipeline ? `${(pipeline.successRate1h * 100).toFixed(1)}%` : '--'}
            </div>
            <div className="text-[9px] text-slate-500">Success (1h)</div>
          </div>
        </div>

        {/* Pipeline Stages - With Live Health */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-wider text-slate-500 uppercase">
              Stage Performance
            </span>
            {showLiveHealth && stageHealth && (
              <span className="text-[9px] text-slate-600">Live probes active</span>
            )}
          </div>

          <AnimatePresence mode="popLayout">
            {STAGE_ORDER.map((stageName, idx) => {
              // Get live health probe if available
              const liveProbe = showLiveHealth ? stageHealth?.stages?.[stageName] : null;
              // Fall back to pipeline metrics
              const pipelineStage = pipeline?.stages?.[stageName];

              // Determine display status
              const status =
                liveProbe?.status ||
                (pipelineStage?.status === 'healthy'
                  ? 'online'
                  : pipelineStage?.status === 'degraded'
                    ? 'degraded'
                    : pipelineStage?.status === 'unhealthy'
                      ? 'offline'
                      : 'unknown');
              const latencyMs = liveProbe?.latencyMs ?? pipelineStage?.avgLatencyMs ?? 0;
              const config = STAGE_CONFIG[stageName] || {
                label: stageName.toUpperCase(),
                icon: Activity,
                color: 'slate',
              };
              const statusStyle = getProbeStatusStyle(status);

              return (
                <motion.div
                  key={stageName}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ delay: idx * 0.03 }}
                  className="relative"
                >
                  {/* Connection line */}
                  {idx > 0 && <div className="absolute -top-1.5 left-3 h-1.5 w-px bg-slate-700" />}

                  <div
                    className={cn(
                      'flex items-center gap-2 rounded border px-2 py-1.5 transition-all',
                      status === 'online' && 'border-emerald-500/20 bg-emerald-500/5',
                      status === 'degraded' && 'border-amber-500/20 bg-amber-500/5',
                      status === 'offline' && 'border-red-500/20 bg-red-500/5',
                      status === 'unknown' && 'border-slate-700/30 bg-slate-800/50'
                    )}
                  >
                    {/* Status indicator with pulse for online */}
                    <div className="relative flex-shrink-0">
                      <div className={cn('h-2 w-2 rounded-full', statusStyle.bg)} />
                      {status === 'online' && (
                        <motion.div
                          className={cn('absolute inset-0 rounded-full', statusStyle.bg)}
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            'truncate text-[11px] font-medium',
                            status === 'online' ? 'text-white' : 'text-slate-400'
                          )}
                        >
                          {config.label}
                        </span>
                        <span
                          className={cn(
                            'font-mono text-[10px]',
                            latencyMs > 500 ? 'text-amber-400' : 'text-slate-400'
                          )}
                        >
                          {latencyMs > 0 ? formatLatency(latencyMs) : '--'}
                        </span>
                      </div>

                      <div className="mt-0.5 flex items-center gap-2">
                        {/* Live health message */}
                        {liveProbe?.message && (
                          <span className={cn('text-[9px]', statusStyle.text)}>
                            {liveProbe.message}
                          </span>
                        )}

                        {/* Pipeline metrics if available */}
                        {pipelineStage && !liveProbe && (
                          <>
                            <span className="text-[9px] text-slate-500">
                              {pipelineStage.callCount} calls
                            </span>
                            <span className="text-[9px] text-slate-500">
                              p95: {formatLatency(pipelineStage.p95LatencyMs)}
                            </span>
                            {pipelineStage.errorRate > 0 && (
                              <span className="text-[9px] text-red-400">
                                {(pipelineStage.errorRate * 100).toFixed(1)}% err
                              </span>
                            )}
                          </>
                        )}

                        {/* Show metrics alongside live health */}
                        {liveProbe && pipelineStage && (
                          <span className="text-[9px] text-slate-500">
                            {pipelineStage.callCount} calls
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Latency Metrics Row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded bg-slate-800/50 px-2 py-1.5">
            <div className="mb-0.5 flex items-center gap-1">
              <Timer size={10} className="text-slate-500" />
              <span className="text-[9px] text-slate-500">Latency</span>
            </div>
            <div className="font-mono text-xs text-white">
              {ai ? formatLatency(ai.avgLatencyMs) : '--'}
            </div>
            <div className="text-[9px] text-slate-500">
              p95: {ai ? formatLatency(ai.p95LatencyMs) : '--'}
            </div>
          </div>
          <div className="rounded bg-slate-800/50 px-2 py-1.5">
            <div className="mb-0.5 text-[9px] text-slate-500">TTFA</div>
            <div className="font-mono text-xs text-white">
              {ai ? formatLatency(ai.avgTTFAMs) : '--'}
            </div>
            <div className="text-[9px] text-slate-500">RPM: {ai?.requestsPerMin ?? 0}</div>
          </div>
          <div
            className={cn(
              'rounded bg-slate-800/50 px-2 py-1.5',
              ai && ai.errorRate > 0.05 && 'border border-red-500/30 bg-red-500/5'
            )}
          >
            <div className="mb-0.5 flex items-center gap-1">
              <AlertCircle
                size={10}
                className={ai && ai.errorRate > 0.05 ? 'text-red-400' : 'text-slate-500'}
              />
              <span className="text-[9px] text-slate-500">Error</span>
            </div>
            <div
              className={cn(
                'font-mono text-xs',
                ai && ai.errorRate > 0.05 ? 'text-red-400' : 'text-white'
              )}
            >
              {errorRatePercent}%
            </div>
          </div>
        </div>

        {/* Token Usage Row */}
        <div className="flex items-center justify-between rounded bg-slate-800/50 px-2 py-2">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500">In:</span>
            <span className="font-mono text-emerald-400">
              {ai ? formatTokens(ai.tokensInput) : '--'}
            </span>
            <span className="text-slate-500">Out:</span>
            <span className="font-mono text-sky-400">
              {ai ? formatTokens(ai.tokensOutput) : '--'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-amber-400">
            <DollarSign size={12} />
            <span className="font-mono text-sm">{ai?.estimatedCostUSD.toFixed(2) ?? '0.00'}</span>
          </div>
        </div>

        {/* Last Success */}
        {pipeline?.lastFullSuccess && (
          <div className="rounded border-t border-slate-700/50 bg-slate-800/30 px-2 py-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500">Last Full Success</span>
              <span className="font-mono text-[10px] text-slate-400">
                {new Date(pipeline.lastFullSuccess).toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
