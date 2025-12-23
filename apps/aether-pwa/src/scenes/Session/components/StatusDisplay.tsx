import React from 'react';
import { Mic } from 'lucide-react';
import { useTypewriter, useTypewriterWithAudioSync } from '../Orb/Typewriter.logic';

interface StatusDisplayProps {
  uiVoiceState: string;
  visualStatus: {
    text: string;
    subtext: string;
    isFaded?: boolean;
    speed?: number;
    audioDuration?: number;
  };
}

export const StatusDisplay = ({ uiVoiceState, visualStatus }: StatusDisplayProps) => {
  const { text, subtext, isFaded, speed, audioDuration } = visualStatus;

  // Always call both hooks (Rules of Hooks requires consistent hook calls)
  const syncedText = useTypewriterWithAudioSync(text, audioDuration, speed);
  const regularText = useTypewriter(text, speed);

  // Use audio-synced text when duration is available, otherwise use regular
  const displayedText = audioDuration !== undefined ? syncedText : regularText;

  const textClasses = `
    text-lg md:text-xl font-light tracking-wide transition-all duration-slow
    ${isFaded ? 'opacity-40 blur-[0.5px]' : ''}
    ${
      uiVoiceState === 'listening'
        ? 'text-emerald-300'
        : uiVoiceState === 'speaking'
          ? 'text-lime-300'
          : uiVoiceState === 'processing'
            ? 'text-teal-300'
            : 'text-green-300'
    }
  `;

  const subtextClasses = 'text-emerald-300/70 text-xs md:text-sm font-light';

  return (
    <div className="duration-normal relative w-auto max-w-[90vw] transition-all md:max-w-4xl">
      {/* min-h to prevent layout shifts when text changes */}
      <div className="duration-normal flex min-h-[100px] w-auto min-w-[200px] flex-col justify-center rounded-2xl border border-emerald-400/10 bg-gradient-to-br from-emerald-950/50 to-teal-950/40 px-6 py-4 shadow-lg backdrop-blur-xl transition-all md:min-w-[240px] md:px-10 md:py-5">
        <div className="relative space-y-1 text-center">
          {/* Invisible Sizer (Uses full text to set stable dimensions) */}
          <div className="invisible min-h-[3.5rem] select-none" aria-hidden="true">
            <p className={textClasses}>{text || '\u00A0'}</p>
            <p className={subtextClasses}>{subtext || '\u00A0'}</p>
          </div>

          {/* Visible Animator (Overlays the sizer) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {uiVoiceState === 'listening' && (
              <div className="relative mb-2">
                <Mic className="h-6 w-6 animate-pulse text-blue-400" />
              </div>
            )}
            <p className={textClasses}>{displayedText}</p>
            <p className={subtextClasses}>{subtext}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
