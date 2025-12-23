import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeployModal } from '@/components/features/cockpit/modals/DeployModal';

// Mock the environment context
const mockProductionAuth = {
  token: 'test-jwt-token',
  email: 'admin@kindly-labs.org',
  expiresAt: Date.now() + 86400000,
};

jest.mock('@/lib/context/EnvironmentContext', () => ({
  useEnvironment: () => ({
    productionAuth: mockProductionAuth,
    environment: 'production',
  }),
}));

describe('DeployModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  it('shows deploy warning and target info when open', () => {
    render(<DeployModal isOpen={true} onClose={jest.fn()} />);

    // Check for warning text
    expect(screen.getByText('Production Deployment')).toBeInTheDocument();
    expect(screen.getByText(/deploy the latest changes to api.cogito.cv/i)).toBeInTheDocument();

    // Check for target info
    expect(screen.getByText('Owly API Backend')).toBeInTheDocument();
    // Multiple elements contain api.cogito.cv, so use getAllByText
    const apiTexts = screen.getAllByText(/api.cogito.cv/);
    expect(apiTexts.length).toBeGreaterThan(0);
  });

  it('starts deployment when Deploy Now button is clicked', async () => {
    render(<DeployModal isOpen={true} onClose={jest.fn()} />);

    // Click deploy button
    fireEvent.click(screen.getByText('Deploy Now'));

    // Verify fetch was called with correct endpoint
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/production/deploy',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockProductionAuth.token}`,
          }),
        })
      );
    });
  });

  it('shows step progress during deployment', async () => {
    // Use fake timers for step progression
    jest.useFakeTimers();

    render(<DeployModal isOpen={true} onClose={jest.fn()} />);

    // Click deploy button
    fireEvent.click(screen.getByText('Deploy Now'));

    // Wait for steps to appear
    await waitFor(() => {
      expect(screen.getByText('Connecting to server')).toBeInTheDocument();
      expect(screen.getByText('Pulling latest changes')).toBeInTheDocument();
      expect(screen.getByText('Building application')).toBeInTheDocument();
      expect(screen.getByText('Restarting services')).toBeInTheDocument();
      expect(screen.getByText('Health check')).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('cannot close modal during deployment', async () => {
    const mockOnClose = jest.fn();

    render(<DeployModal isOpen={true} onClose={mockOnClose} />);

    // Start deployment
    fireEvent.click(screen.getByText('Deploy Now'));

    // Try to click cancel - it should be disabled
    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeDisabled();

    // Directly calling onClose shouldn't work during deploy
    // (the handler checks status)
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
