// ============================================================================
// @owly-labs/voice-utils - Voice and Audio Utilities for Aether Platform
// ============================================================================

// Types
export type {
  Logger,
  PermissionStatus,
  MediaSessionMetadata,
  AudioPlayerOptions,
  QueueItem,
} from './types';

// Browser Support
export { isSecureContext, isBrowserSupported, checkWebSpeechSupport } from './browser-support';

// Permissions
export { requestMicrophonePermission, checkMicrophonePermission } from './permissions';

// Media Session
export {
  MediaSessionManager,
  createMediaSessionManager,
  type MediaSessionHandlers,
  type MediaSessionManagerConfig,
} from './media-session';

// Audio Player
export { AudioPlayer, createAudioPlayer, type AudioPlayerConfig } from './audio-player';
