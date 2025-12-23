'use client';

import { CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkflowCheck } from './WorkflowCheck';
import { UptimeBadge } from './UptimeBadge';
import { HistoryTimeline } from './HistoryTimeline';
import type { CheckResult } from '@/lib/hooks/useStatusCheck';
import { getSiteStatus } from '@/lib/hooks/useStatusCheck';
import type { ServiceHistoryResponse } from '@/lib/hooks/useStatusHistory';

interface SiteStatusCardProps {
  title: string;
  subtitle: string;
  url?: string;
  checks: CheckResult[];
  uptime?: number;
  serviceName?: string;
  getServiceHistory?: (name: string) => Promise<ServiceHistoryResponse | null>;
}

export function SiteStatusCard({
  title,
  subtitle,
  url,
  checks,
  uptime,
  serviceName,
  getServiceHistory,
}: SiteStatusCardProps) {
  const status = getSiteStatus(checks);

  const statusConfig = {
    pass: {
      icon: <CheckCircle size={20} />,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
    },
    warn: {
      icon: <AlertTriangle size={20} />,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
    },
    fail: {
      icon: <XCircle size={20} />,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        config.borderColor,
        config.bgColor,
        'transition-all hover:shadow-lg'
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('flex-shrink-0', config.color)}>{config.icon}</div>
          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {uptime !== undefined && <UptimeBadge uptime={uptime} size="sm" />}
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 transition-colors hover:text-slate-300"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>

      {/* Checks */}
      <div className="divide-y divide-slate-700/50">
        {checks.map((check, index) => (
          <WorkflowCheck key={`${check.name}-${index}`} check={check} />
        ))}
      </div>

      {/* History Timeline */}
      {serviceName && getServiceHistory && (
        <div className="mt-3">
          <HistoryTimeline serviceName={serviceName} getServiceHistory={getServiceHistory} />
        </div>
      )}

      {/* Summary */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-700/50 pt-3">
        <span className="text-xs text-slate-500">
          {checks.filter((c) => c.status === 'pass').length}/{checks.length} checks passed
        </span>
        <span className={cn('text-xs font-medium uppercase', config.color)}>
          {status === 'pass' ? 'Healthy' : status === 'warn' ? 'Degraded' : 'Unhealthy'}
        </span>
      </div>
    </div>
  );
}
