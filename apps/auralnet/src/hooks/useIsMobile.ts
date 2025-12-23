import { useState, useEffect } from 'react';

/**
 * useIsMobile Hook
 *
 * Detects if the user is on a mobile device to disable 3D rendering
 * and enable CSS-only background fallback for battery efficiency.
 *
 * Mobile Detection Strategy:
 * 1. Screen width < 768px (tablet and below)
 * 2. Touch device detection via navigator
 *
 * @returns {boolean} true if mobile device detected
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Function to check if device is mobile
    const checkIsMobile = () => {
      // Check screen width
      const isSmallScreen = window.innerWidth < 768;

      // Check if touch device
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // Check user agent for mobile devices (fallback)
      const mobileUserAgentRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileUserAgent = mobileUserAgentRegex.test(navigator.userAgent);

      // Device is mobile if it's a small screen OR (touch device AND mobile user agent)
      const mobile = isSmallScreen || (isTouchDevice && isMobileUserAgent);

      setIsMobile(mobile);
    };

    // Check on mount
    checkIsMobile();

    // Re-check on window resize
    window.addEventListener('resize', checkIsMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}
