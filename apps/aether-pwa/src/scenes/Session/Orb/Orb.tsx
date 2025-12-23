'use client';

import { useMemo, useState, useCallback } from 'react';
import { PermissionStatus } from '@/shared/utils/voice/permissions';
import { SessionStatus } from '../Session.logic';
import { UIVoiceState, EmotionalTone } from './Orb.logic';
import { OrbLiquidFill } from './orb-liquid-fill';
import { OrbWaveformRing } from './orb-waveform-ring';
import { OrbStatusOverlay } from './orb-status-overlay';
import { OrbRipple } from './orb-ripple';
import { OrbNeuralEffects } from './orb-neural-effects';
import { OrbCoreGlow } from './orb-core-glow';
import { ORB_STYLES } from './orb-styles';
import { useAudioAmplitude } from '../hooks/use-audio-amplitude';

export interface OrbContainerProps {
  uiVoiceState: UIVoiceState;
  sessionStatus: SessionStatus;
  permissionStatus: PermissionStatus;
  emotionalTone: EmotionalTone;
  onInteraction: () => void;
}

export function OrbContainer({
  uiVoiceState,
  sessionStatus,
  permissionStatus,
  emotionalTone,
  onInteraction,
}: OrbContainerProps) {
  const [rippleKey, setRippleKey] = useState(0);

  // Audio amplitude for waveform ring visualization
  const isVoiceActive = uiVoiceState === 'listening' || uiVoiceState === 'speaking';
  const amplitude = useAudioAmplitude(isVoiceActive);

  // Dynamic scaling based on state
  const scale = useMemo(() => {
    switch (uiVoiceState) {
      case 'listening':
        return 1.05;
      case 'speaking':
        return 1.1;
      case 'processing':
        return 0.95;
      default:
        return 1;
    }
  }, [uiVoiceState]);

  // Determine active color scheme
  const currentStyle = ORB_STYLES[emotionalTone];

  // Haptic feedback utility
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10]);
    }
  };

  const handleInteraction = useCallback(() => {
    triggerHaptic();
    setRippleKey((prev) => prev + 1);
    onInteraction();
  }, [onInteraction]);

  return (
    <div
      role="button"
      aria-label="Start Session"
      tabIndex={0}
      className={`duration-emphasis relative h-64 w-64 cursor-pointer touch-manipulation rounded-full transition-transform focus:ring-4 focus:ring-white/20 focus:outline-none md:h-80 md:w-80 ${uiVoiceState === 'speaking' ? 'animate-breathe' : ''}`}
      style={{ transform: `scale(${scale})` }}
      onClick={handleInteraction}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleInteraction();
        }
      }}
    >
      {/* 0. Ripple Effect (On Tap) */}
      <OrbRipple key={rippleKey} isActive={rippleKey > 0} color={currentStyle.primary} />

      {/* 1. Neural Effects (particles, rings, pulse - extends outside orb) */}
      <OrbNeuralEffects uiVoiceState={uiVoiceState} emotionalTone={emotionalTone} />

      {/* 2. Core Glow (inside orb, below liquid fill) */}
      <OrbCoreGlow
        uiVoiceState={uiVoiceState}
        primaryColor={currentStyle.primary}
        secondaryColor={currentStyle.secondary}
      />

      {/* 3. Core Liquid Fill (Base) */}
      <OrbLiquidFill state={uiVoiceState} emotionalTone={emotionalTone} />

      {/* 4. Waveform Ring (Audio Visualization) */}
      <OrbWaveformRing
        amplitude={amplitude}
        isActive={isVoiceActive}
        color={currentStyle.primary}
      />

      {/* 5. Status/Error Overlays (Top Layer) */}
      <OrbStatusOverlay sessionStatus={sessionStatus} permissionStatus={permissionStatus} />

      {/* 6. Glass Reflection/Glare (Static) */}
      <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent opacity-40" />
      <div className="pointer-events-none absolute top-4 left-8 h-8 w-16 rounded-full bg-white/30 blur-xl" />
    </div>
  );
}
