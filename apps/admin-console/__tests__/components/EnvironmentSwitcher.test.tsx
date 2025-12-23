import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EnvironmentSwitcher } from '@/components/features/cockpit/EnvironmentSwitcher';

// Mock useEnvironment hook for controlled testing
let mockEnvironment = 'local' as 'local' | 'production';
let mockProductionAuth: { token: string; email: string; expiresAt: number } | null = null;

const mockUseEnvironment = {
  get environment() {
    return mockEnvironment;
  },
  setEnvironment: jest.fn(),
  get isAuthenticated() {
    return mockEnvironment === 'local' || !!mockProductionAuth;
  },
  get productionAuth() {
    return mockProductionAuth;
  },
  productionHealth: { status: 'healthy' as const, latencyMs: 150, lastChecked: new Date() },
  login: jest.fn(),
  logout: jest.fn(),
  checkHealth: jest.fn(),
  apiBaseUrl: 'http://localhost:3002',
  adminEndpoint: '/admin/api',
  getAuthHeaders: jest.fn(() => ({})),
};

jest.mock('@/lib/context/EnvironmentContext', () => ({
  useEnvironment: () => mockUseEnvironment,
  EnvironmentProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('EnvironmentSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEnvironment = 'local';
    mockProductionAuth = null;
    mockUseEnvironment.productionHealth = { status: 'healthy', latencyMs: 150, lastChecked: new Date() };
  });

  it('shows "Local Dev" in local mode', () => {
    render(<EnvironmentSwitcher />);

    expect(screen.getByText('Local Dev')).toBeInTheDocument();
  });

  it('shows "Production" in production mode', () => {
    mockEnvironment = 'production';
    mockProductionAuth = {
      token: 'test-token',
      email: 'admin@kindly-labs.org',
      expiresAt: Date.now() + 86400000,
    };

    render(<EnvironmentSwitcher />);

    expect(screen.getByText('Production')).toBeInTheDocument();
  });

  it('opens dropdown on click', async () => {
    render(<EnvironmentSwitcher />);

    // Click the toggle button
    fireEvent.click(screen.getByText('Local Dev'));

    // Dropdown should show both options
    await waitFor(() => {
      expect(screen.getByText('Local Development')).toBeInTheDocument();
      expect(screen.getByText('Production')).toBeInTheDocument();
    });
  });

  it('switches to local mode when Local Development is clicked', async () => {
    mockEnvironment = 'production';
    mockProductionAuth = {
      token: 'test-token',
      email: 'admin@kindly-labs.org',
      expiresAt: Date.now() + 86400000,
    };

    render(<EnvironmentSwitcher />);

    // Open dropdown
    fireEvent.click(screen.getByText('Production'));

    await waitFor(() => {
      expect(screen.getByText('Local Development')).toBeInTheDocument();
    });

    // Click Local Development option
    fireEvent.click(screen.getByText('Local Development'));

    expect(mockUseEnvironment.setEnvironment).toHaveBeenCalledWith('local');
  });

  it('shows production health status when in production mode', async () => {
    mockEnvironment = 'production';
    mockProductionAuth = {
      token: 'test-token',
      email: 'admin@kindly-labs.org',
      expiresAt: Date.now() + 86400000,
    };
    mockUseEnvironment.productionHealth = { status: 'healthy', latencyMs: 150, lastChecked: new Date() };

    render(<EnvironmentSwitcher />);

    // Open dropdown
    fireEvent.click(screen.getByText('Production'));

    // Should show latency info
    await waitFor(() => {
      expect(screen.getByText('150ms latency')).toBeInTheDocument();
    });
  });
});
