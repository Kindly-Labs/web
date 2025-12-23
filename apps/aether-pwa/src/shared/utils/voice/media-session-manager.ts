/**
 * Media Session Manager - Bridge to @owly-labs/voice-utils
 *
 * Re-exports MediaSessionManager from @owly-labs/voice-utils
 * with the app's logger injected.
 */

import {
  MediaSessionManager as BaseMediaSessionManager,
  createMediaSessionManager,
  type MediaSessionHandlers,
  type MediaSessionManagerConfig,
  type Logger,
} from '@owly-labs/voice-utils';
import { logger } from '@/shared/lib/logger';

// Create the app's logger adapter
const voiceLogger: Logger = {
  info: (category: string, message: string, data?: unknown) => logger.info(category, message, data),
  warn: (category: string, message: string, error?: unknown) =>
    logger.warn(category, message, error),
  error: (category: string, message: string, data?: unknown, stack?: string) =>
    logger.error(category, message, data, stack),
  debug: (category: string, message: string, data?: unknown) =>
    logger.debug(category, message, data),
};

/**
 * MediaSessionManager with Aether-specific configuration
 *
 * Provides backward-compatible constructor signature while using
 * the shared @owly-labs/voice-utils implementation.
 */
export class MediaSessionManager extends BaseMediaSessionManager {
  constructor(onPlay: () => Promise<void>, onPause: () => Promise<void>, onStop: () => void) {
    super({
      handlers: { onPlay, onPause, onStop },
      metadata: {
        title: 'Aether',
        artist: 'Voice Companion',
        artwork: [{ src: '/icons/globe.svg', sizes: '512x512', type: 'image/svg+xml' }],
      },
      logger: voiceLogger,
    });
  }

  // Backward-compatible method name
  public updateMetadata(isPlaying: boolean) {
    this.updatePlaybackState(isPlaying);
  }
}

// Re-export types and factory
export { createMediaSessionManager, type MediaSessionHandlers, type MediaSessionManagerConfig };
