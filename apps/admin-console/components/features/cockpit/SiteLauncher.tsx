'use client';

import { ExternalLink, Globe, Briefcase, Terminal } from 'lucide-react';

interface SiteLauncherProps {
  className?: string;
}

const sites = [
  {
    name: 'Aether PWA',
    description: 'Consumer voice app',
    url: 'http://localhost:3004',
    icon: Globe,
    color: 'cyan',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    external: true,
  },
  {
    name: 'Workbench',
    description: 'Labeling platform',
    url: 'http://localhost:3003',
    icon: Terminal,
    color: 'amber',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    external: true,
  },
  {
    name: 'AuralNet',
    description: 'Enterprise portal & B2B site',
    url: 'http://localhost:4321',
    icon: Briefcase,
    color: 'purple',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    external: true,
  },
];

export function SiteLauncher({ className }: SiteLauncherProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 border-b border-slate-700/50 px-3 py-2">
        <Globe size={14} className="text-slate-400" />
        <span className="text-xs font-medium text-slate-300">Multi-App Sites</span>
      </div>

      <div className="grid grid-cols-2 gap-2 p-2">
        {sites.map((site) => {
          const Icon = site.icon;
          const linkProps = site.external
            ? { href: site.url, target: '_blank', rel: 'noopener noreferrer' }
            : { href: site.url };

          return (
            <a
              key={site.name}
              {...linkProps}
              className={`flex items-center gap-2 rounded-lg border p-2 transition-all ${site.bgColor} ${site.borderColor} hover:scale-[1.02] hover:shadow-lg hover:shadow-${site.color}-500/10 `}
            >
              <div className={`rounded-md p-1.5 bg-${site.color}-500/20`}>
                <Icon size={14} className={`text-${site.color}-400`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className={`text-xs font-medium text-${site.color}-300`}>{site.name}</span>
                  {site.external && <ExternalLink size={10} className="text-slate-500" />}
                </div>
                <span className="block truncate text-[9px] text-slate-500">{site.description}</span>
              </div>
            </a>
          );
        })}
      </div>

      {/* V1 API Status */}
      <div className="border-t border-slate-700/50 px-3 py-2">
        <div className="flex items-center gap-2 text-[9px] text-slate-500">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
          <span>V1 API: /v1/common/auth/:site/login</span>
        </div>
      </div>
    </div>
  );
}
