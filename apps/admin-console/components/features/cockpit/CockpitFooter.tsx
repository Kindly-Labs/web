'use client';

import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CockpitFooterProps {
  lastUpdated: Date | null;
  error: string | null;
}

export function CockpitFooter({ lastUpdated, error }: CockpitFooterProps) {
  const getTimeSince = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  return (
    <footer className="flex h-8 items-center justify-between border-t border-slate-800/50 bg-slate-900/50 px-4 backdrop-blur-xl">
      {/* Multi-Site Navigation */}
      <nav className="flex items-center gap-4">
        <span className="text-[9px] tracking-wider text-slate-600 uppercase">Sites:</span>
        <a
          href="http://localhost:3004"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] tracking-wider text-cyan-500 uppercase transition-colors hover:text-cyan-300"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-500" />
          Aether
        </a>
        <a
          href="http://localhost:3003"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] tracking-wider text-amber-500 uppercase transition-colors hover:text-amber-300"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Workbench
        </a>
        <a
          href="http://localhost:4321"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] tracking-wider text-purple-500 uppercase transition-colors hover:text-purple-300"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
          AuralNet
        </a>
      </nav>

      {/* Keyboard Shortcuts */}
      <div className="flex items-center gap-3">
        <span className="text-[9px] text-slate-600">
          <kbd className="rounded bg-slate-800 px-1 py-0.5 font-mono text-slate-500">S</kbd> Start
        </span>
        <span className="text-[9px] text-slate-600">
          <kbd className="rounded bg-slate-800 px-1 py-0.5 font-mono text-slate-500">X</kbd> Stop
        </span>
        <span className="text-[9px] text-slate-600">
          <kbd className="rounded bg-slate-800 px-1 py-0.5 font-mono text-slate-500">1-5</kbd>{' '}
          Presets
        </span>
        <span className="text-[9px] text-slate-600">
          <kbd className="rounded bg-slate-800 px-1 py-0.5 font-mono text-slate-500">⌘K</kbd> Search
        </span>
      </div>

      {/* Sync Status */}
      <div className="flex items-center gap-2">
        {error ? (
          <span className="text-[10px] text-red-400">⚠ {error}</span>
        ) : lastUpdated ? (
          <span
            className={cn(
              'flex items-center gap-1.5 text-[10px]',
              Date.now() - lastUpdated.getTime() > 30000 ? 'text-amber-400' : 'text-slate-500'
            )}
          >
            <RefreshCw size={10} />
            Updated {getTimeSince(lastUpdated)}
          </span>
        ) : null}
      </div>
    </footer>
  );
}
