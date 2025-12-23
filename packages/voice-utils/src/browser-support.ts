// ============================================================================
// Browser Support Detection
// ============================================================================

import type { Logger } from './types';

const noopLogger: Logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};

export function isSecureContext(): boolean {
  return typeof window !== 'undefined' && window.isSecureContext;
}

export function isBrowserSupported(logger: Logger = noopLogger): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    // Modern browsers require getUserMedia and AudioContext
    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const hasAudioContext = 'AudioContext' in window || 'webkitAudioContext' in window;

    logger.debug('BROWSER_SUPPORT', 'Checking compatibility', {
      hasGetUserMedia,
      hasAudioContext,
    });

    if (hasGetUserMedia && hasAudioContext) {
      resolve(true);
    } else {
      logger.error('BROWSER_SUPPORT', 'Missing required APIs', {
        hasGetUserMedia,
        hasAudioContext,
      });
      resolve(false);
    }
  });
}

export function checkWebSpeechSupport(): {
  speechRecognition: boolean;
  speechSynthesis: boolean;
} {
  if (typeof window === 'undefined') {
    return { speechRecognition: false, speechSynthesis: false };
  }

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  return {
    speechRecognition: !!SpeechRecognition,
    speechSynthesis: 'speechSynthesis' in window,
  };
}
