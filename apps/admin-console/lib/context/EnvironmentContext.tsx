'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { type Environment, PRODUCTION_CONFIG, checkProductionHealth, detectEnvironment } from '../environment';

interface ProductionAuth {
  token: string;
  email: string;
  expiresAt: number;
}

interface ProductionHealth {
  status: 'checking' | 'healthy' | 'degraded' | 'offline';
  latencyMs: number;
  lastChecked: Date | null;
  error?: string;
}

interface EnvironmentContextValue {
  // Current environment
  environment: Environment;
  setEnvironment: (env: Environment) => void;

  // Production authentication
  productionAuth: ProductionAuth | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  // Production health
  productionHealth: ProductionHealth;
  checkHealth: () => Promise<void>;

  // Helper getters
  apiBaseUrl: string;
  adminEndpoint: string;
  getAuthHeaders: () => Record<string, string>;
}

const EnvironmentContext = createContext<EnvironmentContextValue | null>(null);

const STORAGE_KEY_ENV = 'aether-console-environment';
const STORAGE_KEY_AUTH = 'aether-console-prod-auth';

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  // Auto-detect environment from NEXT_PUBLIC_BACKEND_URL, can be overridden by user
  const [environment, setEnvironmentState] = useState<Environment>(() => detectEnvironment());
  const [productionAuth, setProductionAuth] = useState<ProductionAuth | null>(null);
  const [productionHealth, setProductionHealth] = useState<ProductionHealth>({
    status: 'checking',
    latencyMs: 0,
    lastChecked: null,
  });

  // Safe localStorage helper
  const safeLocalStorage = {
    getItem: (key: string): string | null => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: (key: string, value: string): void => {
      try {
        localStorage.setItem(key, value);
      } catch {
        // Storage full or unavailable - silently fail
      }
    },
    removeItem: (key: string): void => {
      try {
        localStorage.removeItem(key);
      } catch {
        // Storage unavailable - silently fail
      }
    },
  };

  // Load persisted state on mount
  useEffect(() => {
    // Only use localStorage override if user explicitly set it (don't override auto-detection)
    // This allows user to manually switch environments if needed
    const savedEnv = safeLocalStorage.getItem(STORAGE_KEY_ENV);
    const detected = detectEnvironment();

    // If saved env exists and differs from detected, user has manually overridden
    if (savedEnv === 'production' || savedEnv === 'local') {
      // Only apply saved if it was a manual override (detected != saved)
      // or if we want to always respect saved (current behavior)
      setEnvironmentState(savedEnv);
    } else {
      // No saved preference, use detected and save it
      safeLocalStorage.setItem(STORAGE_KEY_ENV, detected);
    }

    const savedAuth = safeLocalStorage.getItem(STORAGE_KEY_AUTH);
    if (savedAuth) {
      try {
        const auth = JSON.parse(savedAuth) as ProductionAuth;
        // Check if token is still valid (with 5 minute buffer)
        if (auth.expiresAt > Date.now() + 5 * 60 * 1000) {
          setProductionAuth(auth);
        } else {
          safeLocalStorage.removeItem(STORAGE_KEY_AUTH);
        }
      } catch {
        safeLocalStorage.removeItem(STORAGE_KEY_AUTH);
      }
    }
  }, []);

  // Check production health periodically when in production mode
  const checkHealth = useCallback(async () => {
    setProductionHealth((prev) => ({ ...prev, status: 'checking' }));

    const result = await checkProductionHealth();

    setProductionHealth({
      status: result.healthy
        ? 'healthy'
        : result.error === 'Request timeout'
          ? 'degraded'
          : 'offline',
      latencyMs: result.latencyMs,
      lastChecked: new Date(),
      error: result.error,
    });
  }, []);

  useEffect(() => {
    if (environment === 'production') {
      checkHealth();
      const interval = setInterval(checkHealth, 30000); // Check every 30s
      return () => clearInterval(interval);
    }
  }, [environment, checkHealth]);

  // Set environment with persistence
  const setEnvironment = useCallback((env: Environment) => {
    setEnvironmentState(env);
    safeLocalStorage.setItem(STORAGE_KEY_ENV, env);
  }, []);

  // Login to production API
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/production/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        return { success: false, error: data.error || 'Authentication failed' };
      }

      const data = await response.json();
      const auth: ProductionAuth = {
        token: data.token,
        email: data.email,
        expiresAt: data.expiresAt,
      };

      setProductionAuth(auth);
      safeLocalStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(auth));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    setProductionAuth(null);
    safeLocalStorage.removeItem(STORAGE_KEY_AUTH);
  }, []);

  // Get auth headers for API requests
  const getAuthHeaders = useCallback((): Record<string, string> => {
    if (environment === 'production' && productionAuth) {
      return {
        Authorization: `Bearer ${productionAuth.token}`,
      };
    }
    // Local mode uses basic auth via API routes
    return {};
  }, [environment, productionAuth]);

  const value: EnvironmentContextValue = {
    environment,
    setEnvironment,
    productionAuth,
    isAuthenticated: environment === 'local' || (environment === 'production' && !!productionAuth),
    login,
    logout,
    productionHealth,
    checkHealth,
    apiBaseUrl: environment === 'production' ? PRODUCTION_CONFIG.api.baseUrl : 'http://localhost:3002',
    adminEndpoint: environment === 'production' ? PRODUCTION_CONFIG.api.adminEndpoint : '/admin/api',
    getAuthHeaders,
  };

  return <EnvironmentContext.Provider value={value}>{children}</EnvironmentContext.Provider>;
}

export function useEnvironment() {
  const context = useContext(EnvironmentContext);
  if (!context) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
}
