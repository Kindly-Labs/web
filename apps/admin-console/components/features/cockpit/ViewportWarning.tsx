'use client';

import { useState, useEffect } from 'react';
import { Monitor, X } from 'lucide-react';

const MIN_WIDTH = 1280;
const MIN_HEIGHT = 800;

export function ViewportWarning() {
  const [isSmallViewport, setIsSmallViewport] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      const tooSmall = window.innerWidth < MIN_WIDTH || window.innerHeight < MIN_HEIGHT;
      setIsSmallViewport(tooSmall);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  if (!isSmallViewport || dismissed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 p-8 backdrop-blur-sm">
      <div className="max-w-md rounded-xl border border-slate-700 bg-slate-800 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20">
          <Monitor size={32} className="text-amber-400" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-white">Viewport Too Small</h2>
        <p className="mb-6 text-slate-400">
          The cockpit is designed for screens at least {MIN_WIDTH}x{MIN_HEIGHT}px. Your current
          viewport is{' '}
          {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'unknown'}
          px.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setDismissed(true)}
            className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-white transition-colors hover:bg-slate-600"
          >
            <X size={16} />
            Continue Anyway
          </button>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          For the best experience, use a larger screen or zoom out your browser.
        </p>
      </div>
    </div>
  );
}
