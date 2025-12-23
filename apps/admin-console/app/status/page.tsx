'use client';

import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { useStatusCheck, groupChecksBySite } from '@/lib/hooks/useStatusCheck';
import { useStatusHistory } from '@/lib/hooks/useStatusHistory';
import { useIncidents } from '@/lib/hooks/useIncidents';
import { SiteStatusCard } from '@/components/features/status/SiteStatusCard';
import { UptimeBadge } from '@/components/features/status/UptimeBadge';
import { IncidentBanner } from '@/components/features/status/IncidentBanner';
import { cn } from '@/lib/utils';

const SITE_CONFIG = {
  backend: {
    title: 'Backend API',
    subtitle: 'api.cogito.cv',
    url: 'https://api.cogito.cv',
    serviceKey: 'owly-api',
  },
  auralnet: {
    title: 'AuralNet',
    subtitle: 'www.kindly-labs.org',
    url: 'https://www.kindly-labs.org',
    serviceKey: 'auralnet',
  },
  aether: {
    title: 'Aether PWA',
    subtitle: 'aether.kindly-labs.org',
    url: 'https://aether.kindly-labs.org',
    serviceKey: 'aether',
  },
  console: {
    title: 'Admin Console',
    subtitle: 'app.kindly-labs.org',
    url: 'https://app.kindly-labs.org',
    serviceKey: 'console',
  },
};

// Service name mapping for backend services
const SERVICE_NAMES = ['gemini', 'kokoro', 'owly-api'];

export default function StatusPage() {
  const { data, isLoading, error, refresh, lastUpdated } = useStatusCheck({
    autoRefresh: true,
    refreshInterval: 30000,
  });

  const { uptimes, getServiceHistory } = useStatusHistory({
    autoRefresh: true,
    refreshInterval: 60000,
    hours: 24,
  });

  const { ongoing, recent, hasOngoing } = useIncidents({
    autoRefresh: true,
    refreshInterval: 30000,
  });

  const groupedChecks = data ? groupChecksBySite(data.checks) : {};

  const overallConfig = {
    healthy: {
      icon: <CheckCircle size={24} />,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      label: 'All Systems Operational',
    },
    degraded: {
      icon: <AlertTriangle size={24} />,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      label: 'Some Systems Degraded',
    },
    unhealthy: {
      icon: <XCircle size={24} />,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      label: 'System Issues Detected',
    },
  };

  const overall = hasOngoing ? 'unhealthy' : (data?.overall || 'healthy');
  const config = overallConfig[overall];

  // Calculate overall uptime (average of all tracked services)
  const uptimeValues = Object.values(uptimes).filter((v) => v > 0);
  const overallUptime =
    uptimeValues.length > 0
      ? uptimeValues.reduce((a, b) => a + b, 0) / uptimeValues.length
      : 100;

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">System Status</h1>
            <p className="text-sm text-slate-400">
              End-to-end workflow verification for Kindly Labs services
            </p>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock size={14} />
                <span>Updated {lastUpdated.toLocaleTimeString()}</span>
              </div>
            )}
            <button
              onClick={refresh}
              disabled={isLoading}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                'bg-slate-800 text-slate-300 hover:bg-slate-700',
                isLoading && 'cursor-not-allowed opacity-50'
              )}
            >
              <RefreshCw size={16} className={cn(isLoading && 'animate-spin')} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm text-red-400">Failed to fetch status: {error}</p>
          </div>
        )}

        {/* Overall Status Banner with Uptime */}
        {data && (
          <div
            className={cn(
              'mb-6 flex items-center justify-between gap-4 rounded-lg border p-4',
              config.borderColor,
              config.bgColor
            )}
          >
            <div className="flex items-center gap-4">
              <div className={config.color}>{config.icon}</div>
              <div>
                <p className={cn('font-semibold', config.color)}>{config.label}</p>
                <p className="text-sm text-slate-400">
                  {data.checks.filter((c) => c.status === 'pass').length} of {data.checks.length}{' '}
                  checks passing
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">24h Uptime</span>
              <UptimeBadge uptime={overallUptime} size="lg" />
            </div>
          </div>
        )}

        {/* Incident Banner */}
        <div className="mb-6">
          <IncidentBanner ongoing={ongoing} recent={recent} showRecent={true} />
        </div>

        {/* Service Uptime Overview */}
        {Object.keys(uptimes).length > 0 && (
          <div className="mb-6 rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
            <h2 className="mb-3 text-sm font-medium text-slate-300">Service Uptime (24h)</h2>
            <div className="flex flex-wrap gap-4">
              {SERVICE_NAMES.map((name) => {
                const uptime = uptimes[name];
                if (uptime === undefined) return null;
                return (
                  <div key={name} className="flex items-center gap-2">
                    <span className="text-sm capitalize text-slate-400">{name}:</span>
                    <UptimeBadge uptime={uptime} size="sm" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !data && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw size={32} className="animate-spin text-slate-500" />
          </div>
        )}

        {/* Site Cards Grid */}
        {data && (
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(SITE_CONFIG).map(([siteKey, siteInfo]) => {
              const checks = groupedChecks[siteKey] || [];
              if (checks.length === 0) return null;

              const siteUptime = uptimes[siteInfo.serviceKey];

              return (
                <SiteStatusCard
                  key={siteKey}
                  title={siteInfo.title}
                  subtitle={siteInfo.subtitle}
                  url={siteInfo.url}
                  checks={checks}
                  uptime={siteUptime}
                  serviceName={siteInfo.serviceKey}
                  getServiceHistory={getServiceHistory}
                />
              );
            })}
          </div>
        )}

        {/* Auto-refresh indicator */}
        <div className="mt-8 text-center text-xs text-slate-600">
          Auto-refreshing every 30 seconds
        </div>
      </div>
    </div>
  );
}
