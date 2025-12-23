'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, GitBranch, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEnvironment } from '@/lib/context/EnvironmentContext';

interface BuildInfo {
  version: string;
  commit: string;
  branch: string;
  build_time: string;
  go_version: string;
  uptime: string;
}

interface CockpitFooterProps {
  lastUpdated: Date | null;
  error: string | null;
}

const isProduction = process.env.NEXT_PUBLIC_BACKEND_URL?.includes('api.cogito.cv');

const siteUrls = {
  aether: isProduction ? 'https://aether.kindly-labs.org' : 'http://localhost:3004',
  workbench: isProduction ? 'https://app.kindly-labs.org' : 'http://localhost:3003',
  auralnet: isProduction ? 'https://www.kindly-labs.org' : 'http://localhost:4321',
};

export function CockpitFooter({ lastUpdated, error }: CockpitFooterProps) {
  const { environment, isAuthenticated, getAuthHeaders } = useEnvironment();
  const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch build info in production mode
  useEffect(() => {
    if (environment !== 'production' || !isAuthenticated) {
      setBuildInfo(null);
      return;
    }

    const fetchBuildInfo = async () => {
      try {
        const response = await fetch('/api/production/info', {
          headers: getAuthHeaders(),
        });
        if (response.ok) {
          const data = await response.json();
          setBuildInfo(data);
        }
      } catch (err) {
        console.error('Failed to fetch build info:', err);
      }
    };

    fetchBuildInfo();
    // Refresh every 5 minutes to update uptime
    const interval = setInterval(fetchBuildInfo, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [environment, isAuthenticated, getAuthHeaders]);

  // Copy commit hash to clipboard
  const copyCommit = useCallback(() => {
    if (buildInfo?.commit) {
      navigator.clipboard.writeText(buildInfo.commit);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [buildInfo]);

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
          href={siteUrls.aether}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] tracking-wider text-cyan-500 uppercase transition-colors hover:text-cyan-300"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-500" />
          Aether
        </a>
        <a
          href={siteUrls.workbench}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] tracking-wider text-amber-500 uppercase transition-colors hover:text-amber-300"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Workbench
        </a>
        <a
          href={siteUrls.auralnet}
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

      {/* Build Info (Production Only) */}
      {buildInfo && (
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <GitBranch size={10} className="text-slate-600" />
          <span className="text-slate-400">v{buildInfo.version}</span>
          <span className="text-slate-600">•</span>
          <button
            onClick={copyCommit}
            className="flex items-center gap-1 font-mono text-cyan-500 transition-colors hover:text-cyan-300"
            title="Click to copy full commit hash"
          >
            {buildInfo.commit.slice(0, 7)}
            {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
          </button>
          <span className="text-slate-600">•</span>
          <span className="text-purple-400">{buildInfo.branch}</span>
          {buildInfo.uptime && (
            <>
              <span className="text-slate-600">•</span>
              <span className="text-slate-500">{buildInfo.uptime}</span>
            </>
          )}
        </div>
      )}

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
