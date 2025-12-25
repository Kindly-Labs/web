'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Server, Music, Brain, ExternalLink, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PRODUCT_TABS, type ProductTab } from '@/lib/types';
import { ClusterMetricsPanel } from './ClusterMetricsPanel';
import type { ClusterMetrics } from '@/lib/types';

interface ProductTabsViewProps {
  metrics: ClusterMetrics | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const ICONS: Record<string, typeof Server> = {
  server: Server,
  music: Music,
  brain: Brain,
};

function TabButton({
  tab,
  isActive,
  onClick,
}: {
  tab: ProductTab;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = ICONS[tab.icon] || Server;

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'text-white'
          : 'text-slate-400 hover:text-slate-200'
      )}
    >
      <Icon size={16} />
      <span>{tab.name}</span>
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-x-0 -bottom-px h-0.5 bg-sky-400"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </button>
  );
}

function ProductIframe({ url, title }: { url: string; title: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
          <div className="flex items-center gap-2 text-slate-500">
            <RefreshCw className="animate-spin" size={20} />
            <span>Loading {title}...</span>
          </div>
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
          <div className="mb-4 text-slate-400">Failed to load {title}</div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm text-sky-400 hover:bg-slate-700"
          >
            <ExternalLink size={16} />
            Open in new tab
          </a>
        </div>
      )}
      <iframe
        src={url}
        title={title}
        className={cn(
          'h-full w-full border-0',
          (isLoading || hasError) && 'invisible'
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
      />
    </div>
  );
}

export function ProductTabsView({
  metrics,
  isLoading,
  error,
  onRefresh,
}: ProductTabsViewProps) {
  const [activeTabId, setActiveTabId] = useState<string>('cluster');

  const activeTab = PRODUCT_TABS.find((t) => t.id === activeTabId) ?? PRODUCT_TABS[0];

  return (
    <div className="flex h-full flex-col">
      {/* Tab Bar */}
      <div className="flex items-center justify-between border-b border-slate-700/50 bg-slate-800/30 px-2">
        <div className="flex">
          {PRODUCT_TABS.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={activeTabId === tab.id}
              onClick={() => setActiveTabId(tab.id)}
            />
          ))}
        </div>
        <button
          onClick={onRefresh}
          className="mr-2 rounded p-1.5 text-slate-400 hover:bg-slate-700/50 hover:text-white"
          title="Refresh metrics"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-0 flex-1">
        {activeTab.id === 'cluster' ? (
          <ClusterMetricsPanel
            metrics={metrics}
            isLoading={isLoading}
            error={error}
          />
        ) : activeTab.iframeUrl ? (
          <ProductIframe url={activeTab.iframeUrl} title={activeTab.name} />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500">
            No dashboard configured for {activeTab.name}
          </div>
        )}
      </div>
    </div>
  );
}
