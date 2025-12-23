// ============================================================================
// Voice Utils Types
// ============================================================================

export type PermissionStatus = 'idle' | 'pending' | 'granted' | 'denied';

export interface Logger {
  info: (category: string, message: string, data?: unknown) => void;
  warn: (category: string, message: string, error?: unknown) => void;
  error: (category: string, message: string, data?: unknown, stack?: string) => void;
  debug: (category: string, message: string, data?: unknown) => void;
}

export interface MediaSessionMetadata {
  title: string;
  artist: string;
  artwork?: { src: string; sizes: string; type: string }[];
}

export interface AudioPlayerOptions {
  logger?: Logger;
  onStart?: (duration: number) => void;
}

export interface QueueItem {
  audioData: Float32Array;
  sampleRate: number;
  resolve: () => void;
  reject: (err: unknown) => void;
  onStart?: (duration: number) => void;
  duration: number;
}
