'use client';

import { AlertTriangle, Clock, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ServiceIncident } from '@/lib/hooks/useIncidents';
import { getIncidentDuration, formatIncidentTime } from '@/lib/hooks/useIncidents';

interface IncidentBannerProps {
  ongoing: ServiceIncident[];
  recent?: ServiceIncident[];
  showRecent?: boolean;
  className?: string;
}

export function IncidentBanner({
  ongoing,
  recent = [],
  showRecent = true,
  className,
}: IncidentBannerProps) {
  const [expanded, setExpanded] = useState(false);
  const hasOngoing = ongoing.length > 0;

  if (!hasOngoing && recent.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4',
          className
        )}
      >
        <CheckCircle size={20} className="text-emerald-400" />
        <div>
          <p className="font-medium text-emerald-400">No Current Incidents</p>
          <p className="text-sm text-slate-400">All systems operating normally</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Ongoing Incidents */}
      {ongoing.map((incident) => (
        <div
          key={incident.id}
          className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4"
        >
          <AlertTriangle size={20} className="mt-0.5 flex-shrink-0 text-red-400" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-medium text-red-400">
                {incident.service_name} - Incident Ongoing
              </p>
              <div className="flex items-center gap-1 text-xs text-red-400/70">
                <Clock size={12} />
                <span>{getIncidentDuration(incident)}</span>
              </div>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Status changed from {incident.previous_status || 'unknown'} to{' '}
              {incident.new_status || 'unknown'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Started: {formatIncidentTime(incident.started_at)}
            </p>
          </div>
        </div>
      ))}

      {/* Recent Incidents (Resolved) */}
      {showRecent && recent.length > 0 && (
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/30">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-between p-3 text-left hover:bg-slate-700/20"
          >
            <span className="text-sm font-medium text-slate-300">
              Recent Incidents ({recent.length})
            </span>
            {expanded ? (
              <ChevronUp size={16} className="text-slate-400" />
            ) : (
              <ChevronDown size={16} className="text-slate-400" />
            )}
          </button>

          {expanded && (
            <div className="divide-y divide-slate-700/50 border-t border-slate-700/50">
              {recent.slice(0, 5).map((incident) => (
                <div key={incident.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">{incident.service_name}</span>
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-xs',
                        incident.status === 'resolved'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400'
                      )}
                    >
                      {incident.status}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                    <span>Duration: {getIncidentDuration(incident)}</span>
                    <span>Started: {formatIncidentTime(incident.started_at)}</span>
                    {incident.resolved_at && (
                      <span>Resolved: {formatIncidentTime(incident.resolved_at)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface IncidentCountBadgeProps {
  count: number;
  className?: string;
}

export function IncidentCountBadge({ count, className }: IncidentCountBadgeProps) {
  if (count === 0) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white',
        className
      )}
    >
      {count}
    </span>
  );
}
