'use client';

interface OrbWaveformRingProps {
  amplitude: number;
  isActive: boolean;
  color: string;
}

export function OrbWaveformRing({ amplitude, isActive, color }: OrbWaveformRingProps) {
  if (!isActive) return null;

  const strokeWidth = 2 + amplitude * 4;
  const strokeOpacity = 0.3 + amplitude * 0.4;
  const blurAmount = amplitude * 2;
  const scale = 1 + amplitude * 0.02;

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{
        transform: `scale(${scale})`,
        transition: 'transform 75ms linear',
      }}
    >
      <defs>
        <filter id="waveform-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={blurAmount} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle
        cx="50%"
        cy="50%"
        r="48%"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        opacity={strokeOpacity}
        filter="url(#waveform-glow)"
        style={{ transition: 'stroke-width 75ms linear, opacity 75ms linear' }}
      />
    </svg>
  );
}
