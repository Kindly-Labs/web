'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useEnvironment } from '@/lib/context/EnvironmentContext';

interface PipelineStats {
  pending_labeling: number;
  pending_review: number;
  approved: number;
  total_clips: number;
}

interface Dataset {
  id: string;
  name: string;
  description: string;
  dialect_id: string;
  clip_count: number;
  total_duration_ms: number;
  price_cents: number;
  is_public: boolean;
  download_count: number;
  created_at: string;
}

interface TrainingRun {
  id: string;
  dataset_id: string;
  model_type: 'stt' | 'tts';
  status: 'pending' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  created_at: string;
}

export default function PipelinePage() {
  const { backendUrl, credentials } = useEnvironment();
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [trainingRuns, setTrainingRuns] = useState<TrainingRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!backendUrl) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch pipeline stats
      const statsRes = await fetch(`${backendUrl}/api/v1/pipeline/stats`, {
        headers: {
          'Authorization': `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`,
        },
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch datasets from marketplace (public, no auth needed)
      const datasetsRes = await fetch(`${backendUrl}/api/v1/marketplace`);
      if (datasetsRes.ok) {
        const datasetsData = await datasetsRes.json();
        setDatasets(Array.isArray(datasetsData) ? datasetsData : []);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pipeline data');
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl, credentials]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Data Pipeline</h1>
            <p className="text-sm text-slate-400">Audio processing, labeling, and dataset management</p>
          </div>
          <a
            href="/"
            className="rounded-lg bg-slate-700 px-4 py-2 text-sm hover:bg-slate-600"
          >
            Back to Cockpit
          </a>
        </div>
      </header>

      <main className="p-6">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="mb-6 grid grid-cols-4 gap-4">
          <StatCard
            title="Pending Labeling"
            value={stats?.pending_labeling ?? '-'}
            color="yellow"
          />
          <StatCard
            title="Pending Review"
            value={stats?.pending_review ?? '-'}
            color="blue"
          />
          <StatCard
            title="Approved Clips"
            value={stats?.approved ?? '-'}
            color="green"
          />
          <StatCard
            title="Total Clips"
            value={stats?.total_clips ?? '-'}
            color="slate"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Datasets Panel */}
          <div className="rounded-lg border border-slate-700 bg-slate-800/50">
            <div className="border-b border-slate-700 px-4 py-3">
              <h2 className="font-medium">Datasets Marketplace</h2>
            </div>
            <div className="p-4">
              {isLoading ? (
                <div className="text-center text-slate-400 py-8">Loading...</div>
              ) : datasets.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  No datasets available yet
                </div>
              ) : (
                <div className="space-y-3">
                  {datasets.map((dataset) => (
                    <div
                      key={dataset.id}
                      className="rounded-lg border border-slate-600 bg-slate-700/50 p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{dataset.name}</h3>
                          <p className="text-sm text-slate-400 mt-1">
                            {dataset.description || 'No description'}
                          </p>
                        </div>
                        <span className="rounded bg-green-500/20 px-2 py-1 text-xs text-green-400">
                          {dataset.is_public ? 'Public' : 'Private'}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-sm text-slate-400">
                        <span>{dataset.clip_count} clips</span>
                        <span>{formatDuration(dataset.total_duration_ms)}</span>
                        <span>{formatPrice(dataset.price_cents)}</span>
                        <span>{dataset.download_count} downloads</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Training Runs Panel */}
          <div className="rounded-lg border border-slate-700 bg-slate-800/50">
            <div className="border-b border-slate-700 px-4 py-3">
              <h2 className="font-medium">Training Runs</h2>
            </div>
            <div className="p-4">
              {trainingRuns.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  No training runs yet
                </div>
              ) : (
                <div className="space-y-3">
                  {trainingRuns.map((run) => (
                    <div
                      key={run.id}
                      className="rounded-lg border border-slate-600 bg-slate-700/50 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm">{run.id.slice(0, 8)}</span>
                        <StatusBadge status={run.status} />
                      </div>
                      <div className="mt-2">
                        <div className="h-2 rounded-full bg-slate-600">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${run.progress * 100}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          {(run.progress * 100).toFixed(0)}% complete
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pipeline Flow Diagram */}
        <div className="mt-6 rounded-lg border border-slate-700 bg-slate-800/50 p-6">
          <h2 className="mb-4 font-medium">Pipeline Flow</h2>
          <div className="flex items-center justify-center gap-4 text-sm">
            <FlowStep label="Capture" sublabel="Aether/Workbench" active />
            <Arrow />
            <FlowStep label="Process" sublabel="STT + QA" />
            <Arrow />
            <FlowStep label="Label" sublabel="Human Transcript" />
            <Arrow />
            <FlowStep label="Review" sublabel="Expert Approval" />
            <Arrow />
            <FlowStep label="Package" sublabel="Dataset Export" />
            <Arrow />
            <FlowStep label="Sell/Train" sublabel="Marketplace" />
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: number | string; color: string }) {
  const colorClasses: Record<string, string> = {
    yellow: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
    blue: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    green: 'border-green-500/30 bg-green-500/10 text-green-400',
    slate: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
  };

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
      <p className="text-sm opacity-80">{title}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-slate-500/20 text-slate-400',
    queued: 'bg-yellow-500/20 text-yellow-400',
    running: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-green-500/20 text-green-400',
    failed: 'bg-red-500/20 text-red-400',
    cancelled: 'bg-slate-500/20 text-slate-400',
  };

  return (
    <span className={`rounded px-2 py-1 text-xs ${colors[status] || colors.pending}`}>
      {status}
    </span>
  );
}

function FlowStep({ label, sublabel, active }: { label: string; sublabel: string; active?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 text-center ${
      active
        ? 'border-blue-500 bg-blue-500/20 text-blue-400'
        : 'border-slate-600 bg-slate-700/50'
    }`}>
      <p className="font-medium">{label}</p>
      <p className="text-xs opacity-60">{sublabel}</p>
    </div>
  );
}

function Arrow() {
  return (
    <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
