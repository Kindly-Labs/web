'use client';

import { Cpu, HardDrive, MemoryStick, Clock, Server, Activity, Database, Wifi } from 'lucide-react';
import { MetricTile } from '@/components/ui/MetricTile';
import type { ClusterMetrics } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ClusterMetricsPanelProps {
  metrics: ClusterMetrics | null;
  isLoading: boolean;
  error: string | null;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function getUsageStatus(percent: number): 'healthy' | 'warning' | 'critical' {
  if (percent >= 90) return 'critical';
  if (percent >= 75) return 'warning';
  return 'healthy';
}

export function ClusterMetricsPanel({ metrics, isLoading, error }: ClusterMetricsPanelProps) {
  if (isLoading && !metrics) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-slate-500">Loading cluster metrics...</div>
      </div>
    );
  }

  const node = metrics?.node;
  const oracle = metrics?.oracle;
  const pods = metrics?.pods ?? [];
  const argocd = metrics?.argocd;
  const caddy = metrics?.caddy;

  const runningPods = pods.filter((p) => p.status === 'Running').length;
  const totalPods = pods.length;
  const healthyApps = argocd?.apps.filter((a) => a.health_status === 'Healthy').length ?? 0;
  const totalApps = argocd?.apps.length ?? 0;
  const healthyRoutes = caddy?.routes.filter((r) => r.healthy).length ?? 0;
  const totalRoutes = caddy?.routes.length ?? 0;

  const cpuPercent = node?.cpu_percent ?? 0;
  const memoryPercent = node ? (node.memory_used_gb / node.memory_total_gb) * 100 : 0;
  const diskPercent = node ? (node.disk_used_gb / node.disk_total_gb) * 100 : 0;
  const storagePercent = oracle ? (oracle.storage_used_gb / oracle.storage_limit_gb) * 100 : 0;

  return (
    <div className="flex h-full flex-col p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Cluster Overview</h2>
        {error && (
          <span className="text-xs text-amber-400">{error}</span>
        )}
      </div>

      {/* Node Resources */}
      <div className="mb-4">
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
          Node Resources
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <MetricTile
            label="CPU"
            value={cpuPercent.toFixed(1)}
            unit="%"
            icon={Cpu}
            status={getUsageStatus(cpuPercent)}
          />
          <MetricTile
            label="Memory"
            value={memoryPercent.toFixed(1)}
            unit="%"
            icon={MemoryStick}
            status={getUsageStatus(memoryPercent)}
          />
          <MetricTile
            label="Disk"
            value={diskPercent.toFixed(1)}
            unit="%"
            icon={HardDrive}
            status={getUsageStatus(diskPercent)}
          />
          <MetricTile
            label="Uptime"
            value={formatUptime(node?.uptime_seconds ?? 0)}
            icon={Clock}
          />
        </div>
      </div>

      {/* Oracle Free Tier Limits */}
      {oracle && (
        <div className="mb-4">
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
            Oracle Free Tier
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3">
              <div className="mb-2 flex items-center gap-2 text-slate-500">
                <Database size={12} />
                <span className="text-[10px] uppercase tracking-wider">Storage</span>
              </div>
              <div className="flex items-end justify-between">
                <span className={cn(
                  'font-mono text-2xl font-semibold',
                  getUsageStatus(storagePercent) === 'healthy' && 'text-emerald-400',
                  getUsageStatus(storagePercent) === 'warning' && 'text-amber-400',
                  getUsageStatus(storagePercent) === 'critical' && 'text-red-400',
                )}>
                  {oracle.storage_used_gb.toFixed(1)}
                </span>
                <span className="text-xs text-slate-500">/ {oracle.storage_limit_gb} GB</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700">
                <div
                  className={cn(
                    'h-full transition-all',
                    getUsageStatus(storagePercent) === 'healthy' && 'bg-emerald-500',
                    getUsageStatus(storagePercent) === 'warning' && 'bg-amber-500',
                    getUsageStatus(storagePercent) === 'critical' && 'bg-red-500',
                  )}
                  style={{ width: `${Math.min(storagePercent, 100)}%` }}
                />
              </div>
            </div>
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3">
              <div className="mb-2 flex items-center gap-2 text-slate-500">
                <Wifi size={12} />
                <span className="text-[10px] uppercase tracking-wider">Egress</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="font-mono text-2xl font-semibold text-emerald-400">
                  {oracle.egress_used_tb.toFixed(2)}
                </span>
                <span className="text-xs text-slate-500">/ {oracle.egress_limit_tb} TB</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${Math.min((oracle.egress_used_tb / oracle.egress_limit_tb) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Health */}
      <div>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
          Service Health
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <MetricTile
            label="Pods"
            value={`${runningPods}/${totalPods}`}
            icon={Server}
            status={runningPods === totalPods ? 'healthy' : runningPods > 0 ? 'warning' : 'critical'}
          />
          <MetricTile
            label="ArgoCD Apps"
            value={`${healthyApps}/${totalApps}`}
            icon={Activity}
            status={healthyApps === totalApps ? 'healthy' : healthyApps > 0 ? 'warning' : 'critical'}
          />
          <MetricTile
            label="Routes"
            value={`${healthyRoutes}/${totalRoutes}`}
            icon={Wifi}
            status={healthyRoutes === totalRoutes ? 'healthy' : healthyRoutes > 0 ? 'warning' : 'critical'}
          />
        </div>
      </div>
    </div>
  );
}
