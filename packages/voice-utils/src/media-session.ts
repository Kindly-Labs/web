// ============================================================================
// Media Session Manager
// ============================================================================

import type { Logger, MediaSessionMetadata } from './types';

const noopLogger: Logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};

export interface MediaSessionHandlers {
  onPlay: () => Promise<void>;
  onPause: () => Promise<void>;
  onStop: () => void;
}

export interface MediaSessionManagerConfig {
  handlers: MediaSessionHandlers;
  metadata?: MediaSessionMetadata;
  logger?: Logger;
}

export class MediaSessionManager {
  private logger: Logger;
  private metadata: MediaSessionMetadata;

  constructor(config: MediaSessionManagerConfig) {
    this.logger = config.logger ?? noopLogger;
    this.metadata = config.metadata ?? {
      title: 'Aether',
      artist: 'Voice Companion',
      artwork: [{ src: '/icons/globe.svg', sizes: '512x512', type: 'image/svg+xml' }],
    };

    this.setupHandlers(config.handlers);
  }

  private setupHandlers(handlers: MediaSessionHandlers) {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
      return;
    }

    navigator.mediaSession.setActionHandler('play', async () => {
      this.logger.info('AUDIO', 'MediaSession: Play');
      await handlers.onPlay();
    });

    navigator.mediaSession.setActionHandler('pause', async () => {
      this.logger.info('AUDIO', 'MediaSession: Pause');
      await handlers.onPause();
    });

    navigator.mediaSession.setActionHandler('stop', () => {
      this.logger.info('AUDIO', 'MediaSession: Stop');
      handlers.onStop();
    });
  }

  public updatePlaybackState(isPlaying: boolean) {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
      return;
    }

    if (isPlaying) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: this.metadata.title,
        artist: this.metadata.artist,
        artwork: this.metadata.artwork?.map((art) => ({
          src: art.src,
          sizes: art.sizes,
          type: art.type,
        })),
      });
      navigator.mediaSession.playbackState = 'playing';
    } else {
      navigator.mediaSession.playbackState = 'paused';
    }
  }

  public setMetadata(metadata: MediaSessionMetadata) {
    this.metadata = metadata;
  }
}

// Factory function
export function createMediaSessionManager(config: MediaSessionManagerConfig): MediaSessionManager {
  return new MediaSessionManager(config);
}
