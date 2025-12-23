'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CockpitHeader,
  CockpitFooter,
  SystemHealthPanel,
  AIPerformancePanel,
  UserActivityPanel,
  ServiceTopologyPanel,
  ProductionTopologyPanel,
  LogPanel,
  ViewportWarning,
  SiteLauncher,
  type LogPanelRef,
} from '@/components/features/cockpit';
import { PromptEditorModal } from '@/components/features/cockpit/modals/PromptEditorModal';
import { AccessCodesModal } from '@/components/features/cockpit/modals/AccessCodesModal';
import { SettingsModal } from '@/components/features/cockpit/modals/SettingsModal';
import { DeployModal } from '@/components/features/cockpit/modals/DeployModal';
import { SessionsModal } from '@/components/features/cockpit/modals/SessionsModal';
import { AuditLogModal } from '@/components/features/cockpit/modals/AuditLogModal';
import { DebugPanel } from '@/components/features/cockpit/debug/DebugPanel';
import { useCockpitMetrics } from '@/lib/hooks/useCockpitMetrics';
import { useProductionMetrics } from '@/lib/hooks/useProductionMetrics';
import { usePipelineStageHealth } from '@/lib/hooks/usePipelineStageHealth';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import { useDebugState } from '@/lib/hooks/useDebugState';
import { useEnvironment } from '@/lib/context/EnvironmentContext';
import type { ServiceStatus, ServiceState } from '@/lib/types';

type ServiceLocalState = {
  state: ServiceState;
  error?: string;
  showForceKill?: boolean;
};

export default function CockpitPage() {
  // Environment context
  const { environment, isAuthenticated } = useEnvironment();
  const isProduction = environment === 'production';

  // Service management state (from original dashboard)
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [localStates, setLocalStates] = useState<Record<string, ServiceLocalState>>({});

  // Modal states
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isCodesModalOpen, setIsCodesModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isDebugPanelOpen, setIsDebugPanelOpen] = useState(false);

  // Debug state for tracking raw API responses
  const { debugState, captureServices, captureMetrics } = useDebugState();

  // Quick action states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Ref for log panel (keyboard shortcuts)
  const logPanelRef = useRef<LogPanelRef>(null);
  const prevRunningRef = useRef<Record<string, boolean>>({});
  const stopTimersRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Cockpit metrics (local)
  const {
    metrics: localMetrics,
    isLoading: isLoadingLocal,
    error: localError,
    lastUpdated: localLastUpdated,
    refetch: refetchLocal,
  } = useCockpitMetrics();

  // Production metrics
  const {
    metrics: prodMetrics,
    isLoading: isLoadingProd,
    error: prodError,
    lastUpdated: prodLastUpdated,
    refetch: refetchProd,
  } = useProductionMetrics();

  // Use appropriate metrics based on environment
  const metrics = isProduction ? prodMetrics : localMetrics;
  const isLoading = isProduction ? isLoadingProd : isLoadingLocal;
  const error = isProduction ? prodError : localError;
  const lastUpdated = isProduction ? prodLastUpdated : localLastUpdated;
  const refetch = isProduction ? refetchProd : refetchLocal;

  // Pipeline stage health (live probes) - only for local
  const {
    data: stageHealth,
    isRefreshing: isRefreshingHealth,
    refresh: refreshStageHealth,
  } = usePipelineStageHealth();

  // Fetch service status
  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch('/api/services');
      if (!res.ok) {
        // API returned error status - don't update services
        return;
      }
      const data = await res.json();

      // Validate response is an array (API may return error object)
      if (!Array.isArray(data)) {
        return;
      }

      setServices(data as ServiceStatus[]);
      captureServices(data); // Capture for debug panel

      // Sync local state with actual running state
      setLocalStates((prev) => {
        const next = { ...prev };
        for (const s of data as ServiceStatus[]) {
          const wasRunning = prevRunningRef.current[s.name];
          const isRunning = s.running;

          if (isRunning && prev[s.name]?.state === 'starting') {
            next[s.name] = { state: 'running' };
          } else if (!isRunning && prev[s.name]?.state === 'stopping') {
            if (stopTimersRef.current[s.name]) {
              clearTimeout(stopTimersRef.current[s.name]);
              delete stopTimersRef.current[s.name];
            }
            next[s.name] = { state: 'stopped' };
          } else if (!isRunning && wasRunning && prev[s.name]?.state === 'running') {
            next[s.name] = { state: 'stopped', error: 'Process exited unexpectedly' };
          } else if (!prev[s.name]) {
            next[s.name] = { state: isRunning ? 'running' : 'stopped' };
          }

          prevRunningRef.current[s.name] = isRunning;
        }
        return next;
      });
    } catch {
      // Ignore fetch errors (network issues, etc.)
    }
  }, []);

  useEffect(() => {
    fetchServices();
    const interval = setInterval(fetchServices, 2000);
    return () => clearInterval(interval);
  }, [fetchServices]);

  // Capture metrics for debug panel when they update
  useEffect(() => {
    if (metrics) {
      captureMetrics(metrics);
    }
  }, [metrics, captureMetrics]);

  // Service control handlers
  const handleStart = async (service: string) => {
    setLocalStates((prev) => ({ ...prev, [service]: { state: 'starting' } }));

    try {
      const res = await fetch('/api/services/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service }),
      });
      if (!res.ok) {
        const err = await res.text();
        setLocalStates((prev) => ({ ...prev, [service]: { state: 'error', error: err } }));
      }
    } catch {
      setLocalStates((prev) => ({
        ...prev,
        [service]: { state: 'error', error: 'Failed to start service' },
      }));
    }
    fetchServices();
  };

  const handleStop = async (service: string) => {
    if (stopTimersRef.current[service]) {
      clearTimeout(stopTimersRef.current[service]);
    }

    setLocalStates((prev) => ({ ...prev, [service]: { state: 'stopping', showForceKill: false } }));

    stopTimersRef.current[service] = setTimeout(() => {
      setLocalStates((prev) => ({ ...prev, [service]: { ...prev[service], showForceKill: true } }));
    }, 5000);

    try {
      await fetch('/api/services/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service }),
      });
      // Clear the timer after successful stop
      if (stopTimersRef.current[service]) {
        clearTimeout(stopTimersRef.current[service]);
        delete stopTimersRef.current[service];
      }
    } catch {
      if (stopTimersRef.current[service]) {
        clearTimeout(stopTimersRef.current[service]);
        delete stopTimersRef.current[service];
      }
      setLocalStates((prev) => ({
        ...prev,
        [service]: { state: 'error', error: 'Failed to stop service' },
      }));
    }
    await fetchServices();
  };

  const handleStartAll = async () => {
    // Start backend first
    const backend = services.find((s) => s.name === 'backend');
    if (backend && !backend.running) {
      await handleStart('backend');
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Start remaining services sequentially with delays to avoid race conditions
    for (const s of services) {
      if (!s.running && s.name !== 'backend') {
        await handleStart(s.name);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  };

  const handleStopAll = async () => {
    // Stop non-backend services first
    for (const s of services) {
      if (s.running && s.name !== 'backend') {
        await handleStop(s.name);
      }
    }
    // Stop backend last (other services depend on it)
    const backend = services.find((s) => s.name === 'backend');
    if (backend?.running) {
      await handleStop('backend');
    }
  };

  const getServiceState = (serviceName: string): ServiceState => {
    const local = localStates[serviceName];
    if (local) return local.state;
    const service = services.find((s) => s.name === serviceName);
    return service?.running ? 'running' : 'stopped';
  };

  // Quick action handlers
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetch(), fetchServices()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, fetchServices]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/cockpit/export');
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dataset-${new Date().toISOString().split('T')[0]}.jsonl`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onStartAll: handleStartAll,
    onStopAll: handleStopAll,
    onPreset: (index) => logPanelRef.current?.applyPresetByIndex(index),
    onFocusSearch: () => logPanelRef.current?.focusSearch(),
    onRefresh: handleRefresh,
    onExport: handleExport,
    onOpenPrompt: () => setIsPromptModalOpen(true),
    onOpenCodes: () => setIsCodesModalOpen(true),
    onOpenSettings: () => setIsSettingsModalOpen(true),
    onOpenAudit: isProduction ? () => setIsAuditModalOpen(true) : undefined,
    onToggleDebug: () => setIsDebugPanelOpen((prev) => !prev),
  });

  // Derived state
  const runningCount = services.filter((s) => s.running).length;
  const totalCount = services.length;
  const hasErrors = Object.values(localStates).some((s) => s.state === 'error');
  const isStartingAny = Object.values(localStates).some((s) => s.state === 'starting');
  const serviceNames = services.map((s) => s.name);

  const healthStatus = hasErrors
    ? 'degraded'
    : runningCount === totalCount
      ? 'healthy'
      : runningCount > 0
        ? 'partial'
        : 'stopped';

  const serviceStates: Record<string, ServiceState> = {
    ...Object.fromEntries(services.map((s) => [s.name, getServiceState(s.name)])),
    control: 'running',
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-900">
      {/* Header - 48px */}
      <CockpitHeader
        runningCount={runningCount}
        totalCount={totalCount}
        healthStatus={healthStatus}
        isStartingAny={isStartingAny}
        onStartAll={handleStartAll}
        onStopAll={handleStopAll}
        lastUpdated={lastUpdated}
        // Quick actions
        onRefresh={handleRefresh}
        onExport={handleExport}
        onOpenPrompt={() => setIsPromptModalOpen(true)}
        onOpenCodes={() => setIsCodesModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenAudit={isProduction ? () => setIsAuditModalOpen(true) : undefined}
        isRefreshing={isRefreshing}
        isExporting={isExporting}
      />

      {/* Main Grid - fills remaining space */}
      <main className="grid min-h-0 flex-1 grid-cols-12 gap-3 p-3">
        {/* Top Row - 40vh */}
        <div className="col-span-3 row-span-1 min-h-0 overflow-hidden rounded-lg border border-slate-700/50 bg-slate-800/30">
          {isProduction ? (
            <ProductionTopologyPanel onDeploy={() => setIsDeployModalOpen(true)} />
          ) : (
            <ServiceTopologyPanel
              services={services}
              serviceStates={serviceStates}
              selectedService={selectedService}
              onSelectService={setSelectedService}
              onStartService={handleStart}
              onStopService={handleStop}
              healthDependencies={metrics?.health?.dependencies}
            />
          )}
        </div>

        <div className="col-span-4 row-span-1 min-h-0 overflow-hidden rounded-lg border border-slate-700/50 bg-slate-800/30">
          <SystemHealthPanel system={metrics?.system ?? null} health={metrics?.health ?? null} />
        </div>

        <div className="col-span-5 row-span-1 min-h-0 overflow-hidden rounded-lg border border-slate-700/50 bg-slate-800/30">
          <AIPerformancePanel
            ai={metrics?.aiPerformance ?? null}
            pipeline={metrics?.pipeline ?? null}
            stageHealth={stageHealth}
            isRefreshingHealth={isRefreshingHealth}
            onRefreshHealth={refreshStageHealth}
          />
        </div>

        {/* Bottom Row - remaining space */}
        <div className="col-span-3 row-span-1 min-h-0 overflow-hidden rounded-lg border border-slate-700/50 bg-slate-800/30">
          <UserActivityPanel
            sessions={metrics?.sessions ?? null}
            reviewQueue={metrics?.reviewQueue ?? null}
            users={metrics?.users ?? null}
          />
        </div>

        <div className="col-span-9 row-span-1 min-h-0 overflow-hidden rounded-lg border border-slate-700/50 bg-slate-800/30">
          <LogPanel
            ref={logPanelRef}
            services={[...serviceNames, 'control']}
            serviceStates={serviceStates}
          />
        </div>
      </main>

      {/* Footer - 32px */}
      <CockpitFooter lastUpdated={lastUpdated} error={error} />

      {/* Viewport Warning */}
      <ViewportWarning />

      {/* Modals */}
      <PromptEditorModal isOpen={isPromptModalOpen} onClose={() => setIsPromptModalOpen(false)} />
      <AccessCodesModal isOpen={isCodesModalOpen} onClose={() => setIsCodesModalOpen(false)} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
      <DeployModal isOpen={isDeployModalOpen} onClose={() => setIsDeployModalOpen(false)} />
      <SessionsModal isOpen={isSessionsModalOpen} onClose={() => setIsSessionsModalOpen(false)} />
      <AuditLogModal isOpen={isAuditModalOpen} onClose={() => setIsAuditModalOpen(false)} />

      {/* Debug Panel */}
      <DebugPanel
        isOpen={isDebugPanelOpen}
        onClose={() => setIsDebugPanelOpen(false)}
        rawServices={debugState.rawServices}
        rawMetrics={debugState.rawMetrics}
        serviceStates={serviceStates}
        lastFetchTime={debugState.lastFetchTime}
        onRefreshServices={fetchServices}
        onRefreshMetrics={refetch}
      />
    </div>
  );
}
