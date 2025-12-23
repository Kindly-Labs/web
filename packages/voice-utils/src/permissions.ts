// ============================================================================
// Microphone Permissions
// ============================================================================

import type { Logger, PermissionStatus } from './types';

const noopLogger: Logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};

export async function requestMicrophonePermission(logger: Logger = noopLogger): Promise<boolean> {
  logger.info('PERMISSIONS', 'Requesting microphone permission...');

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    logger.error('PERMISSIONS', 'getUserMedia not supported on this browser.');
    return false;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop tracks immediately to release the microphone
    stream.getTracks().forEach((track) => track.stop());
    logger.info('PERMISSIONS', 'Microphone permission granted.');
    return true;
  } catch (err: unknown) {
    const error = err as Error;
    logger.error(
      'PERMISSIONS',
      'Microphone permission denied or error.',
      { error: error.name, message: error.message },
      error.stack
    );
    return false;
  }
}

export async function checkMicrophonePermission(): Promise<PermissionStatus> {
  if (typeof navigator === 'undefined' || !navigator.permissions) {
    return 'idle';
  }

  try {
    const result = await navigator.permissions.query({
      name: 'microphone' as PermissionName,
    });

    switch (result.state) {
      case 'granted':
        return 'granted';
      case 'denied':
        return 'denied';
      case 'prompt':
      default:
        return 'idle';
    }
  } catch {
    // Permissions API not supported for microphone
    return 'idle';
  }
}
