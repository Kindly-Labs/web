'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Server,
  Building2,
  Smartphone,
  ClipboardList,
  ExternalLink,
  RefreshCw,
  Loader2,
  Wifi,
  WifiOff,
  Rocket,
  Container,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { PRODUCTION_CONFIG } from '@/lib/environment';
import { useEnvironment } from '@/lib/context/EnvironmentContext';

interface SiteHealth {
  status: 'online' | 'degraded' | 'offline' | 'checking';
  latencyMs: number;
  statusCode?: number;
}

interface SiteWithHealth {
  name: string;
  url: string;
  description: string;
  icon: string;
  health: SiteHealth;
}

// Icon mapping
const ICON_MAP: Record<string, React.ElementType> = {
  Server: Server,
  Building2: Building2,
  Smartphone: Smartphone,
  ClipboardList: ClipboardList,
};

// Site colors
const SITE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  workbench: { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/30' },
  auralnet: { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/30' },
  aether: { bg: 'bg-cyan-500', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  api: { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/30' },
};

interface DockerContainer {
  name: string;
  status: 'running' | 'stopped' | 'restarting' | 'unknown';
  state: string;
}

interface ProductionTopologyPanelProps {
  onDeploy?: (site: string) => void;
  className?: string;
}

// Docker containers available for management
const DOCKER_CONTAINERS = ['backend', 'kokoro', 'caddy'];

export function ProductionTopologyPanel({ onDeploy, className }: ProductionTopologyPanelProps) {
  const { isAuthenticated, getAuthHeaders, environment } = useEnvironment();
  const [sites, setSites] = useState<Record<string, SiteWithHealth>>({});
  const [containers, setContainers] = useState<Record<string, DockerContainer>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [restartingContainer, setRestartingContainer] = useState<string | null>(null);
  const [confirmRestart, setConfirmRestart] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    setIsRefreshing(true);

    try {
      const response = await fetch('/api/production/health');
      const data = await response.json();

      if (data.sites) {
        setSites(data.sites);
      }
      setLastChecked(new Date());
    } catch (error) {
      console.error('Failed to check production health:', error);
      // Set all sites to checking state on error
      const errorSites: Record<string, SiteWithHealth> = {};
      Object.entries(PRODUCTION_CONFIG.sites).forEach(([key, site]) => {
        errorSites[key] = {
          ...site,
          health: { status: 'offline', latencyMs: 0 },
        };
      });
      setSites(errorSites);
    }

    setIsRefreshing(false);
  }, []);

  // Fetch Docker container status
  const fetchContainers = useCallback(async () => {
    if (environment !== 'production' || !isAuthenticated) return;

    try {
      const response = await fetch('/api/production/docker/containers', {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.containers) {
          const containerMap: Record<string, DockerContainer> = {};
          data.containers.forEach((c: DockerContainer) => {
            containerMap[c.name] = c;
          });
          setContainers(containerMap);
        }
      }
    } catch (error) {
      console.error('Failed to fetch containers:', error);
    }
  }, [environment, isAuthenticated, getAuthHeaders]);

  // Restart a container
  const restartContainer = useCallback(
    async (containerName: string) => {
      setRestartingContainer(containerName);
      setConfirmRestart(null);

      try {
        const response = await fetch(`/api/production/docker/containers/${containerName}/restart`, {
          method: 'POST',
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          const data = await response.json();
          console.error('Failed to restart container:', data.error);
        }

        // If restarting backend, show reconnecting message
        if (containerName === 'backend') {
          // Update container status locally
          setContainers((prev) => ({
            ...prev,
            [containerName]: { ...prev[containerName], status: 'restarting' },
          }));
        }

        // Refresh container status after a delay
        setTimeout(fetchContainers, 3000);
      } catch (error) {
        console.error('Failed to restart container:', error);
      } finally {
        setRestartingContainer(null);
      }
    },
    [getAuthHeaders, fetchContainers]
  );

  // Initial check and periodic refresh
  useEffect(() => {
    checkHealth();
    fetchContainers();
    const interval = setInterval(checkHealth, 60000); // Check every minute
    const containerInterval = setInterval(fetchContainers, 30000); // Check containers every 30s
    return () => {
      clearInterval(interval);
      clearInterval(containerInterval);
    };
  }, [checkHealth, fetchContainers]);

  const getStatusIcon = (status: SiteHealth['status']) => {
    if (status === 'checking') return <Loader2 size={10} className="animate-spin text-slate-400" />;
    if (status === 'online') return <Wifi size={10} className="text-emerald-400" />;
    if (status === 'degraded') return <Wifi size={10} className="text-amber-400" />;
    return <WifiOff size={10} className="text-red-400" />;
  };

  // Calculate overall health
  const siteList = Object.entries(sites);
  const onlineCount = siteList.filter(([_, s]) => s.health.status === 'online').length;
  const totalCount = siteList.length || Object.keys(PRODUCTION_CONFIG.sites).length;

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Panel Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-700/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-emerald-400" />
          <span className="text-xs font-medium tracking-wider text-white uppercase">Production Sites</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
            {onlineCount}/{totalCount} Online
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkHealth}
            disabled={isRefreshing}
            className="h-5 w-5 p-0 text-slate-400 hover:text-white"
          >
            <RefreshCw size={10} className={cn(isRefreshing && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Sites List */}
      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {Object.entries(PRODUCTION_CONFIG.sites).map(([key, siteConfig]) => {
          const site = sites[key] || { ...siteConfig, health: { status: 'checking', latencyMs: 0 } };
          const colors = SITE_COLORS[key] || SITE_COLORS.api;
          const Icon = ICON_MAP[siteConfig.icon] || Server;
          const isOnline = site.health.status === 'online';

          return (
            <motion.div
              key={key}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 transition-all',
                'hover:bg-slate-800/50'
              )}
              whileTap={{ scale: 0.98 }}
            >
              {/* Status Indicator */}
              <div className="flex-shrink-0">{getStatusIcon(site.health.status)}</div>

              {/* Icon */}
              <Icon
                size={14}
                className={cn('flex-shrink-0', isOnline ? colors.text : 'text-slate-500')}
              />

              {/* Site Info */}
              <div className="min-w-0 flex-1">
                <div
                  className={cn(
                    'truncate text-xs font-medium',
                    isOnline ? 'text-slate-200' : 'text-slate-500'
                  )}
                >
                  {siteConfig.name}
                </div>
                <div className="truncate text-[10px] text-slate-500">
                  {siteConfig.url.replace('https://', '')}
                </div>
              </div>

              {/* Latency */}
              {site.health.latencyMs > 0 && (
                <span
                  className={cn(
                    'flex-shrink-0 font-mono text-[9px]',
                    site.health.latencyMs > 2000
                      ? 'text-red-400'
                      : site.health.latencyMs > 1000
                        ? 'text-amber-400'
                        : 'text-slate-500'
                  )}
                >
                  {site.health.latencyMs}ms
                </span>
              )}

              {/* Actions */}
              <div className="flex flex-shrink-0 items-center gap-1">
                {/* Open in browser */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(siteConfig.url, '_blank');
                  }}
                  className="h-5 w-5 p-0 text-sky-400 hover:bg-sky-950/50 hover:text-sky-300"
                >
                  <ExternalLink size={10} />
                </Button>

                {/* Deploy button (only for API, requires auth) */}
                {key === 'api' && isAuthenticated && onDeploy && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeploy(key);
                    }}
                    className="h-5 w-5 p-0 text-amber-400 hover:bg-amber-950/50 hover:text-amber-300"
                    title="Deploy"
                  >
                    <Rocket size={10} />
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Docker Containers Section (Production only) */}
        {environment === 'production' && isAuthenticated && (
          <>
            <div className="mt-3 flex items-center gap-2 border-t border-slate-700/30 pt-3">
              <Container size={12} className="text-purple-400" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Docker Services
              </span>
            </div>

            {DOCKER_CONTAINERS.map((containerName) => {
              const container = containers[containerName];
              const isRunning = container?.status === 'running';
              const isRestarting = restartingContainer === containerName || container?.status === 'restarting';

              const containerColors: Record<string, { text: string; bg: string }> = {
                backend: { text: 'text-emerald-400', bg: 'bg-emerald-500/20' },
                kokoro: { text: 'text-purple-400', bg: 'bg-purple-500/20' },
                caddy: { text: 'text-amber-400', bg: 'bg-amber-500/20' },
              };
              const colors = containerColors[containerName] || { text: 'text-slate-400', bg: 'bg-slate-500/20' };

              return (
                <motion.div
                  key={containerName}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 transition-all',
                    'hover:bg-slate-800/50'
                  )}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Status Indicator */}
                  <div className="flex-shrink-0">
                    {isRestarting ? (
                      <Loader2 size={10} className="animate-spin text-amber-400" />
                    ) : isRunning ? (
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-red-400" />
                    )}
                  </div>

                  {/* Container Icon */}
                  <Container size={14} className={cn('flex-shrink-0', colors.text)} />

                  {/* Container Info */}
                  <div className="min-w-0 flex-1">
                    <div className={cn('truncate text-xs font-medium', colors.text)}>
                      {containerName}
                    </div>
                    <div className="truncate text-[10px] text-slate-500">
                      {isRestarting
                        ? 'Restarting...'
                        : container?.state || (isRunning ? 'Running' : 'Stopped')}
                    </div>
                  </div>

                  {/* Restart Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmRestart(containerName);
                    }}
                    disabled={isRestarting}
                    className={cn(
                      'h-5 w-5 p-0',
                      isRestarting
                        ? 'text-slate-500'
                        : 'text-amber-400 hover:bg-amber-950/50 hover:text-amber-300'
                    )}
                    title={`Restart ${containerName}`}
                  >
                    <RotateCcw size={10} className={cn(isRestarting && 'animate-spin')} />
                  </Button>
                </motion.div>
              );
            })}
          </>
        )}
      </div>

      {/* Restart Confirmation Modal */}
      <Modal
        isOpen={!!confirmRestart}
        onClose={() => setConfirmRestart(null)}
        title={`Restart ${confirmRestart}?`}
      >
        <div className="space-y-4">
          {confirmRestart === 'backend' && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 p-3 text-amber-400">
              <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Warning: Backend Restart</p>
                <p className="mt-1 text-xs text-amber-300/80">
                  Restarting the backend will temporarily disconnect this console. The connection
                  will automatically recover after the service restarts.
                </p>
              </div>
            </div>
          )}

          <p className="text-sm text-slate-300">
            Are you sure you want to restart the <strong>{confirmRestart}</strong> container?
          </p>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setConfirmRestart(null)}>
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => confirmRestart && restartContainer(confirmRestart)}
              className="bg-amber-500 text-white hover:bg-amber-600"
            >
              <RotateCcw size={12} className="mr-1" />
              Restart
            </Button>
          </div>
        </div>
      </Modal>

      {/* Footer */}
      {lastChecked && (
        <div className="border-t border-slate-700/50 px-3 py-1.5">
          <span className="text-[10px] text-slate-500">
            Last checked: {lastChecked.toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
}
