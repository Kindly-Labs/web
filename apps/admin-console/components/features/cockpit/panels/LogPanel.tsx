'use client';

import { useRef, useImperativeHandle, forwardRef } from 'react';
import { Terminal } from 'lucide-react';
import { UnifiedLogTerminal, type LogTerminalRef } from '@/components/features/logs';
import { cn } from '@/lib/utils';
import type { ServiceState } from '@/lib/types';

interface LogPanelProps {
  services: string[];
  serviceStates: Record<string, ServiceState>;
  className?: string;
}

export interface LogPanelRef {
  focusSearch: () => void;
  applyPresetByIndex: (index: number) => void;
}

export const LogPanel = forwardRef<LogPanelRef, LogPanelProps>(function LogPanel(
  { services, serviceStates, className },
  ref
) {
  const terminalRef = useRef<LogTerminalRef>(null);

  useImperativeHandle(ref, () => ({
    focusSearch: () => terminalRef.current?.focusSearch(),
    applyPresetByIndex: (index: number) => terminalRef.current?.applyPresetByIndex(index),
  }));

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Panel Header */}
      <div className="flex items-center gap-2 border-b border-slate-700/50 px-3 py-2">
        <Terminal size={14} className="text-emerald-400" />
        <span className="text-xs font-medium tracking-wider text-white uppercase">Logs</span>
      </div>

      {/* Log Terminal (compact mode) */}
      <div className="min-h-0 flex-1">
        <UnifiedLogTerminal
          ref={terminalRef}
          services={services}
          serviceStates={serviceStates}
          expanded={true}
          onExpandedChange={() => {}}
          compact={true}
        />
      </div>
    </div>
  );
});
