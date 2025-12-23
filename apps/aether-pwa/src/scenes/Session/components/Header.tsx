import React from 'react';

interface HeaderProps {
  uiVoiceState: string;
}

export const Header = ({ uiVoiceState }: HeaderProps) => {
  return (
    <div className="w-full max-w-2xl">
      <div className="rounded-2xl border border-emerald-400/10 bg-gradient-to-br from-emerald-950/40 to-teal-950/30 px-6 py-4 shadow-[0_8px_40px_rgba(16,185,129,0.15),0_0_60px_rgba(20,184,166,0.08)] backdrop-blur-xl md:rounded-[2rem] md:px-8 md:py-5">
        <div className="flex items-center justify-between">
          <h1
            className="bg-gradient-to-r from-emerald-200 to-teal-200 bg-clip-text text-3xl font-extralight tracking-[0.25em] text-transparent md:text-4xl"
            style={{ textShadow: '0 0 60px rgba(52,211,153,0.3)' }}
          >
            AETHER
          </h1>
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              uiVoiceState === 'error'
                ? 'bg-rose-500'
                : uiVoiceState !== 'idle'
                  ? 'animate-pulse bg-emerald-400'
                  : 'bg-emerald-600/50'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
