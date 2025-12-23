'use client';

import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-emerald-950 to-black p-6 text-center">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Icon */}
      <div className="relative mb-8">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-emerald-400/20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
          <WifiOff className="h-12 w-12 text-emerald-300/80" />
        </div>
        {/* Pulse ring */}
        <div className="absolute inset-0 animate-ping rounded-full border-2 border-emerald-400/30" />
      </div>

      {/* Text */}
      <h1 className="mb-3 bg-gradient-to-r from-emerald-200 to-teal-200 bg-clip-text text-2xl font-light tracking-wide text-transparent">
        You&apos;re Offline
      </h1>
      <p className="mb-8 max-w-xs text-sm leading-relaxed text-emerald-100/60">
        Aether needs an internet connection to connect you with your voice companion. Please check
        your connection and try again.
      </p>

      {/* Retry button */}
      <button
        onClick={handleRetry}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 font-medium tracking-wide text-white shadow-lg shadow-emerald-900/30 transition-all hover:from-emerald-500 hover:to-teal-500 active:scale-95"
      >
        <RefreshCw className="h-4 w-4" />
        Try Again
      </button>

      {/* Footer */}
      <div className="absolute right-0 bottom-8 left-0">
        <p className="text-xs text-emerald-400/30">AETHER</p>
      </div>
    </div>
  );
}
