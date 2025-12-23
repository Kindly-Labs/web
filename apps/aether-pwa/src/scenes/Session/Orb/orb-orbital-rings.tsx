import React from 'react';
import { UIVoiceState } from './Orb.logic';
import { NEURAL_INTENSITY } from './orb-styles';

interface RingConfig {
  rotateX: number;
  rotateY: number;
  duration: number;
  size: number; // Multiplier for orb size
}

const ringConfigs: RingConfig[] = [
  { rotateX: 70, rotateY: 0, duration: 12, size: 1.15 },
  { rotateX: 75, rotateY: 60, duration: 15, size: 1.25 },
  { rotateX: 80, rotateY: 120, duration: 18, size: 1.35 },
];

interface OrbOrbitalRingsProps {
  uiVoiceState: UIVoiceState;
  color: string;
}

export const OrbOrbitalRings = ({ uiVoiceState, color }: OrbOrbitalRingsProps) => {
  const intensity = NEURAL_INTENSITY[uiVoiceState];
  const speedMultiplier = intensity.ringSpeed;

  return (
    <div className="pointer-events-none absolute inset-[-20%]" style={{ perspective: '500px' }}>
      {ringConfigs.map((ring, i) => (
        <svg
          key={i}
          className="animate-orbital-spin absolute inset-0 h-full w-full"
          style={
            {
              '--rx': `${ring.rotateX}deg`,
              '--ry': `${ring.rotateY}deg`,
              '--spin-duration': `${ring.duration / speedMultiplier}s`,
              transformStyle: 'preserve-3d',
            } as React.CSSProperties
          }
          viewBox="0 0 100 100"
        >
          <defs>
            <filter id={`ring-glow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <ellipse
            cx="50"
            cy="50"
            rx={ring.size * 40}
            ry={ring.size * 40}
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            opacity={intensity.ringOpacity}
            filter={`url(#ring-glow-${i})`}
          />
        </svg>
      ))}
    </div>
  );
};
