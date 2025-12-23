'use client';

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcuts {
  onStartAll?: () => void;
  onStopAll?: () => void;
  onPreset?: (presetIndex: number) => void;
  onFocusSearch?: () => void;
  onTogglePanel?: (panel: string) => void;
  // Quick actions
  onRefresh?: () => void;
  onExport?: () => void;
  onOpenPrompt?: () => void;
  onOpenCodes?: () => void;
  onOpenSettings?: () => void;
}

/**
 * Keyboard shortcuts for the cockpit
 *
 * Shortcuts:
 * - S: Start all services
 * - X: Stop all services
 * - R: Refresh metrics
 * - E: Export dataset
 * - P: Open prompt editor
 * - C: Open access codes
 * - ,: Open settings
 * - 1-5: Switch log presets (Smart, Errors, HTTP, Business, Debug)
 * - Ctrl/Cmd+K: Focus log search
 * - Escape: Blur focused element
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Only handle Escape in inputs
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      // Ctrl/Cmd + K: Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        shortcuts.onFocusSearch?.();
        return;
      }

      // Single key shortcuts (no modifiers)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case 's':
          e.preventDefault();
          shortcuts.onStartAll?.();
          break;
        case 'x':
          e.preventDefault();
          shortcuts.onStopAll?.();
          break;
        case 'r':
          e.preventDefault();
          shortcuts.onRefresh?.();
          break;
        case 'e':
          e.preventDefault();
          shortcuts.onExport?.();
          break;
        case 'p':
          e.preventDefault();
          shortcuts.onOpenPrompt?.();
          break;
        case 'c':
          e.preventDefault();
          shortcuts.onOpenCodes?.();
          break;
        case ',':
          e.preventDefault();
          shortcuts.onOpenSettings?.();
          break;
        case '1':
          e.preventDefault();
          shortcuts.onPreset?.(0); // Smart
          break;
        case '2':
          e.preventDefault();
          shortcuts.onPreset?.(1); // Errors Only
          break;
        case '3':
          e.preventDefault();
          shortcuts.onPreset?.(2); // HTTP Traffic
          break;
        case '4':
          e.preventDefault();
          shortcuts.onPreset?.(3); // Business Events
          break;
        case '5':
          e.preventDefault();
          shortcuts.onPreset?.(4); // Debug
          break;
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Shortcut hints for display in UI
 */
export const SHORTCUT_HINTS = [
  { key: 'S', action: 'Start all' },
  { key: 'X', action: 'Stop all' },
  { key: 'R', action: 'Refresh' },
  { key: 'E', action: 'Export' },
  { key: 'P', action: 'Prompt' },
  { key: 'C', action: 'Codes' },
  { key: '1-5', action: 'Log presets' },
  { key: '⌘K', action: 'Search logs' },
] as const;
