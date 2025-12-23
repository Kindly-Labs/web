import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { EnvironmentProvider, useEnvironment } from '@/lib/context/EnvironmentContext';

// Test component that exposes context values
function TestConsumer({ onMount }: { onMount?: (ctx: ReturnType<typeof useEnvironment>) => void }) {
  const ctx = useEnvironment();

  React.useEffect(() => {
    onMount?.(ctx);
  }, [ctx, onMount]);

  return (
    <div>
      <span data-testid="environment">{ctx.environment}</span>
      <span data-testid="is-authenticated">{ctx.isAuthenticated.toString()}</span>
      <span data-testid="has-auth">{ctx.productionAuth ? 'yes' : 'no'}</span>
    </div>
  );
}

describe('EnvironmentContext', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    // Mock fetch for any health checks
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  it('defaults to local environment', () => {
    render(
      <EnvironmentProvider>
        <TestConsumer />
      </EnvironmentProvider>
    );

    expect(screen.getByTestId('environment')).toHaveTextContent('local');
  });

  it('is authenticated by default in local mode', () => {
    render(
      <EnvironmentProvider>
        <TestConsumer />
      </EnvironmentProvider>
    );

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
  });

  it('stores auth token on successful login', async () => {
    const mockToken = 'test-jwt-token';
    const mockEmail = 'admin@kindly-labs.org';
    const mockExpiresAt = Date.now() + 86400000;

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        token: mockToken,
        email: mockEmail,
        expiresAt: mockExpiresAt,
      }),
    });

    let contextValue: ReturnType<typeof useEnvironment> | null = null;

    render(
      <EnvironmentProvider>
        <TestConsumer
          onMount={(ctx) => {
            contextValue = ctx;
          }}
        />
      </EnvironmentProvider>
    );

    // Perform login
    await act(async () => {
      const result = await contextValue!.login('admin@kindly-labs.org', 'password');
      expect(result.success).toBe(true);
    });

    // Verify auth was stored
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'aether-console-prod-auth',
      expect.stringContaining(mockToken)
    );
  });

  it('clears auth state on logout', async () => {
    let contextValue: ReturnType<typeof useEnvironment> | null = null;

    // Pre-set auth in localStorage
    localStorageMock.setItem(
      'aether-console-prod-auth',
      JSON.stringify({
        token: 'existing-token',
        email: 'admin@kindly-labs.org',
        expiresAt: Date.now() + 86400000,
      })
    );

    render(
      <EnvironmentProvider>
        <TestConsumer
          onMount={(ctx) => {
            contextValue = ctx;
          }}
        />
      </EnvironmentProvider>
    );

    // Wait for mount
    await waitFor(() => {
      expect(contextValue).not.toBeNull();
    });

    // Perform logout
    act(() => {
      contextValue!.logout();
    });

    // Verify auth was cleared
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('aether-console-prod-auth');
    expect(screen.getByTestId('has-auth')).toHaveTextContent('no');
  });
});
