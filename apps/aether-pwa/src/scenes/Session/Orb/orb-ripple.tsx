'use client';

import { useEffect, useState } from 'react';

interface OrbRippleProps {
  isActive: boolean;
  color: string;
}

export function OrbRipple({ isActive, color }: OrbRippleProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShouldRender(true);
      const timer = setTimeout(() => setShouldRender(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  if (!shouldRender) return null;

  return (
    <div
      className="animate-ripple-single pointer-events-none absolute inset-0 rounded-full"
      style={{
        border: `2px solid ${color}`,
        willChange: 'transform, opacity',
      }}
    />
  );
}
