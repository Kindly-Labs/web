import React from 'react';
import { UIVoiceState } from './Orb.logic';
import { NEURAL_INTENSITY } from './orb-styles';

interface OrbCoreGlowProps {
  uiVoiceState: UIVoiceState;
  primaryColor: string;
  secondaryColor: string;
}

export const OrbCoreGlow = ({ uiVoiceState, primaryColor, secondaryColor }: OrbCoreGlowProps) => {
  const intensity = NEURAL_INTENSITY[uiVoiceState];

  // Calculate breath duration based on state (faster when speaking)
  const breathDuration = 4 / (intensity.glowIntensity + 0.5);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
      {/* Outer glow layer */}
      <div
        className="animate-core-breath absolute inset-[-20%] rounded-full"
        style={
          {
            background: `radial-gradient(circle at 50% 50%, ${primaryColor}40 0%, ${secondaryColor}20 40%, transparent 70%)`,
            '--min-opacity': intensity.glowIntensity * 0.5,
            '--max-opacity': intensity.glowIntensity,
            '--breath-duration': `${breathDuration}s`,
            willChange: 'transform, opacity',
          } as React.CSSProperties
        }
      />

      {/* Inner bright core */}
      <div
        className="animate-core-breath absolute inset-[20%] rounded-full"
        style={
          {
            background: `radial-gradient(circle, ${primaryColor}60 0%, transparent 70%)`,
            '--min-opacity': intensity.glowIntensity * 0.6,
            '--max-opacity': intensity.glowIntensity * 1.2,
            '--breath-duration': `${breathDuration * 0.8}s`,
            animationDelay: `${breathDuration * 0.15}s`,
            filter: 'blur(8px)',
            willChange: 'transform, opacity',
          } as React.CSSProperties
        }
      />

      {/* Center highlight spot */}
      <div
        className="animate-pulse-slow absolute inset-[35%] rounded-full"
        style={{
          background: `radial-gradient(circle, ${primaryColor}80 0%, transparent 60%)`,
          filter: 'blur(4px)',
          opacity: intensity.glowIntensity * 0.5,
        }}
      />
    </div>
  );
};
