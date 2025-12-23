'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUptimeBadgeColor, formatUptime } from '@/lib/hooks/useStatusHistory';

interface UptimeBadgeProps {
  uptime: number;
  showTrend?: boolean;
  previousUptime?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UptimeBadge({
  uptime,
  showTrend = false,
  previousUptime,
  size = 'md',
  className,
}: UptimeBadgeProps) {
  const colors = getUptimeBadgeColor(uptime);

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSize = {
    sm: 10,
    md: 12,
    lg: 14,
  };

  const trend =
    showTrend && previousUptime !== undefined
      ? uptime > previousUptime
        ? 'up'
        : uptime < previousUptime
          ? 'down'
          : 'stable'
      : null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        colors.bg,
        colors.text,
        colors.border,
        'border',
        sizeClasses[size],
        className
      )}
    >
      <span>{formatUptime(uptime)}</span>
      {trend === 'up' && <TrendingUp size={iconSize[size]} className="text-emerald-400" />}
      {trend === 'down' && <TrendingDown size={iconSize[size]} className="text-red-400" />}
      {trend === 'stable' && <Minus size={iconSize[size]} className="text-slate-400" />}
    </span>
  );
}

interface UptimeLabelProps {
  uptime: number;
  period?: string;
  className?: string;
}

export function UptimeLabel({ uptime, period = '24h', className }: UptimeLabelProps) {
  const colors = getUptimeBadgeColor(uptime);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <UptimeBadge uptime={uptime} size="sm" />
      <span className={cn('text-xs', colors.text)}>uptime ({period})</span>
    </div>
  );
}
