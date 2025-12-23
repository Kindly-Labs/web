'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  shortcut?: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'danger' | 'success';
  className?: string;
}

export function QuickActionButton({
  icon: Icon,
  label,
  onClick,
  shortcut,
  loading,
  disabled,
  variant = 'default',
  className,
}: QuickActionButtonProps) {
  const variantStyles = {
    default: 'text-slate-400 hover:text-white hover:bg-slate-800',
    danger: 'text-red-400 hover:text-red-300 hover:bg-red-950/50',
    success: 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/50',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'flex items-center gap-1.5 rounded px-2 py-1.5 text-xs transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variantStyles[variant],
        className
      )}
      title={shortcut ? `${label} (${shortcut})` : label}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
      <span className="hidden sm:inline">{label}</span>
      {shortcut && (
        <kbd className="ml-1 hidden rounded bg-slate-700/50 px-1 py-0.5 text-[9px] text-slate-500 lg:inline">
          {shortcut}
        </kbd>
      )}
    </motion.button>
  );
}
