'use client';

import React from 'react';

// Context & Hooks
import { useSession } from './Session.context';
import { useAetherVisuals } from './Orb/Orb.logic';
import { useSessionAudio } from './hooks/use-session-audio';
import { useOnlineStatus } from '@/shared/hooks/use-online-status';

// Utilities
import { audioPlayer } from '@/shared/utils/voice/audio-player';

// Components
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { StatusDisplay } from './components/StatusDisplay';
import { OrbContainer } from './Orb/Orb';

export const AetherUI = () => {
  const { state, actions } = useSession();
  const isOnline = useOnlineStatus();

  // Custom Hooks
  const { uiVoiceState, emotionalTone, breatheIntensity, visualStatus } = useAetherVisuals({
    sessionStatus: state.status,
    voiceState: state.voiceState,
    permissionStatus: state.permissionStatus,
    activeText: state.activeText,
    activeTextSource: state.activeTextSource,
    currentMessageDuration: state.currentMessageDuration,
    currentChunkDuration: state.currentChunkDuration,
    isOnline,
    language: state.language,
  });

  const { playOcean } = useSessionAudio({ sessionStatus: state.status });

  const handleInteraction = () => {
    // If we are starting a session (IDLE), delegate EVERYTHING to handleStartSession
    // to ensure the user gesture is used for the critical getUserMedia call first.
    if (state.status === 'idle') {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        // This typically doesn't block getUserMedia, but good to keep it lightweight.
        const silentUtterance = new SpeechSynthesisUtterance('');
        silentUtterance.volume = 0;
        window.speechSynthesis.speak(silentUtterance);
      }
      playOcean(); // This plays an HTMLAudioElement, usually fine.
      actions.handleStartSession();
      return;
    }

    // Critical: Unlock Audio Context & Web Speech API immediately on user interaction
    // We only do this if we are ALREADY running/connected, to resume potentially suspended contexts.
    audioPlayer.resume().catch(console.error);

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const silentUtterance = new SpeechSynthesisUtterance('');
      silentUtterance.volume = 0;
      window.speechSynthesis.speak(silentUtterance);
    }

    // When rate limited, tapping the orb does nothing (user should use Gear menu)
    if (state.status === 'limit-reached') return;
    if (state.status === 'initializing') return;

    if (!isOnline) return;
    if (state.status === 'unsupported' || state.status === 'insecure-context') return;

    actions.toggleListening();
  };

  return (
    // Zero-friction MVP: No pop-ups, all messaging in Gear Menu
    <div className="pt-safe pb-safe relative h-[100dvh] w-full touch-none overflow-hidden">
      {/* Subtle vignette overlay for depth */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 100%)',
        }}
      />

      {/* Main Content Layout */}
      <div className="relative z-10 flex h-full flex-col items-center justify-between px-4 py-4 md:px-6 md:py-8">
        <Header uiVoiceState={uiVoiceState} />

        {/* Central Orb & Status */}
        <div
          className={`duration-slow flex w-full flex-col items-center justify-center space-y-8 pt-8 transition-all md:space-y-10 md:pt-16 ${uiVoiceState === 'listening' ? 'scale-[0.98] opacity-60' : 'scale-100 opacity-100'}`}
        >
          <OrbContainer
            uiVoiceState={uiVoiceState}
            sessionStatus={state.status}
            permissionStatus={state.permissionStatus}
            emotionalTone={emotionalTone}
            onInteraction={handleInteraction}
          />
        </div>

        <StatusDisplay uiVoiceState={uiVoiceState} visualStatus={visualStatus} />

        <Footer
          emotionalTone={emotionalTone}
          uiVoiceState={uiVoiceState}
          isRateLimited={state.status === 'limit-reached'}
        />
      </div>
    </div>
  );
};
