'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, ChevronDown, ChevronRight, AlertTriangle, Check, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ServiceStatus } from '@/lib/types';
import type { CockpitMetrics } from '@/lib/cockpit-types';

interface DebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
  // Raw API data
  rawServices: ServiceStatus[] | null;
  rawMetrics: CockpitMetrics | null;
  // Rendered state
  serviceStates: Record<string, string>;
  // Timestamps
  lastFetchTime: {
    services: Date | null;
    metrics: Date | null;
  };
  // Actions
  onRefreshServices?: () => void;
  onRefreshMetrics?: () => void;
}

function Section({
  title,
  expanded,
  onToggle,
  children,
  badge,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div className="border border-slate-700/50 rounded overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 p-2 hover:bg-slate-800/50 text-left"
      >
        {expanded ? (
          <ChevronDown size={12} className="text-slate-400" />
        ) : (
          <ChevronRight size={12} className="text-slate-400" />
        )}
        <span className="text-xs font-medium text-slate-300 flex-1">{title}</span>
        {badge}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-2 pt-0 border-t border-slate-700/30">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DebugPanel({
  isOpen,
  onClose,
  rawServices,
  rawMetrics,
  serviceStates,
  lastFetchTime,
  onRefreshServices,
  onRefreshMetrics,
}: DebugPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['services', 'metrics'])
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  // Count running services
  const runningCount = rawServices?.filter((s) => s.running).length ?? 0;
  const totalServices = rawServices?.length ?? 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed right-0 top-12 bottom-8 w-96 bg-slate-900/95 backdrop-blur-sm border-l border-slate-700 z-50 overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Bug size={16} className="text-amber-400" />
              <span className="text-sm font-medium text-white">Debug Panel</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* Services Section */}
            <Section
              title="Service Detection"
              expanded={expandedSections.has('services')}
              onToggle={() => toggleSection('services')}
              badge={
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded',
                    runningCount > 0
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                  )}
                >
                  {runningCount}/{totalServices}
                </span>
              }
            >
              <div className="space-y-2">
                {/* Refresh button */}
                {onRefreshServices && (
                  <button
                    onClick={onRefreshServices}
                    className="flex items-center gap-1.5 text-[10px] text-sky-400 hover:text-sky-300"
                  >
                    <RefreshCw size={10} />
                    Refresh
                  </button>
                )}

                {/* Service list */}
                {rawServices?.map((svc) => (
                  <div
                    key={svc.name}
                    className={cn(
                      'text-[10px] p-2 rounded border',
                      svc.running
                        ? 'bg-emerald-950/30 border-emerald-500/30'
                        : 'bg-slate-800/50 border-slate-700/50'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={cn(
                          'font-medium',
                          svc.running ? 'text-emerald-400' : 'text-slate-500'
                        )}
                      >
                        {svc.name}
                      </span>
                      <span
                        className={cn(
                          'px-1.5 py-0.5 rounded text-[9px]',
                          svc.running ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-500'
                        )}
                      >
                        {svc.running ? 'RUNNING' : 'STOPPED'}
                      </span>
                    </div>
                    <div className="text-slate-500 space-y-0.5">
                      <div>
                        Detection:{' '}
                        <span className="text-slate-400">{svc._detectionMethod || 'unknown'}</span>
                      </div>
                      <div>
                        URL: <span className="text-slate-400 font-mono">{svc.url || 'none'}</span>
                      </div>
                      {svc.pid && (
                        <div>
                          PID: <span className="text-slate-400 font-mono">{svc.pid}</span>
                        </div>
                      )}
                      <div>
                        UI State:{' '}
                        <span className="text-slate-400">{serviceStates[svc.name] || 'unknown'}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Last fetch time */}
                {lastFetchTime.services && (
                  <div className="text-[9px] text-slate-600 pt-1">
                    Last fetched: {lastFetchTime.services.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </Section>

            {/* Metrics Section */}
            <Section
              title="Cockpit Metrics"
              expanded={expandedSections.has('metrics')}
              onToggle={() => toggleSection('metrics')}
              badge={
                rawMetrics ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    {rawMetrics.health?.overall || 'unknown'}
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-500">
                    no data
                  </span>
                )
              }
            >
              <div className="space-y-2">
                {/* Refresh button */}
                {onRefreshMetrics && (
                  <button
                    onClick={onRefreshMetrics}
                    className="flex items-center gap-1.5 text-[10px] text-sky-400 hover:text-sky-300"
                  >
                    <RefreshCw size={10} />
                    Refresh
                  </button>
                )}

                {rawMetrics ? (
                  <>
                    {/* Quick stats */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-800/50 rounded p-2">
                        <div className="text-[9px] text-slate-500">Sessions</div>
                        <div className="text-sm font-mono text-white">
                          {rawMetrics.sessions?.active ?? '--'}
                        </div>
                      </div>
                      <div className="bg-slate-800/50 rounded p-2">
                        <div className="text-[9px] text-slate-500">Uptime</div>
                        <div className="text-sm font-mono text-white">
                          {rawMetrics.system?.uptimeSeconds
                            ? `${Math.floor(rawMetrics.system.uptimeSeconds / 3600)}h`
                            : '--'}
                        </div>
                      </div>
                    </div>

                    {/* Raw JSON */}
                    <details className="text-[9px]">
                      <summary className="text-slate-500 cursor-pointer hover:text-slate-400">
                        Raw JSON
                      </summary>
                      <pre className="mt-1 p-2 bg-slate-950 rounded text-slate-400 overflow-auto max-h-40 font-mono">
                        {JSON.stringify(rawMetrics, null, 2)}
                      </pre>
                    </details>
                  </>
                ) : (
                  <div className="text-[10px] text-slate-500 p-2 bg-slate-800/50 rounded">
                    No metrics data available
                  </div>
                )}

                {/* Last fetch time */}
                {lastFetchTime.metrics && (
                  <div className="text-[9px] text-slate-600 pt-1">
                    Last fetched: {lastFetchTime.metrics.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </Section>

            {/* Timestamps Section */}
            <Section
              title="Fetch Timestamps"
              expanded={expandedSections.has('timestamps')}
              onToggle={() => toggleSection('timestamps')}
            >
              <div className="text-[10px] space-y-1 text-slate-400">
                <div>
                  Services:{' '}
                  <span className="font-mono">
                    {lastFetchTime.services?.toISOString() || 'never'}
                  </span>
                </div>
                <div>
                  Metrics:{' '}
                  <span className="font-mono">
                    {lastFetchTime.metrics?.toISOString() || 'never'}
                  </span>
                </div>
              </div>
            </Section>
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-slate-700 text-[9px] text-slate-600">
            Press <kbd className="px-1 py-0.5 bg-slate-800 rounded">⌘D</kbd> to toggle
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
