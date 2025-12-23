'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Hook that provides simulated audio amplitude for visualization.
 * Returns a normalized value between 0-1 that smoothly oscillates
 * when active, simulating voice activity.
 *
 * Future enhancement: Connect to actual Web Audio API AnalyserNode
 * for real audio visualization.
 */
export function useAudioAmplitude(isActive: boolean): number {
  const [amplitude, setAmplitude] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);
  const targetRef = useRef(0);

  useEffect(() => {
    if (!isActive) {
      setAmplitude(0);
      return;
    }

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;

      // Update target periodically for organic feel
      if (deltaTime > 100) {
        targetRef.current = 0.3 + Math.random() * 0.5;
        lastTime = currentTime;
      }

      // Smooth interpolation toward target
      setAmplitude((prev) => {
        const diff = targetRef.current - prev;
        return prev + diff * 0.08;
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isActive]);

  return amplitude;
}
