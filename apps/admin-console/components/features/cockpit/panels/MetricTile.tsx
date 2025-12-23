'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface MetricTileProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MetricTile({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  size = 'md',
  className,
}: MetricTileProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'flex flex-col gap-1 rounded-lg border border-slate-700/50 bg-slate-800/50 p-3',
        'cursor-default transition-shadow hover:shadow-lg hover:shadow-sky-500/5',
        className
      )}
    >
      <div className="flex items-center gap-1.5 text-slate-500">
        {Icon && <Icon size={12} />}
        <span className="text-[10px] tracking-wider uppercase">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            'font-mono font-semibold text-white',
            size === 'sm' && 'text-lg',
            size === 'md' && 'text-2xl',
            size === 'lg' && 'text-3xl'
          )}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {unit && <span className="text-xs text-slate-500">{unit}</span>}
        {trend && (
          <span
            className={cn(
              'ml-1 text-xs',
              trend === 'up' && 'text-emerald-400',
              trend === 'down' && 'text-red-400',
              trend === 'neutral' && 'text-slate-400'
            )}
          >
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </div>
    </motion.div>
  );
}
