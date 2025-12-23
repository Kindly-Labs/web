'use client';

import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CheckResult } from '@/lib/hooks/useStatusCheck';

interface WorkflowCheckProps {
  check: CheckResult;
}

export function WorkflowCheck({ check }: WorkflowCheckProps) {
  const statusIcon = {
    pass: <CheckCircle size={14} className="text-emerald-400" />,
    warn: <AlertTriangle size={14} className="text-amber-400" />,
    fail: <XCircle size={14} className="text-red-400" />,
  };

  const statusColor = {
    pass: 'text-emerald-400',
    warn: 'text-amber-400',
    fail: 'text-red-400',
  };

  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <div className="flex items-center gap-2">
        {statusIcon[check.status]}
        <span className="text-slate-300">{check.name}</span>
      </div>
      <div className="flex items-center gap-2">
        {check.error ? (
          <span className={cn('text-xs', statusColor[check.status])}>{check.error}</span>
        ) : (
          <span className="font-mono text-xs text-slate-500">{check.latencyMs}ms</span>
        )}
      </div>
    </div>
  );
}
