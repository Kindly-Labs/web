'use client';

import React, { useState } from 'react';
import { RefreshCw, Play, Square, Mic, Volume2 } from 'lucide-react';

type GapState = 'IDLE' | 'STORY' | 'INTERRUPT' | 'ANCHOR' | 'RELEASE';

export const GapSession = () => {
  const [state, setState] = useState<GapState>('IDLE');
  const [transcript, setTranscript] = useState('Tap mic to start...');
  const [systemMessage, setSystemMessage] = useState('Ready');

  // Simulation Handlers
  const startStory = () => {
    setState('STORY');
    setSystemMessage('Listening to the Story...');
    setTranscript('My boss is being impossible regarding the deadline...');
  };

  const triggerInterrupt = () => {
    setState('INTERRUPT');
    setSystemMessage('INTERRUPT: Pattern Break');
    // Simulating Audio Halt
  };

  const triggerAnchor = () => {
    setState('ANCHOR');
    setSystemMessage('ANCHOR: Body Texture (Drone Fades In)');
  };

  const triggerRelease = () => {
    setState('RELEASE');
    setSystemMessage('RELEASE: Choice');
  };

  const reset = () => {
    setState('IDLE');
    setSystemMessage('Ready');
    setTranscript('Tap mic to start...');
  };

  return (
    <div className="relative mx-auto flex h-[100dvh] w-full max-w-md flex-col items-center justify-between overflow-hidden bg-zinc-950 p-6 text-zinc-100">
      {/* Background Ambience */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${state === 'ANCHOR' ? 'bg-emerald-950/20 opacity-100' : 'opacity-0'}`}
      />

      {/* Header */}
      <div className="z-10 flex w-full items-center justify-between opacity-50">
        <span className="font-mono text-xs tracking-widest uppercase">The Gap // Proto</span>
        <div className="flex gap-2">
          {state !== 'IDLE' && (
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          )}
        </div>
      </div>

      {/* Main Visualizer Area */}
      <div className="relative z-10 flex w-full flex-grow flex-col items-center justify-center">
        {/* State Indicator */}
        <div
          className={`mb-8 text-4xl font-bold transition-all duration-500 ${state === 'ANCHOR' ? 'scale-110 text-emerald-400' : 'text-zinc-500'}`}
        >
          {state}
        </div>

        {/* The Waveform / Orb */}
        <div className="relative">
          {/* Base Orb */}
          <div
            className={`h-32 w-32 rounded-full blur-xl transition-all duration-700 ${state === 'IDLE' ? 'scale-100 bg-zinc-800' : ''} ${state === 'STORY' ? 'scale-125 animate-pulse bg-orange-500/50' : ''} ${state === 'INTERRUPT' ? 'scale-90 border-4 border-white bg-red-500/80' : ''} ${state === 'ANCHOR' ? 'scale-150 animate-pulse bg-emerald-500/40 duration-[3000ms]' : ''} ${state === 'RELEASE' ? 'scale-110 bg-blue-400/30' : ''} `}
          />

          {/* Center Anchor */}
          <div
            className={`absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white transition-all duration-300 ${state === 'ANCHOR' ? 'opacity-100' : 'opacity-0'} `}
          />
        </div>

        {/* Transcript / AI Voice */}
        <div className="mt-12 h-32 max-w-xs space-y-4 text-center">
          <p className="text-sm text-zinc-400 italic">&quot;{transcript}&quot;</p>
          <p
            className={`font-mono text-xs tracking-wider text-emerald-500 uppercase transition-opacity ${systemMessage ? 'opacity-100' : 'opacity-0'}`}
          >
            {systemMessage}
          </p>
        </div>
      </div>

      {/* Controls (Prototype Only) */}
      <div className="z-10 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-sm">
        <p className="mb-4 text-center text-xs text-zinc-500">SIMULATION CONTROLS</p>
        <div className="flex justify-between gap-2">
          <button
            onClick={startStory}
            disabled={state !== 'IDLE'}
            className="flex flex-1 flex-col items-center gap-1 rounded-lg bg-zinc-800 p-3 hover:bg-zinc-700 disabled:opacity-20"
          >
            <Mic size={16} />
            <span className="text-[10px]">Story</span>
          </button>

          <button
            onClick={triggerInterrupt}
            disabled={state !== 'STORY'}
            className="flex flex-1 flex-col items-center gap-1 rounded-lg bg-zinc-800 p-3 hover:bg-zinc-700 disabled:opacity-20"
          >
            <Square size={16} />
            <span className="text-[10px]">Interrupt</span>
          </button>

          <button
            onClick={triggerAnchor}
            disabled={state !== 'INTERRUPT'}
            className="flex flex-1 flex-col items-center gap-1 rounded-lg bg-zinc-800 p-3 hover:bg-zinc-700 disabled:opacity-20"
          >
            <Volume2 size={16} />
            <span className="text-[10px]">Anchor</span>
          </button>

          <button
            onClick={triggerRelease}
            disabled={state !== 'ANCHOR'}
            className="flex flex-1 flex-col items-center gap-1 rounded-lg bg-zinc-800 p-3 hover:bg-zinc-700 disabled:opacity-20"
          >
            <Play size={16} />
            <span className="text-[10px]">Release</span>
          </button>

          <button
            onClick={reset}
            className="flex flex-col items-center gap-1 rounded-lg bg-zinc-800 p-3 hover:bg-zinc-700"
          >
            <RefreshCw size={16} />
            <span className="text-[10px]">Rst</span>
          </button>
        </div>
      </div>
    </div>
  );
};
