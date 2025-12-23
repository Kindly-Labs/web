'use client';

import { useState, useEffect } from 'react';
import { Loader2, Plus, Copy, Trash2, Check } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AccessCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccessCodesModal({ isOpen, onClose }: AccessCodesModalProps) {
  const [codes, setCodes] = useState<string[]>([]);
  const [newCode, setNewCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch codes when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCodes();
    }
  }, [isOpen]);

  const fetchCodes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/cockpit/access-codes');
      if (!response.ok) throw new Error('Failed to fetch codes');
      const data = await response.json();
      setCodes(data.codes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load codes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newCode.trim()) return;
    setIsAdding(true);
    setError(null);
    try {
      const response = await fetch('/api/cockpit/access-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: newCode.trim() }),
      });
      if (!response.ok) throw new Error('Failed to add code');
      setCodes((prev) => [...prev, newCode.trim()]);
      setNewCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add code');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (code: string) => {
    setDeletingCode(code);
    setError(null);
    try {
      const response = await fetch(`/api/cockpit/access-codes?code=${encodeURIComponent(code)}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to revoke code');
      setCodes((prev) => prev.filter((c) => c !== code));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke code');
    } finally {
      setDeletingCode(null);
    }
  };

  const handleCopy = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Access Codes" size="md">
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            {/* Add new code */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="Enter new code..."
                className="flex-1 rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-sky-500/50 focus:outline-none"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAdd}
                disabled={!newCode.trim() || isAdding}
                className="border-emerald-900/50 text-xs text-emerald-400 hover:bg-emerald-950/50"
              >
                {isAdding ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
              </Button>
            </div>

            {/* Codes list */}
            <div className="max-h-64 space-y-1.5 overflow-y-auto">
              {codes.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  No access codes configured
                </div>
              ) : (
                codes.map((code) => (
                  <div
                    key={code}
                    className="group flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2"
                  >
                    <code className="font-mono text-sm text-slate-300">{code}</code>
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => handleCopy(code)}
                        className={cn(
                          'rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white',
                          copiedCode === code && 'text-emerald-400'
                        )}
                        title="Copy"
                      >
                        {copiedCode === code ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                      <button
                        onClick={() => handleDelete(code)}
                        disabled={deletingCode === code}
                        className="rounded p-1.5 text-slate-400 transition-colors hover:bg-red-950/50 hover:text-red-400 disabled:opacity-50"
                        title="Revoke"
                      >
                        {deletingCode === code ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Trash2 size={12} />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {error}
              </div>
            )}

            {/* Info */}
            <div className="border-t border-slate-700/50 pt-2 text-xs text-slate-500">
              Access codes bypass rate limits for testing and development.
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
