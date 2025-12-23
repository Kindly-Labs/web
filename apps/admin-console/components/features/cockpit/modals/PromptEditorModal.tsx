'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface PromptEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PromptEditorModal({ isOpen, onClose }: PromptEditorModalProps) {
  const [prompt, setPrompt] = useState('');
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch prompt when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPrompt();
    }
  }, [isOpen]);

  const fetchPrompt = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/cockpit/prompt');
      if (!response.ok) throw new Error('Failed to fetch prompt');
      const data = await response.json();
      setPrompt(data.content || '');
      setOriginalPrompt(data.content || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prompt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/cockpit/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: prompt }),
      });
      if (!response.ok) throw new Error('Failed to save prompt');
      setOriginalPrompt(prompt);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save prompt');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setPrompt(originalPrompt);
  };

  const hasChanges = prompt !== originalPrompt;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="System Prompt" size="lg">
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            {/* Textarea */}
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="h-64 w-full resize-none rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-2 font-mono text-sm text-white focus:ring-2 focus:ring-sky-500/50 focus:outline-none"
              placeholder="Enter system prompt..."
            />

            {/* Character count */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{prompt.length} characters</span>
              {hasChanges && <span className="text-amber-400">Unsaved changes</span>}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-700/50 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={!hasChanges || isSaving}
                className="border-slate-700 text-xs text-slate-400"
              >
                <RotateCcw size={12} className="mr-1.5" />
                Reset
              </Button>
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
                Save
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
