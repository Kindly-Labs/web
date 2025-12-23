// ============================================================================
// Base API Client (inlined from @owly-labs/api-client)
// ============================================================================

import { ApiClientError } from './types';

export interface ClientConfig {
  baseUrl: string;
  onError?: (error: ApiClientError) => void;
  getHeaders?: () => Record<string, string>;
}

export class BaseApiClient {
  protected baseUrl: string;
  protected onError?: (error: ApiClientError) => void;
  protected getHeaders?: () => Record<string, string>;

  constructor(config: ClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.onError = config.onError;
    this.getHeaders = config.getHeaders;
  }

  protected getUrl(endpoint: string): string {
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${path}`;
  }

  protected async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = this.getUrl(endpoint);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.getHeaders?.() || {}),
      ...((options?.headers as Record<string, string>) || {}),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({
          message: `HTTP error: ${response.status}`,
        }));

        const error = new ApiClientError(
          errorBody.message || `Request failed: ${response.status}`,
          errorBody.code,
          response.status
        );

        this.onError?.(error);
        throw error;
      }

      return response.json();
    } catch (e) {
      if (e instanceof ApiClientError) {
        throw e;
      }

      // Network error
      const error = new ApiClientError(
        e instanceof Error ? e.message : 'Network error',
        'NETWORK_ERROR'
      );

      this.onError?.(error);
      throw error;
    }
  }

  protected async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  protected async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  protected async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  protected async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}
