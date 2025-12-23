import React from 'react';
import { UIVoiceState } from './Orb.logic';
import { NEURAL_INTENSITY } from './orb-styles';

interface OrbPulseGlowProps {
  uiVoiceState: UIVoiceState;
  color: string;
}

export const OrbPulseGlow = ({ uiVoiceState, color }: OrbPulseGlowProps) => {
  const intensity = NEURAL_INTENSITY[uiVoiceState];
  const ringCount = 3;

  // Calculate pulse opacity based on state
  const pulseOpacity = 0.1 + intensity.glowIntensity * 0.25;

  return (
    <div className="pointer-events-none absolute inset-0">
      {Array.from({ length: ringCount }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse-glow absolute inset-0 rounded-full"
          style={
            {
              background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
              '--pulse-opacity': pulseOpacity,
              '--pulse-scale': intensity.pulseScale,
              '--pulse-duration': `${intensity.pulseSpeed}s`,
              animationDelay: `${i * (intensity.pulseSpeed / ringCount)}s`,
              willChange: 'transform, opacity',
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};
