// ============================================================================
// Audio Player - Queue-based Audio Playback
// ============================================================================

import { MediaSessionManager, createMediaSessionManager } from './media-session';
import type { Logger, QueueItem } from './types';

const noopLogger: Logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};

export interface AudioPlayerConfig {
  logger?: Logger;
  mediaMetadata?: {
    title: string;
    artist: string;
    artwork?: { src: string; sizes: string; type: string }[];
  };
}

export class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private queue: QueueItem[] = [];
  private isPlaying = false;
  private currentSource: AudioBufferSourceNode | null = null;
  private mediaSession: MediaSessionManager;
  private logger: Logger;

  constructor(config: AudioPlayerConfig = {}) {
    this.logger = config.logger ?? noopLogger;

    this.mediaSession = createMediaSessionManager({
      handlers: {
        onPlay: async () => this.resume(),
        onPause: async () => {
          if (this.audioContext) await this.audioContext.suspend();
        },
        onStop: () => this.stop(),
      },
      metadata: config.mediaMetadata,
      logger: this.logger,
    });
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioContextClass();

      // Monitor state changes (interruption recovery)
      this.audioContext.onstatechange = () => {
        this.logger.info('AUDIO', `Context state changed to: ${this.audioContext?.state}`);
      };
    }
    return this.audioContext;
  }

  public async decodeAudioData(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    const ctx = this.getAudioContext();
    return ctx.decodeAudioData(arrayBuffer);
  }

  public async resume(): Promise<void> {
    const ctx = this.getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    // Unlock iOS Audio: Play a short silent buffer
    try {
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch (e) {
      this.logger.debug('AUDIO', 'Silent unlock failed (non-fatal)', e);
    }
  }

  /**
   * Queues audio for playback.
   * Returns a promise that resolves when playback finishes.
   */
  public async play(
    audioData: Float32Array,
    sampleRate: number,
    options?: { onStart?: (duration: number) => void }
  ): Promise<void> {
    const duration = audioData.length / sampleRate;
    this.logger.debug(
      'AUDIO_PLAYER',
      `Queuing audio. Queue length: ${this.queue.length + 1}, duration: ${duration.toFixed(2)}s`
    );

    this.mediaSession.updatePlaybackState(true);

    return new Promise((resolve, reject) => {
      this.queue.push({
        audioData,
        sampleRate,
        resolve,
        reject,
        onStart: options?.onStart,
        duration,
      });
      this.processQueue();
    });
  }

  public async playFromUrl(
    url: string,
    options?: { onStart?: (text?: string, duration?: number) => void }
  ): Promise<void> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const transcriptHeader = response.headers.get('X-Aether-Transcript');
      const transcript = transcriptHeader ? decodeURIComponent(transcriptHeader) : undefined;

      const audioData = await response.arrayBuffer();
      const ctx = this.getAudioContext();
      const audioBuffer = await ctx.decodeAudioData(audioData);
      const float32Data = audioBuffer.getChannelData(0);

      return this.play(float32Data, audioBuffer.sampleRate, {
        onStart: (duration) => {
          if (options?.onStart) {
            options.onStart(transcript, duration);
          }
        },
      });
    } catch (error) {
      this.logger.error('AUDIO_PLAYER', `Failed to play from url: ${url}`, error);
    }
  }

  private async processQueue() {
    if (this.isPlaying || this.queue.length === 0) return;

    this.isPlaying = true;
    const item = this.queue[0];

    try {
      const ctx = this.getAudioContext();
      await this.resume();

      const buffer = ctx.createBuffer(1, item.audioData.length, item.sampleRate);
      buffer.copyToChannel(new Float32Array(item.audioData), 0);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      this.currentSource = source;

      if (item.onStart) {
        this.logger.debug(
          'AUDIO_PLAYER',
          `Triggering onStart callback with duration: ${item.duration.toFixed(2)}s`
        );
        item.onStart(item.duration);
      }

      source.onended = () => {
        // Cleanup
        try {
          if (this.currentSource) {
            this.currentSource.disconnect();
            this.currentSource.buffer = null;
          }
        } catch (e) {
          this.logger.warn('AUDIO', 'Error disconnecting source', e);
        }

        this.currentSource = null;
        this.isPlaying = false;

        const finishedItem = this.queue.shift();
        if (finishedItem) {
          finishedItem.audioData = new Float32Array(0);
        }

        if (this.queue.length === 0) {
          this.mediaSession.updatePlaybackState(false);
        }

        item.resolve();
        this.processQueue();
      };

      source.start();
    } catch (error) {
      this.logger.error('AUDIO_PLAYER', 'Failed to play audio', error);
      this.currentSource = null;
      this.isPlaying = false;
      this.queue.shift();
      item.reject(error);
      this.processQueue();
    }
  }

  public stop(): void {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch {
        // Ignore if already stopped
      }
      this.currentSource = null;
    }

    // Clear queue and resolve pending promises
    this.queue.forEach((item) => item.resolve());
    this.queue = [];
    this.isPlaying = false;
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  public isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }
}

// Factory function
export function createAudioPlayer(config?: AudioPlayerConfig): AudioPlayer {
  return new AudioPlayer(config);
}
