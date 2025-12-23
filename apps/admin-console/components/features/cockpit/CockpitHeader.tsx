'use client';

import {
  Activity,
  Loader2,
  AlertTriangle,
  Play,
  Square,
  Clock,
  RefreshCw,
  Download,
  FileText,
  Key,
  Settings,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuickActionButton } from './QuickActionButton';
import { EnvironmentSwitcher } from './EnvironmentSwitcher';
import { cn } from '@/lib/utils';

interface CockpitHeaderProps {
  runningCount: number;
  totalCount: number;
  healthStatus: 'healthy' | 'partial' | 'degraded' | 'stopped';
  isStartingAny: boolean;
  onStartAll: () => void;
  onStopAll: () => void;
  lastUpdated: Date | null;
  // Quick action callbacks
  onRefresh?: () => void;
  onExport?: () => void;
  onOpenPrompt?: () => void;
  onOpenCodes?: () => void;
  onOpenSettings?: () => void;
  onOpenAudit?: () => void;
  isRefreshing?: boolean;
  isExporting?: boolean;
}

export function CockpitHeader({
  runningCount,
  totalCount,
  healthStatus,
  isStartingAny,
  onStartAll,
  onStopAll,
  lastUpdated,
  onRefresh,
  onExport,
  onOpenPrompt,
  onOpenCodes,
  onOpenSettings,
  onOpenAudit,
  isRefreshing,
  isExporting,
}: CockpitHeaderProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <header className="flex h-12 items-center justify-between border-b border-slate-800/50 bg-slate-900/50 px-4 backdrop-blur-xl">
      {/* Left - Title, Environment, and Health */}
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-semibold tracking-wider text-white uppercase">Pilot Cockpit</h1>

        {/* Environment Switcher */}
        <EnvironmentSwitcher />

        {/* Health Badge */}
        <div
          className={cn(
            'flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium',
            healthStatus === 'healthy' &&
              'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
            healthStatus === 'partial' && 'border-amber-500/30 bg-amber-500/10 text-amber-400',
            healthStatus === 'degraded' && 'border-red-500/30 bg-red-500/10 text-red-400',
            healthStatus === 'stopped' && 'border-slate-500/30 bg-slate-500/10 text-slate-400'
          )}
        >
          {healthStatus === 'degraded' ? (
            <AlertTriangle size={12} />
          ) : isStartingAny ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Activity size={12} />
          )}
          {runningCount}/{totalCount} Services
        </div>
      </div>

      {/* Center - Quick Actions */}
      <div className="flex items-center gap-1 rounded-lg bg-slate-800/30 px-2 py-1">
        {onRefresh && (
          <QuickActionButton
            icon={RefreshCw}
            label="Refresh"
            onClick={onRefresh}
            shortcut="R"
            loading={isRefreshing}
          />
        )}
        {onExport && (
          <QuickActionButton
            icon={Download}
            label="Export"
            onClick={onExport}
            shortcut="E"
            loading={isExporting}
          />
        )}
        {onOpenPrompt && (
          <QuickActionButton icon={FileText} label="Prompt" onClick={onOpenPrompt} shortcut="P" />
        )}
        {onOpenCodes && (
          <QuickActionButton icon={Key} label="Codes" onClick={onOpenCodes} shortcut="C" />
        )}
        {onOpenSettings && (
          <QuickActionButton
            icon={Settings}
            label="Settings"
            onClick={onOpenSettings}
            shortcut=","
          />
        )}
        {onOpenAudit && (
          <QuickActionButton
            icon={Shield}
            label="Audit"
            onClick={onOpenAudit}
            shortcut="A"
          />
        )}
      </div>

      {/* Right - Clock and Bulk Actions */}
      <div className="flex items-center gap-4">
        {/* Clock */}
        <div className="flex items-center gap-2 text-slate-400">
          <Clock size={14} />
          <span className="font-mono text-sm">
            {lastUpdated ? formatTime(lastUpdated) : '--:--:--'}
          </span>
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onStartAll}
            disabled={runningCount === totalCount || isStartingAny}
            className="h-7 border-emerald-900/50 px-3 text-xs text-emerald-400 hover:bg-emerald-950/50 hover:text-emerald-300 disabled:opacity-50"
          >
            <Play size={12} className="mr-1.5" />
            Start All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onStopAll}
            disabled={runningCount === 0}
            className="h-7 border-red-900/50 px-3 text-xs text-red-400 hover:bg-red-950/50 hover:text-red-300 disabled:opacity-50"
          >
            <Square size={12} className="mr-1.5" />
            Stop All
          </Button>
        </div>
      </div>
    </header>
  );
}
