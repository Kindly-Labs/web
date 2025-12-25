'use client';

import { Shield, Clock } from 'lucide-react';

interface HeaderProps {
  lastUpdated: Date | null;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function Header({ lastUpdated }: HeaderProps) {
  return (
    <header className="flex h-12 items-center justify-between border-b border-slate-700/50 bg-slate-800/50 px-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600">
          <Shield size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white">Ops Console</h1>
          <p className="text-[10px] text-slate-500">Cogito Infrastructure</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {lastUpdated && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock size={12} />
            <span>Updated {formatTime(lastUpdated)}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-slate-400">Connected</span>
        </div>
      </div>
    </header>
  );
}
