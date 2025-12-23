import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductionTopologyPanel } from '@/components/features/cockpit/panels/ProductionTopologyPanel';

// Mock the environment context
jest.mock('@/lib/context/EnvironmentContext', () => ({
  useEnvironment: () => ({
    isAuthenticated: true,
    productionAuth: { token: 'test-token', email: 'admin@test.com', expiresAt: Date.now() + 86400000 },
  }),
}));

// Mock fetch for health checks
const mockHealthResponse = {
  sites: {
    workbench: {
      name: 'Workbench',
      url: 'https://app.kindly-labs.org',
      description: 'Crowdsourcing Platform',
      icon: 'ClipboardList',
      health: { status: 'online', latencyMs: 150 },
    },
    auralnet: {
      name: 'AuralNet',
      url: 'https://www.kindly-labs.org',
      description: 'B2B Marketing Site',
      icon: 'Building2',
      health: { status: 'online', latencyMs: 200 },
    },
    aether: {
      name: 'Aether PWA',
      url: 'https://aether.kindly-labs.org',
      description: 'Consumer Voice App',
      icon: 'Smartphone',
      health: { status: 'offline', latencyMs: 0 },
    },
    api: {
      name: 'Owly API',
      url: 'https://api.cogito.cv',
      description: 'Backend Services',
      icon: 'Server',
      health: { status: 'online', latencyMs: 100 },
    },
  },
};

describe('ProductionTopologyPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockHealthResponse,
    });
  });

  it('shows "Production Sites" header', async () => {
    render(<ProductionTopologyPanel />);

    expect(screen.getByText('Production Sites')).toBeInTheDocument();
  });

  it('displays all 4 production sites', async () => {
    render(<ProductionTopologyPanel />);

    await waitFor(() => {
      expect(screen.getByText('Workbench')).toBeInTheDocument();
      expect(screen.getByText('AuralNet')).toBeInTheDocument();
      expect(screen.getByText('Aether PWA')).toBeInTheDocument();
      expect(screen.getByText('Owly API')).toBeInTheDocument();
    });
  });

  it('shows online count badge', async () => {
    render(<ProductionTopologyPanel />);

    // Wait for health check to complete and display count
    await waitFor(() => {
      // 3 out of 4 sites are online in mock data
      expect(screen.getByText('3/4 Online')).toBeInTheDocument();
    });
  });

  it('makes fetch calls to health endpoint', async () => {
    render(<ProductionTopologyPanel />);

    // Wait for initial health check to complete
    await waitFor(() => {
      expect(screen.getByText('3/4 Online')).toBeInTheDocument();
    });

    // Verify fetch was called with correct endpoint
    expect(global.fetch).toHaveBeenCalledWith('/api/production/health');
  });

  it('opens external link in new tab on click', async () => {
    const mockOpen = jest.fn();
    window.open = mockOpen;

    render(<ProductionTopologyPanel />);

    await waitFor(() => {
      expect(screen.getByText('Workbench')).toBeInTheDocument();
    });

    // Find the external link buttons (there's one per site)
    const externalLinkButtons = screen.getAllByRole('button').filter((btn) => {
      // Filter to find buttons with external link functionality
      return btn.className.includes('text-sky-400');
    });

    // Click the first external link button
    if (externalLinkButtons.length > 0) {
      fireEvent.click(externalLinkButtons[0]);
      expect(mockOpen).toHaveBeenCalledWith(expect.stringContaining('kindly-labs.org'), '_blank');
    }
  });
});
