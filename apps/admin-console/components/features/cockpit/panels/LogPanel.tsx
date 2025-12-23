'use client';

import { useRef, useImperativeHandle, forwardRef } from 'react';
import { Terminal, Cloud, Monitor } from 'lucide-react';
import { UnifiedLogTerminal, type LogTerminalRef } from '@/components/features/logs';
import {
  ProductionLogTerminal,
  type ProductionLogTerminalRef,
} from '@/components/features/logs/ProductionLogTerminal';
import { useEnvironment } from '@/lib/context/EnvironmentContext';
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
  const { environment, isAuthenticated } = useEnvironment();
  const localTerminalRef = useRef<LogTerminalRef>(null);
  const productionTerminalRef = useRef<ProductionLogTerminalRef>(null);

  const isProductionMode = environment === 'production' && isAuthenticated;

  useImperativeHandle(ref, () => ({
    focusSearch: () => {
      if (isProductionMode) {
        productionTerminalRef.current?.focusSearch();
      } else {
        localTerminalRef.current?.focusSearch();
      }
    },
    applyPresetByIndex: (index: number) => {
      // Only local terminal supports presets
      if (!isProductionMode) {
        localTerminalRef.current?.applyPresetByIndex(index);
      }
    },
  }));

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-700/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-emerald-400" />
          <span className="text-xs font-medium tracking-wider text-white uppercase">Logs</span>
        </div>
        {/* Environment indicator */}
        <div
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]',
            isProductionMode
              ? 'bg-purple-500/20 text-purple-400'
              : 'bg-slate-600/30 text-slate-400'
          )}
        >
          {isProductionMode ? (
            <>
              <Cloud size={10} />
              <span>Production</span>
            </>
          ) : (
            <>
              <Monitor size={10} />
              <span>Local</span>
            </>
          )}
        </div>
      </div>

      {/* Log Terminal (compact mode) */}
      <div className="min-h-0 flex-1">
        {isProductionMode ? (
          <ProductionLogTerminal ref={productionTerminalRef} compact />
        ) : (
          <UnifiedLogTerminal
            ref={localTerminalRef}
            services={services}
            serviceStates={serviceStates}
            expanded={true}
            onExpandedChange={() => {}}
            compact={true}
          />
        )}
      </div>
    </div>
  );
});
