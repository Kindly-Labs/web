/**
 * Browser Support - Bridge to @owly-labs/voice-utils
 *
 * Re-exports browser support utilities from @owly-labs/voice-utils
 * with the app's logger injected.
 */

import {
  isSecureContext,
  isBrowserSupported as baseIsBrowserSupported,
  checkWebSpeechSupport,
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

// Re-export with logger injected
export { isSecureContext, checkWebSpeechSupport };

export function isBrowserSupported(): Promise<boolean> {
  return baseIsBrowserSupported(voiceLogger);
}
