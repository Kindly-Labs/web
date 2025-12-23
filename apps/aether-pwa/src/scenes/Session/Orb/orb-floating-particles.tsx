import React, { useMemo } from 'react';
import { UIVoiceState } from './Orb.logic';
import { NEURAL_INTENSITY } from './orb-styles';

interface Particle {
  id: number;
  size: number;
  radius: number;
  duration: number;
  delay: number;
  pulseDuration: number;
}

interface OrbFloatingParticlesProps {
  uiVoiceState: UIVoiceState;
  color: string;
}

// Generate particles once with stable random values
const generateParticles = (count: number): Particle[] => {
  // Use seeded pseudo-random for consistent SSR/CSR
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
  };

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    size: 3 + seededRandom(i * 1) * 3, // 3-6px
    radius: 100 + seededRandom(i * 2) * 60, // 100-160px
    duration: 8 + seededRandom(i * 3) * 7, // 8-15s base
    delay: seededRandom(i * 4) * 5, // 0-5s delay
    pulseDuration: 1.5 + seededRandom(i * 5) * 1, // 1.5-2.5s pulse
  }));
};

// Pre-generate max particles
const MAX_PARTICLES = 12;
const allParticles = generateParticles(MAX_PARTICLES);

export const OrbFloatingParticles = ({ uiVoiceState, color }: OrbFloatingParticlesProps) => {
  const intensity = NEURAL_INTENSITY[uiVoiceState];

  // Get visible particles based on state
  const visibleParticles = useMemo(
    () => allParticles.slice(0, intensity.particleCount),
    [intensity.particleCount]
  );

  // Speed multiplier affects orbit duration
  const speedMultiplier = intensity.particleSpeed;

  return (
    <div className="pointer-events-none absolute inset-0">
      {visibleParticles.map((particle) => (
        <div
          key={particle.id}
          className="animate-particle-orbit absolute top-1/2 left-1/2 rounded-full"
          style={
            {
              width: particle.size,
              height: particle.size,
              marginLeft: -particle.size / 2,
              marginTop: -particle.size / 2,
              backgroundColor: color,
              boxShadow: `0 0 ${particle.size * 2}px ${color}, 0 0 ${particle.size * 4}px ${color}40`,
              '--orbit-radius': `${particle.radius}px`,
              '--orbit-duration': `${particle.duration / speedMultiplier}s`,
              '--base-opacity': intensity.particleOpacity,
              '--peak-opacity': Math.min(1, intensity.particleOpacity + 0.2),
              animationDelay: `${particle.delay}s`,
              willChange: 'transform',
            } as React.CSSProperties
          }
        >
          {/* Inner pulse for each particle */}
          <div
            className="animate-particle-pulse absolute inset-0 rounded-full"
            style={
              {
                backgroundColor: color,
                '--base-opacity': intensity.particleOpacity,
                '--peak-opacity': Math.min(1, intensity.particleOpacity + 0.3),
                animationDuration: `${particle.pulseDuration}s`,
                animationDelay: `${particle.delay * 0.5}s`,
              } as React.CSSProperties
            }
          />
        </div>
      ))}
    </div>
  );
};
