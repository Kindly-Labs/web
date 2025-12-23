/**
 * Audio Player - Bridge to @owly-labs/voice-utils
 *
 * This module creates an AudioPlayer instance from @owly-labs/voice-utils
 * with the app's logger injected, maintaining the original singleton export.
 */

import { createAudioPlayer, type Logger } from '@owly-labs/voice-utils';
import { logger } from '@/shared/lib/logger';

// Create the app's logger adapter for the voice-utils package
const voiceLogger: Logger = {
  info: (category: string, message: string, data?: unknown) => logger.info(category, message, data),
  warn: (category: string, message: string, error?: unknown) =>
    logger.warn(category, message, error),
  error: (category: string, message: string, data?: unknown, stack?: string) =>
    logger.error(category, message, data, stack),
  debug: (category: string, message: string, data?: unknown) =>
    logger.debug(category, message, data),
};

// Create and export the singleton audio player with Aether-specific config
export const audioPlayer = createAudioPlayer({
  logger: voiceLogger,
  mediaMetadata: {
    title: 'Aether',
    artist: 'Voice Companion',
    artwork: [{ src: '/icons/globe.svg', sizes: '512x512', type: 'image/svg+xml' }],
  },
});

// Re-export the AudioPlayer class for direct instantiation if needed
export { AudioPlayer, type AudioPlayerConfig } from '@owly-labs/voice-utils';
