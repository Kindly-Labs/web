/**
 * Permissions - Bridge to @owly-labs/voice-utils
 *
 * Re-exports permission utilities from @owly-labs/voice-utils
 * with the app's logger injected.
 */

import {
  requestMicrophonePermission as baseRequestMicrophonePermission,
  checkMicrophonePermission,
  type PermissionStatus,
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

// Re-export type
export type { PermissionStatus };

// Wrap the function with our logger
export async function requestMicrophonePermission(): Promise<boolean> {
  return baseRequestMicrophonePermission(voiceLogger);
}

// Re-export other utilities directly
export { checkMicrophonePermission };
