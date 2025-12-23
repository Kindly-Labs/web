'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface SystemSettings {
  voiceQuotaLimit: number;
  voiceQuotaBoostedLimit: number;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<SystemSettings>({
    voiceQuotaLimit: 300,
    voiceQuotaBoostedLimit: 3600,
  });
  const [originalSettings, setOriginalSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/cockpit/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      const loadedSettings = {
        voiceQuotaLimit: data.voiceQuotaLimit ?? 300,
        voiceQuotaBoostedLimit: data.voiceQuotaBoostedLimit ?? 3600,
      };
      setSettings(loadedSettings);
      setOriginalSettings(loadedSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/cockpit/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error('Failed to save settings');
      setOriginalSettings(settings);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${Math.floor(seconds / 60)}m`;
  };

  const hasChanges =
    originalSettings &&
    (settings.voiceQuotaLimit !== originalSettings.voiceQuotaLimit ||
      settings.voiceQuotaBoostedLimit !== originalSettings.voiceQuotaBoostedLimit);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="System Settings" size="md">
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            {/* Voice Quota */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-slate-300">Voice Quota (Standard)</label>
                <span className="font-mono text-xs text-slate-500">
                  {formatDuration(settings.voiceQuotaLimit)}
                </span>
              </div>
              <input
                type="range"
                min={60}
                max={1800}
                step={60}
                value={settings.voiceQuotaLimit}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, voiceQuotaLimit: Number(e.target.value) }))
                }
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-700 accent-sky-500"
              />
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>1 min</span>
                <span>30 min</span>
              </div>
            </div>

            {/* Boosted Quota */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-slate-300">Voice Quota (Boosted)</label>
                <span className="font-mono text-xs text-slate-500">
                  {formatDuration(settings.voiceQuotaBoostedLimit)}
                </span>
              </div>
              <input
                type="range"
                min={300}
                max={7200}
                step={300}
                value={settings.voiceQuotaBoostedLimit}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, voiceQuotaBoostedLimit: Number(e.target.value) }))
                }
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-700 accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>5 min</span>
                <span>2 hours</span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-slate-700/50 pt-4">
              <span className="text-xs text-slate-500">
                {hasChanges ? 'Unsaved changes' : 'No changes'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="border-emerald-900/50 text-xs text-emerald-400 hover:bg-emerald-950/50"
              >
                {isSaving ? (
                  <Loader2 size={12} className="mr-1.5 animate-spin" />
                ) : (
                  <Save size={12} className="mr-1.5" />
                )}
                Save Settings
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
