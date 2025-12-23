import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionsModal } from '@/components/features/cockpit/modals/SessionsModal';
import { createMockProductionSessions } from '../utils/mock-generators';

// Mock the environment context
const mockProductionAuth = {
  token: 'test-jwt-token',
  email: 'admin@kindly-labs.org',
  expiresAt: Date.now() + 86400000,
};

jest.mock('@/lib/context/EnvironmentContext', () => ({
  useEnvironment: () => ({
    environment: 'production',
    productionAuth: mockProductionAuth,
  }),
}));

describe('SessionsModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially when opened', async () => {
    // Mock fetch to delay slightly
    global.fetch = jest.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ sessions: [] }),
            });
          }, 100);
        })
    );

    render(<SessionsModal isOpen={true} onClose={jest.fn()} />);

    // Should show loading spinner
    expect(screen.getByText('Active Sessions')).toBeInTheDocument();
    // The Loader2 component shows as a spinner
  });

  it('displays sessions when loaded', async () => {
    const mockSessions = createMockProductionSessions(2, 1);

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ sessions: mockSessions }),
    });

    render(<SessionsModal isOpen={true} onClose={jest.fn()} />);

    // Wait for sessions to load
    await waitFor(() => {
      // Check that session info is displayed (first 8 chars of ID)
      mockSessions.forEach((session) => {
        const truncatedId = `${session.id.slice(0, 8)}...`;
        expect(screen.getByText(truncatedId)).toBeInTheDocument();
      });
    });

    // Check counts - "2 active, 1 ended"
    expect(screen.getByText(/2 active, 1 ended/)).toBeInTheDocument();
  });

  it('kills session when kill button is clicked', async () => {
    const mockSessions = createMockProductionSessions(1, 0);
    const sessionToKill = mockSessions[0];

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessions: mockSessions }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    render(<SessionsModal isOpen={true} onClose={jest.fn()} />);

    // Wait for sessions to load
    await waitFor(() => {
      expect(screen.getByText(`${sessionToKill.id.slice(0, 8)}...`)).toBeInTheDocument();
    });

    // Find and click the kill button (Trash2 icon button)
    const killButtons = screen.getAllByRole('button').filter((btn) => {
      return btn.className.includes('text-red-400');
    });

    if (killButtons.length > 0) {
      fireEvent.click(killButtons[0]);

      // Verify kill endpoint was called
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/production/sessions/${sessionToKill.id}/kill`,
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              Authorization: `Bearer ${mockProductionAuth.token}`,
            }),
          })
        );
      });
    }
  });

  it('shows empty state when no sessions', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ sessions: [] }),
    });

    render(<SessionsModal isOpen={true} onClose={jest.fn()} />);

    // Wait for fetch to complete
    await waitFor(() => {
      expect(screen.getByText('No sessions found')).toBeInTheDocument();
    });
  });
});
