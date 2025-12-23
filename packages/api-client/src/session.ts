// ============================================================================
// Session API Client
// ============================================================================

import { BaseApiClient, ClientConfig } from './base-client';
import type { SessionStartResponse, VoiceStateResponse } from './types';

export interface SessionConfig extends ClientConfig {
  /**
   * Enable mock mode for testing/development without backend
   */
  mockMode?: boolean;
  /**
   * Logger function for debugging
   */
  logger?: {
    info: (category: string, message: string) => void;
    warn: (category: string, message: string, error?: unknown) => void;
    debug: (category: string, message: string) => void;
  };
}

export class SessionApiClient extends BaseApiClient {
  private mockMode: boolean;
  private logger?: SessionConfig['logger'];

  constructor(config: SessionConfig) {
    super(config);
    this.mockMode = config.mockMode ?? false;
    this.logger = config.logger;
  }

  /**
   * Make a request, with fallback to mock mode if backend unavailable
   */
  protected async requestWithFallback<T>(
    endpoint: string,
    options?: RequestInit,
    mockResponse?: T
  ): Promise<T> {
    // If explicitly in mock mode, return mock response
    if (this.mockMode && mockResponse !== undefined) {
      this.logger?.debug('API', `[MOCK] ${options?.method || 'GET'} ${endpoint}`);
      await this.mockDelay();
      return mockResponse;
    }

    try {
      return await this.request<T>(endpoint, options);
    } catch (error) {
      // Network error - return service unavailable indicator
      this.logger?.warn('API', 'Backend unavailable', error);

      // If mock response provided, use it as fallback
      if (mockResponse !== undefined) {
        return mockResponse;
      }

      throw error;
    }
  }

  private async mockDelay(min = 500, max = 1500): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  // ---------------------------------------------------------------------------
  // Session Management
  // ---------------------------------------------------------------------------

  async startSession(clientId: string): Promise<SessionStartResponse> {
    return this.requestWithFallback<SessionStartResponse>(
      '/session/start',
      {
        method: 'POST',
        body: JSON.stringify({ clientId }),
      },
      { status: 'connected', sessionId: 'mock-session-123', mode: 'mock' }
    );
  }

  async updateVoiceState(
    sessionId: string,
    state: 'listening' | 'speaking' | 'idle'
  ): Promise<VoiceStateResponse> {
    return this.requestWithFallback<VoiceStateResponse>(
      '/voice/state',
      {
        method: 'POST',
        body: JSON.stringify({ sessionId, state }),
      },
      { success: true }
    );
  }

  async endSession(sessionId: string): Promise<void> {
    await this.requestWithFallback<{ success: boolean }>(
      '/session/end',
      {
        method: 'POST',
        body: JSON.stringify({ sessionId }),
      },
      { success: true }
    );
  }

  // ---------------------------------------------------------------------------
  // Health Check
  // ---------------------------------------------------------------------------

  async checkHealth(): Promise<{
    status: string;
    db?: string;
    ai?: string;
    speech?: string;
  }> {
    return this.get('/health');
  }
}

// Factory function
export function createSessionClient(
  baseUrl: string,
  options?: Partial<SessionConfig>
): SessionApiClient {
  return new SessionApiClient({
    baseUrl,
    ...options,
  });
}
