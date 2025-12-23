import { useState, useEffect } from 'react';

/**
 * useReducedMotion Hook
 *
 * Accessibility hook that detects if the user has requested reduced motion
 * via their system preferences (prefers-reduced-motion media query).
 *
 * When true, disable:
 * - 3D scene animations
 * - Parallax effects
 * - Complex transitions
 * - Auto-playing animations
 *
 * @returns {boolean} true if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if browser supports matchMedia
    if (!window.matchMedia) {
      return;
    }

    // Create media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Handler for media query changes
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setPrefersReducedMotion(event.matches);
    };

    // Add listener (use deprecated method if new method not available)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      // @ts-ignore
      mediaQuery.addListener(handleChange as any);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        // @ts-ignore
        mediaQuery.removeListener(handleChange as any);
      }
    };
  }, []);

  return prefersReducedMotion;
}
