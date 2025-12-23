'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, HardDrive, Clock, Server, Activity, Zap, CircleDot } from 'lucide-react';
import { MetricTile } from './MetricTile';
import { cn } from '@/lib/utils';
import type { CockpitSystem, CockpitHealth } from '@/lib/cockpit-types';

interface SystemHealthPanelProps {
  system: CockpitSystem | null;
  health: CockpitHealth | null;
  className?: string;
}

// Dependency icons and colors
const DEP_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  database: { icon: HardDrive, color: 'cyan', label: 'Database' },
  ai_provider: { icon: Zap, color: 'purple', label: 'AI Provider' },
  speech_provider: { icon: Activity, color: 'emerald', label: 'Speech' },
  redis: { icon: CircleDot, color: 'rose', label: 'Cache' },
};

export function SystemHealthPanel({ system, health, className }: SystemHealthPanelProps) {
  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getStatusStyles = (status?: string) => {
    switch (status) {
      case 'healthy':
        return { bg: 'bg-emerald-500', ring: 'ring-emerald-500/30', text: 'text-emerald-400' };
      case 'degraded':
        return { bg: 'bg-amber-500', ring: 'ring-amber-500/30', text: 'text-amber-400' };
      case 'unhealthy':
        return { bg: 'bg-red-500', ring: 'ring-red-500/30', text: 'text-red-400' };
      default:
        return { bg: 'bg-slate-500', ring: 'ring-slate-500/30', text: 'text-slate-400' };
    }
  };

  // Calculate overall health score
  const deps = health?.dependencies ? Object.values(health.dependencies) : [];
  const healthyCount = deps.filter((d) => d.status === 'healthy').length;
  const totalCount = deps.length || 1;
  const healthScore = Math.round((healthyCount / totalCount) * 100);

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Panel Header with Overall Status */}
      <div className="flex items-center justify-between border-b border-slate-700/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <Server size={14} className="text-sky-400" />
          <span className="text-xs font-medium tracking-wider text-white uppercase">
            System Health
          </span>
        </div>
        {/* Overall Health Badge */}
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium',
            health?.overall === 'healthy' && 'bg-emerald-500/20 text-emerald-400',
            health?.overall === 'degraded' && 'bg-amber-500/20 text-amber-400',
            health?.overall === 'unhealthy' && 'bg-red-500/20 text-red-400',
            !health?.overall && 'bg-slate-500/20 text-slate-400'
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              health?.overall === 'healthy' && 'animate-pulse bg-emerald-400',
              health?.overall === 'degraded' && 'animate-pulse bg-amber-400',
              health?.overall === 'unhealthy' && 'animate-pulse bg-red-400',
              !health?.overall && 'bg-slate-400'
            )}
          />
          {healthScore}%
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2">
          <MetricTile
            label="Memory"
            value={system?.memoryAllocMB.toFixed(1) ?? '--'}
            unit="MB"
            icon={HardDrive}
            size="sm"
          />
          <MetricTile
            label="Uptime"
            value={system ? formatUptime(system.uptimeSeconds) : '--'}
            icon={Clock}
            size="sm"
          />
          <MetricTile label="GC Runs" value={system?.numGC ?? '--'} icon={Cpu} size="sm" />
          <MetricTile label="Go" value={system?.goVersion.replace('go', '') ?? '--'} size="sm" />
        </div>

        {/* Dependencies Section - Dynamic Visualization */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-wider text-slate-500 uppercase">
              Dependencies
            </span>
            <span className="text-[9px] text-slate-600">
              {healthyCount}/{totalCount} online
            </span>
          </div>

          {/* Dependencies Graph View */}
          <div className="relative">
            {/* Connection lines background */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <AnimatePresence mode="popLayout">
                {health?.dependencies ? (
                  Object.entries(health.dependencies).map(([name, dep], idx) => {
                    const config = DEP_CONFIG[name] || {
                      icon: Server,
                      color: 'slate',
                      label: name.replace('_', ' '),
                    };
                    const Icon = config.icon;
                    const styles = getStatusStyles(dep.status);
                    const latencyWarning = dep.latencyMs > 100;

                    return (
                      <motion.div
                        key={name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        className={cn(
                          'relative cursor-default rounded-lg border p-2 transition-all',
                          'bg-slate-800/50 hover:bg-slate-800/80',
                          dep.status === 'healthy' && 'border-emerald-500/20',
                          dep.status === 'degraded' && 'border-amber-500/20',
                          dep.status === 'unhealthy' && 'border-red-500/30',
                          dep.status !== 'healthy' &&
                            dep.status !== 'degraded' &&
                            dep.status !== 'unhealthy' &&
                            'border-slate-700/50'
                        )}
                      >
                        {/* Pulse effect for active dependencies */}
                        {dep.status === 'healthy' && (
                          <motion.div
                            className="absolute inset-0 rounded-lg bg-emerald-500/5"
                            animate={{ opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}

                        <div className="relative flex items-start gap-2">
                          {/* Icon with status ring */}
                          <div className="relative">
                            <div className={cn('rounded-md p-1.5', `bg-${config.color}-500/10`)}>
                              <Icon size={12} className={`text-${config.color}-400`} />
                            </div>
                            {/* Status indicator */}
                            <div
                              className={cn(
                                'absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full border border-slate-900',
                                styles.bg
                              )}
                            />
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="truncate text-[10px] font-medium text-slate-300">
                                {config.label}
                              </span>
                            </div>
                            <div className="mt-0.5 flex items-center gap-1">
                              <span
                                className={cn(
                                  'font-mono text-[9px]',
                                  latencyWarning ? 'text-amber-400' : 'text-slate-500'
                                )}
                              >
                                {dep.latencyMs}ms
                              </span>
                              {dep.message && (
                                <span className="truncate text-[8px] text-slate-600">
                                  • {dep.message}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="col-span-2 py-4 text-center text-xs text-slate-500">
                    Waiting for health data...
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Environment Info - Compact Pills */}
        <div className="space-y-1.5">
          <span className="text-[10px] tracking-wider text-slate-500 uppercase">Environment</span>
          <div className="flex flex-wrap gap-1">
            <span className="rounded-full bg-slate-800/50 px-2 py-0.5 text-[9px] text-slate-400">
              TTS: <span className="text-emerald-400">{system?.ttsProvider ?? '--'}</span>
            </span>
            <span className="rounded-full bg-slate-800/50 px-2 py-0.5 text-[9px] text-slate-400">
              STT: <span className="text-sky-400">{system?.sttProvider ?? '--'}</span>
            </span>
            <span className="rounded-full bg-slate-800/50 px-2 py-0.5 text-[9px] text-slate-400">
              Env: <span className="text-amber-400">{system?.environment ?? '--'}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
