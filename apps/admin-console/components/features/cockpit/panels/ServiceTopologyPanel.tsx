'use client';

import { motion } from 'framer-motion';
import {
  Network,
  Play,
  Square,
  Loader2,
  Brain,
  Server,
  Activity,
  Box,
  Languages,
  ExternalLink,
  Database,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ServiceStatus, ServiceState } from '@/lib/types';

// Client-safe service URLs (hardcoded to avoid fs dependency)
const SERVICE_URLS: Record<string, string> = {
  backend: 'http://localhost:3002',
  frontend: 'http://localhost:3004',
  tts: 'http://localhost:8880',
  mlx: 'http://localhost:8000',
  langdetect: 'http://localhost:8001',
  database: '', // Virtual node - no direct URL
};

// Services that have a web interface (not just API)
const HAS_WEB_UI = new Set(['frontend', 'backend']);

// Infrastructure dependencies (shown differently from services)
const INFRASTRUCTURE_NODES = new Set(['database']);

interface ServiceTopologyPanelProps {
  services: ServiceStatus[];
  serviceStates: Record<string, ServiceState>;
  selectedService: string | null;
  onSelectService: (name: string | null) => void;
  onStartService: (name: string) => void;
  onStopService: (name: string) => void;
  healthDependencies?: Record<string, { status: string; latencyMs: number }>;
  className?: string;
}

// Semantic icons for each service
const SERVICE_ICONS: Record<string, React.ElementType> = {
  database: Database,
  mlx: Brain,
  backend: Server,
  tts: Activity,
  frontend: Box,
  langdetect: Languages,
};

// Human-readable labels
const SERVICE_LABELS: Record<string, string> = {
  database: 'SQLite DB',
  mlx: 'Neural Engine',
  backend: 'Aether Core',
  tts: 'Speech Synth',
  frontend: 'Frontend PWA',
  langdetect: 'Lang Detect',
};

// Service colors
const SERVICE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  database: { bg: 'bg-cyan-500', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  mlx: { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/30' },
  backend: { bg: 'bg-sky-500', text: 'text-sky-400', border: 'border-sky-500/30' },
  tts: { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  frontend: { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/30' },
  langdetect: { bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500/30' },
};

// Display order for services
const SERVICE_ORDER = ['backend', 'frontend', 'mlx', 'tts', 'langdetect', 'database'];

export function ServiceTopologyPanel({
  services,
  serviceStates,
  selectedService,
  onSelectService,
  onStartService,
  onStopService,
  healthDependencies,
  className,
}: ServiceTopologyPanelProps) {
  // Check if a service is running
  const getServiceStatus = (name: string) => {
    if (INFRASTRUCTURE_NODES.has(name)) {
      const depStatus = healthDependencies?.[name]?.status;
      return depStatus === 'healthy' || depStatus === 'degraded';
    }
    const service = services.find((s) => s.name === name);
    return service?.running ?? false;
  };

  const getStateInfo = (name: string) => {
    if (INFRASTRUCTURE_NODES.has(name)) {
      const isRunning = getServiceStatus(name);
      return { state: isRunning ? 'running' : 'stopped', isLoading: false };
    }
    const state = serviceStates[name];
    const isRunning = getServiceStatus(name);
    return {
      state: state ?? (isRunning ? 'running' : 'stopped'),
      isLoading: state === 'starting' || state === 'stopping',
    };
  };

  // Get all displayable nodes in order
  const allNodes = SERVICE_ORDER.map((name) => {
    const service = services.find((s) => s.name === name);
    if (service) return service;
    if (INFRASTRUCTURE_NODES.has(name)) {
      return { name, running: getServiceStatus(name), pid: null };
    }
    return null;
  }).filter(Boolean) as ServiceStatus[];

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Panel Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-700/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <Network size={14} className="text-sky-400" />
          <span className="text-xs font-medium tracking-wider text-white uppercase">Services</span>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Live
        </span>
      </div>

      {/* Service List */}
      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {allNodes.map((service) => {
          const { state, isLoading } = getStateInfo(service.name);
          const isRunning = getServiceStatus(service.name);
          const isSelected = selectedService === service.name;
          const colors = SERVICE_COLORS[service.name] ?? SERVICE_COLORS.backend;
          const Icon = SERVICE_ICONS[service.name] ?? Server;
          const label = SERVICE_LABELS[service.name] ?? service.name;
          const isInfraNode = INFRASTRUCTURE_NODES.has(service.name);
          const infraLatency = isInfraNode ? healthDependencies?.[service.name]?.latencyMs : null;

          return (
            <motion.div
              key={service.name}
              onClick={() => onSelectService(isSelected ? null : service.name)}
              className={cn(
                'flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-all',
                'hover:bg-slate-800/50',
                isSelected && 'bg-slate-800/70 ring-1 ring-slate-600'
              )}
              whileTap={{ scale: 0.98 }}
            >
              {/* Status Dot */}
              <div
                className={cn(
                  'h-2 w-2 flex-shrink-0 rounded-full',
                  isRunning ? 'bg-emerald-500' : 'bg-slate-600'
                )}
              />

              {/* Icon */}
              {isLoading ? (
                <Loader2 size={14} className="flex-shrink-0 animate-spin text-slate-400" />
              ) : (
                <Icon
                  size={14}
                  className={cn('flex-shrink-0', isRunning ? colors.text : 'text-slate-500')}
                />
              )}

              {/* Label */}
              <span
                className={cn(
                  'flex-1 truncate text-left text-xs font-medium',
                  isRunning ? 'text-slate-200' : 'text-slate-500'
                )}
              >
                {label}
              </span>

              {/* Latency for infra nodes */}
              {isInfraNode && infraLatency !== null && (
                <span className="flex-shrink-0 font-mono text-[9px] text-slate-500">
                  {infraLatency}ms
                </span>
              )}

              {/* Action Button - for real services only */}
              {!isInfraNode && (
                <div className="flex-shrink-0">
                  {isRunning ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStopService(service.name);
                      }}
                      disabled={isLoading}
                      className="h-5 w-5 p-0 text-red-400 hover:bg-red-950/50 hover:text-red-300"
                    >
                      <Square size={10} />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartService(service.name);
                      }}
                      disabled={isLoading}
                      className="h-5 w-5 p-0 text-emerald-400 hover:bg-emerald-950/50 hover:text-emerald-300"
                    >
                      <Play size={10} />
                    </Button>
                  )}
                </div>
              )}

              {/* Open button for services with web UI */}
              {!isInfraNode &&
                isRunning &&
                HAS_WEB_UI.has(service.name) &&
                SERVICE_URLS[service.name] && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(SERVICE_URLS[service.name], '_blank');
                    }}
                    className="h-5 w-5 flex-shrink-0 p-0 text-sky-400 hover:bg-sky-950/50 hover:text-sky-300"
                  >
                    <ExternalLink size={10} />
                  </Button>
                )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
