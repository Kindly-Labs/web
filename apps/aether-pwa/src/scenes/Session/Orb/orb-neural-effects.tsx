'use client';

import React, { useEffect, useState } from 'react';
import { UIVoiceState, EmotionalTone } from './Orb.logic';
import { ORB_STYLES } from './orb-styles';
import { OrbFloatingParticles } from './orb-floating-particles';
import { OrbPulseGlow } from './orb-pulse-glow';

interface OrbNeuralEffectsProps {
  uiVoiceState: UIVoiceState;
  emotionalTone: EmotionalTone;
}

export const OrbNeuralEffects = ({ uiVoiceState, emotionalTone }: OrbNeuralEffectsProps) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Skip all neural effects if reduced motion is preferred
  if (prefersReducedMotion) {
    return null;
  }

  const currentStyle = ORB_STYLES[emotionalTone];

  return (
    <div className="pointer-events-none absolute inset-[-50%]">
      {/* Pulse glow waves (heartbeat effect) */}
      <div className="absolute inset-[25%]">
        <OrbPulseGlow uiVoiceState={uiVoiceState} color={currentStyle.primary} />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-[25%]">
        <OrbFloatingParticles uiVoiceState={uiVoiceState} color={currentStyle.particles} />
      </div>
    </div>
  );
};
