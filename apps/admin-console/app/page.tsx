'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CockpitHeader,
  CockpitFooter,
  SystemHealthPanel,
  AIPerformancePanel,
  UserActivityPanel,
  ServiceTopologyPanel,
  LogPanel,
  ViewportWarning,
  SiteLauncher,
  type LogPanelRef,
} from '@/components/features/cockpit';
import { PromptEditorModal } from '@/components/features/cockpit/modals/PromptEditorModal';
import { AccessCodesModal } from '@/components/features/cockpit/modals/AccessCodesModal';
import { SettingsModal } from '@/components/features/cockpit/modals/SettingsModal';
import { useCockpitMetrics } from '@/lib/hooks/useCockpitMetrics';
import { usePipelineStageHealth } from '@/lib/hooks/usePipelineStageHealth';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import type { ServiceStatus, ServiceState } from '@/lib/types';

type ServiceLocalState = {
  state: ServiceState;
  error?: string;
  showForceKill?: boolean;
};

export default function CockpitPage() {
  // Service management state (from original dashboard)
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [localStates, setLocalStates] = useState<Record<string, ServiceLocalState>>({});

  // Modal states
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isCodesModalOpen, setIsCodesModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Quick action states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Ref for log panel (keyboard shortcuts)
  const logPanelRef = useRef<LogPanelRef>(null);
  const prevRunningRef = useRef<Record<string, boolean>>({});
  const stopTimersRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Cockpit metrics
  const { metrics, isLoading, error, lastUpdated, refetch } = useCockpitMetrics();

  // Pipeline stage health (live probes)
  const {
    data: stageHealth,
    isRefreshing: isRefreshingHealth,
    refresh: refreshStageHealth,
  } = usePipelineStageHealth();

  // Fetch service status
  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch('/api/services');
      const data: ServiceStatus[] = await res.json();
      setServices(data);

      // Sync local state with actual running state
      setLocalStates((prev) => {
        const next = { ...prev };
        for (const s of data) {
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
      // Ignore errors
    }
  }, []);

  useEffect(() => {
    fetchServices();
    const interval = setInterval(fetchServices, 2000);
    return () => clearInterval(interval);
  }, [fetchServices]);

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
        isRefreshing={isRefreshing}
        isExporting={isExporting}
      />

      {/* Main Grid - fills remaining space */}
      <main className="grid min-h-0 flex-1 grid-cols-12 gap-3 p-3">
        {/* Top Row - 40vh */}
        <div className="col-span-3 row-span-1 min-h-0 overflow-hidden rounded-lg border border-slate-700/50 bg-slate-800/30">
          <ServiceTopologyPanel
            services={services}
            serviceStates={serviceStates}
            selectedService={selectedService}
            onSelectService={setSelectedService}
            onStartService={handleStart}
            onStopService={handleStop}
            healthDependencies={metrics?.health?.dependencies}
          />
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
    </div>
  );
}
