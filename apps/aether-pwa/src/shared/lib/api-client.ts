/**
 * API Client - Bridge to @owly-labs/api-client
 *
 * This module provides backward-compatible static methods while using
 * the shared @owly-labs/api-client package under the hood.
 */

import { BaseApiClient } from '@owly-labs/api-client';
import { Env } from '@/shared/config/env';
import { logger } from '@/shared/lib/logger';

// Create a singleton client instance
let clientInstance: BaseApiClient | null = null;

function getClient(): BaseApiClient {
  if (!clientInstance) {
    const baseUrl = Env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) {
      throw new Error('NEXT_PUBLIC_API_URL is not defined. Please check your .env file.');
    }
    clientInstance = new BaseApiClient({
      baseUrl,
      onError: (error) => {
        logger.warn('API', `API Error: ${error.message}`, error);
      },
    });
  }
  return clientInstance;
}

export class ApiClient {
  private static get baseUrl() {
    if (!Env.NEXT_PUBLIC_API_URL) {
      throw new Error('NEXT_PUBLIC_API_URL is not defined. Please check your .env file.');
    }
    return Env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }

  private static getUrl(endpoint: string): string {
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${path}`;
  }

  private static async mockRequest(endpoint: string, init?: RequestInit): Promise<Response> {
    const method = init?.method || 'GET';
    const body = init?.body;

    console.groupCollapsed(
      `%c[MOCK API] ${method} ${endpoint}`,
      'color: #10b981; font-weight: bold;'
    );
    console.log('Endpoint:', endpoint);
    console.log('Method:', method);
    if (body) console.log('Body:', JSON.parse(body as string));
    console.log('Headers:', init?.headers);
    console.groupEnd();

    logger.info('API', `[MOCK] ${method} ${endpoint}`);

    const delay = Math.random() * 1000 + 500;
    await new Promise((resolve) => setTimeout(resolve, delay));

    let responseData = {};
    if (endpoint.includes('/session/start')) {
      responseData = { status: 'connected', sessionId: 'mock-session-123', mode: 'mock' };
    } else if (endpoint.includes('/voice/state')) {
      responseData = { success: true };
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  public static async fetch(endpoint: string, init?: RequestInit): Promise<Response> {
    const forceMock =
      typeof window !== 'undefined' &&
      (window as Window & { __FORCE_MOCK__?: boolean }).__FORCE_MOCK__;

    if (!forceMock) {
      try {
        const url = this.getUrl(endpoint);

        const response = await fetch(url, {
          ...init,
          headers: {
            'Content-Type': 'application/json',
            ...init?.headers,
          },
        });

        if (response.status < 500) {
          return response;
        }

        logger.warn('API', `Backend returned ${response.status}`);
        return response;
      } catch (e) {
        logger.warn('API', 'Backend unavailable', e);

        return new Response(JSON.stringify({ error: 'Service Unavailable', code: 'OFFLINE' }), {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return this.mockRequest(endpoint, init);
  }

  public static async post(
    endpoint: string,
    body: unknown,
    headers?: HeadersInit
  ): Promise<Response> {
    return this.fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  }
}

// Re-export types from the package for direct usage
export type { ApiClientError, ClientConfig } from '@owly-labs/api-client';
