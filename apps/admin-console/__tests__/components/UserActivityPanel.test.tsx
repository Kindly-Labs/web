import React from 'react';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { UserActivityPanel } from '@/components/features/cockpit/panels/UserActivityPanel';
import {
  createMockSessions,
  createMockReviewQueue,
  createMockReviewItem,
} from '../utils/mock-generators';
import type { CockpitSessions, ReviewQueue } from '@/lib/cockpit-types';

describe('UserActivityPanel', () => {
  // Generate fresh random data for each test
  const createTestData = () => ({
    sessions: createMockSessions(5),
    reviewQueue: createMockReviewQueue(3, 2, 1),
  });

  describe('Header and Tabs', () => {
    it('renders panel header with "User Activity" title', () => {
      const { sessions } = createTestData();
      render(<UserActivityPanel sessions={sessions} />);

      expect(screen.getByText('User Activity')).toBeInTheDocument();
    });

    it('renders Sessions and Review Queue tabs', () => {
      const { sessions } = createTestData();
      render(<UserActivityPanel sessions={sessions} />);

      expect(screen.getByRole('button', { name: /Sessions/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Review Queue/i })).toBeInTheDocument();
    });

    it('defaults to Sessions tab active', () => {
      const { sessions } = createTestData();
      render(<UserActivityPanel sessions={sessions} />);

      const sessionsTab = screen.getByRole('button', { name: /Sessions/i });
      expect(sessionsTab).toHaveClass('bg-amber-500/20');
    });

    it('shows pending count badge on Review Queue tab when items pending', () => {
      const { sessions, reviewQueue } = createTestData();
      render(<UserActivityPanel sessions={sessions} reviewQueue={reviewQueue} />);

      expect(screen.getByText(reviewQueue.pending.toString())).toBeInTheDocument();
    });

    it('does not show badge when no pending items', () => {
      const { sessions } = createTestData();
      const emptyQueue: ReviewQueue = {
        pending: 0,
        verified: 5,
        flagged: 0,
        items: [],
      };
      render(<UserActivityPanel sessions={sessions} reviewQueue={emptyQueue} />);

      // The badge should not be present (no "0" in a badge)
      const reviewTab = screen.getByRole('button', { name: /Review Queue/i });
      expect(reviewTab.querySelector('.bg-red-500')).not.toBeInTheDocument();
    });
  });

  describe('Sessions Tab', () => {
    it('displays active session count from mock data', () => {
      const { sessions } = createTestData();
      render(<UserActivityPanel sessions={sessions} />);

      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText(sessions.active.toString())).toBeInTheDocument();
    });

    it('displays today total from mock data', () => {
      const { sessions } = createTestData();
      render(<UserActivityPanel sessions={sessions} />);

      expect(screen.getByText('Today')).toBeInTheDocument();
      expect(screen.getByText(sessions.todayTotal.toString())).toBeInTheDocument();
    });

    it('renders recent sessions list header', () => {
      const { sessions } = createTestData();
      render(<UserActivityPanel sessions={sessions} />);

      expect(screen.getByText('Recent Sessions')).toBeInTheDocument();
    });

    it('renders recent sessions with truncated IDs', () => {
      const { sessions } = createTestData();
      render(<UserActivityPanel sessions={sessions} />);

      sessions.recentSessions.forEach((session) => {
        const truncatedId = `${session.id.slice(0, 8)}...`;
        expect(screen.getByText(truncatedId)).toBeInTheDocument();
      });
    });

    it('shows message count for each session', () => {
      const { sessions } = createTestData();
      render(<UserActivityPanel sessions={sessions} />);

      sessions.recentSessions.forEach((session) => {
        expect(screen.getByText(session.messageCount.toString())).toBeInTheDocument();
      });
    });

    it('shows language badge when session has language', () => {
      const sessions = createMockSessions(1);
      sessions.recentSessions[0].language = 'toi';

      render(<UserActivityPanel sessions={sessions} />);

      expect(screen.getByText('toi')).toBeInTheDocument();
    });

    it('shows "No recent sessions" when list is empty', () => {
      const sessions: CockpitSessions = {
        active: 0,
        todayTotal: 0,
        recentSessions: [],
      };

      render(<UserActivityPanel sessions={sessions} />);

      expect(screen.getByText('No recent sessions')).toBeInTheDocument();
    });

    it('shows green status dot for active sessions', () => {
      const sessions = createMockSessions(1);
      sessions.recentSessions[0].status = 'active';

      render(<UserActivityPanel sessions={sessions} />);

      // Find the status dot container
      const sessionRow = screen
        .getByText(`${sessions.recentSessions[0].id.slice(0, 8)}...`)
        .closest('div');
      const statusDot = sessionRow?.querySelector('.bg-emerald-500');
      expect(statusDot).toBeInTheDocument();
    });

    it('shows gray status dot for inactive sessions', () => {
      const sessions = createMockSessions(1);
      sessions.recentSessions[0].status = 'inactive';

      render(<UserActivityPanel sessions={sessions} />);

      const sessionRow = screen
        .getByText(`${sessions.recentSessions[0].id.slice(0, 8)}...`)
        .closest('div');
      const statusDot = sessionRow?.querySelector('.bg-slate-500');
      expect(statusDot).toBeInTheDocument();
    });
  });

  describe('Review Queue Tab', () => {
    it('switches to Review Queue tab on click', async () => {
      const { sessions, reviewQueue } = createTestData();
      render(<UserActivityPanel sessions={sessions} reviewQueue={reviewQueue} />);

      fireEvent.click(screen.getByRole('button', { name: /Review Queue/i }));

      await waitFor(() => {
        expect(screen.getByText('Pending Review')).toBeInTheDocument();
      });
    });

    it('displays queue stats labels', async () => {
      const { sessions, reviewQueue } = createTestData();
      render(<UserActivityPanel sessions={sessions} reviewQueue={reviewQueue} />);

      fireEvent.click(screen.getByRole('button', { name: /Review Queue/i }));

      await waitFor(() => {
        expect(screen.getByText('Pending')).toBeInTheDocument();
        expect(screen.getByText('Verified')).toBeInTheDocument();
        expect(screen.getByText('Flagged')).toBeInTheDocument();
      });
    });

    it('displays pending count from mock data', async () => {
      const reviewQueue = createMockReviewQueue(7, 3, 2);
      render(<UserActivityPanel sessions={null} reviewQueue={reviewQueue} />);

      fireEvent.click(screen.getByRole('button', { name: /Review Queue/i }));

      await waitFor(() => {
        // Find the Pending stat box and verify its value
        const pendingLabel = screen.getByText('Pending');
        const pendingValue = pendingLabel.parentElement?.querySelector('div.text-lg.font-mono');
        expect(pendingValue).toHaveTextContent('7');
      });
    });

    it('displays verified count from mock data', async () => {
      const reviewQueue = createMockReviewQueue(2, 15, 1);
      render(<UserActivityPanel sessions={null} reviewQueue={reviewQueue} />);

      fireEvent.click(screen.getByRole('button', { name: /Review Queue/i }));

      await waitFor(() => {
        const verifiedLabel = screen.getByText('Verified');
        const verifiedValue = verifiedLabel.parentElement?.querySelector('div.text-lg.font-mono');
        expect(verifiedValue).toHaveTextContent('15');
      });
    });

    it('displays flagged count from mock data', async () => {
      const reviewQueue = createMockReviewQueue(1, 2, 8);
      render(<UserActivityPanel sessions={null} reviewQueue={reviewQueue} />);

      fireEvent.click(screen.getByRole('button', { name: /Review Queue/i }));

      await waitFor(() => {
        const flaggedLabel = screen.getByText('Flagged');
        const flaggedValue = flaggedLabel.parentElement?.querySelector('div.text-lg.font-mono');
        expect(flaggedValue).toHaveTextContent('8');
      });
    });

    it('renders pending review items with truncated IDs', async () => {
      const reviewQueue = createMockReviewQueue(3, 0, 0);
      render(<UserActivityPanel sessions={null} reviewQueue={reviewQueue} />);

      fireEvent.click(screen.getByRole('button', { name: /Review Queue/i }));

      await waitFor(() => {
        const pendingItems = reviewQueue.items.filter((i) => i.status === 'pending');
        pendingItems.forEach((item) => {
          const truncatedId = item.id.slice(0, 12);
          expect(screen.getByText(truncatedId)).toBeInTheDocument();
        });
      });
    });

    it('shows play button for each item', async () => {
      const reviewQueue = createMockReviewQueue(2, 0, 0);
      render(<UserActivityPanel sessions={null} reviewQueue={reviewQueue} />);

      fireEvent.click(screen.getByRole('button', { name: /Review Queue/i }));

      await waitFor(() => {
        const playButtons = screen.getAllByTitle('Play audio');
        expect(playButtons.length).toBe(2);
      });
    });

    it('displays AI labels preview for each item', async () => {
      const reviewQueue = createMockReviewQueue(1, 0, 0);
      const item = reviewQueue.items[0];

      render(<UserActivityPanel sessions={null} reviewQueue={reviewQueue} />);

      fireEvent.click(screen.getByRole('button', { name: /Review Queue/i }));

      await waitFor(() => {
        // At least one AI label value should be visible
        const firstLabel = item.aiLabels[0];
        expect(screen.getByText(firstLabel.value)).toBeInTheDocument();
      });
    });

    it('expands item details on click', async () => {
      const reviewQueue = createMockReviewQueue(1, 0, 0);

      render(<UserActivityPanel sessions={null} reviewQueue={reviewQueue} />);

      fireEvent.click(screen.getByRole('button', { name: /Review Queue/i }));

      await waitFor(() => {
        expect(screen.getByText(reviewQueue.items[0].id.slice(0, 12))).toBeInTheDocument();
      });

      // Click to expand
      fireEvent.click(screen.getByText(reviewQueue.items[0].id.slice(0, 12)));

      await waitFor(() => {
        expect(screen.getByText('AI Labels')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Verify/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Flag/i })).toBeInTheDocument();
      });
    });

    it('collapses item details on second click', async () => {
      const reviewQueue = createMockReviewQueue(1, 0, 0);

      render(<UserActivityPanel sessions={null} reviewQueue={reviewQueue} />);

      fireEvent.click(screen.getByRole('button', { name: /Review Queue/i }));

      await waitFor(() => {
        expect(screen.getByText(reviewQueue.items[0].id.slice(0, 12))).toBeInTheDocument();
      });

      // Click to expand
      fireEvent.click(screen.getByText(reviewQueue.items[0].id.slice(0, 12)));

      await waitFor(() => {
        expect(screen.getByText('AI Labels')).toBeInTheDocument();
      });

      // Click again to collapse
      fireEvent.click(screen.getByText(reviewQueue.items[0].id.slice(0, 12)));

      await waitFor(() => {
        expect(screen.queryByText('AI Labels')).not.toBeInTheDocument();
      });
    });

    it('calls onVerifyItem when Verify button clicked', async () => {
      const reviewQueue = createMockReviewQueue(1, 0, 0);
      const onVerifyItem = jest.fn();

      render(
        <UserActivityPanel sessions={null} reviewQueue={reviewQueue} onVerifyItem={onVerifyItem} />
      );

      fireEvent.click(screen.getByRole('button', { name: /Review Queue/i }));

      await waitFor(() => {
        expect(screen.getByText(reviewQueue.items[0].id.slice(0, 12))).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(reviewQueue.items[0].id.slice(0, 12)));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Verify/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Verify/i }));

      expect(onVerifyItem).toHaveBeenCalledWith(reviewQueue.items[0].id);
    });

    it('calls onFlagItem when Flag button clicked', async () => {
      const reviewQueue = createMockReviewQueue(1, 0, 0);
      const onFlagItem = jest.fn();

      render(
        <UserActivityPanel sessions={null} reviewQueue={reviewQueue} onFlagItem={onFlagItem} />
      );

      fireEvent.click(screen.getByRole('button', { name: /Review Queue/i }));

      await waitFor(() => {
        expect(screen.getByText(reviewQueue.items[0].id.slice(0, 12))).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(reviewQueue.items[0].id.slice(0, 12)));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Flag/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Flag/i }));

      expect(onFlagItem).toHaveBeenCalledWith(reviewQueue.items[0].id);
    });

    it('shows empty state when no pending items', async () => {
      const reviewQueue: ReviewQueue = {
        pending: 0,
        verified: 5,
        flagged: 2,
        items: [],
      };

      render(<UserActivityPanel sessions={null} reviewQueue={reviewQueue} />);

      fireEvent.click(screen.getByRole('button', { name: /Review Queue/i }));

      await waitFor(() => {
        expect(screen.getByText('No items pending review')).toBeInTheDocument();
        expect(screen.getByText('All caught up!')).toBeInTheDocument();
      });
    });
  });

  describe('Loading and Error States', () => {
    it('renders gracefully with null sessions', () => {
      render(<UserActivityPanel sessions={null} />);

      // Should show 0 for active and today
      expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    });

    it('renders gracefully with null reviewQueue', () => {
      const { sessions } = createTestData();
      render(<UserActivityPanel sessions={sessions} reviewQueue={null} />);

      fireEvent.click(screen.getByRole('button', { name: /Review Queue/i }));

      // Should show 0 for all counts
      expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    });

    it('handles undefined reviewQueue items gracefully', () => {
      const reviewQueue: ReviewQueue = {
        pending: 0,
        verified: 0,
        flagged: 0,
        items: [],
      };

      render(<UserActivityPanel sessions={null} reviewQueue={reviewQueue} />);

      fireEvent.click(screen.getByRole('button', { name: /Review Queue/i }));

      // Should show empty state, not crash
      expect(screen.getByText('No items pending review')).toBeInTheDocument();
    });
  });

  describe('Data Integrity', () => {
    it('all displayed session values match mock data exactly', () => {
      const sessions = createMockSessions(3);
      render(<UserActivityPanel sessions={sessions} />);

      // Active count
      expect(screen.getByText(sessions.active.toString())).toBeInTheDocument();

      // Today total
      expect(screen.getByText(sessions.todayTotal.toString())).toBeInTheDocument();

      // Each session ID and message count
      sessions.recentSessions.forEach((session) => {
        expect(screen.getByText(`${session.id.slice(0, 8)}...`)).toBeInTheDocument();
        expect(screen.getByText(session.messageCount.toString())).toBeInTheDocument();
      });
    });

    it('review queue counts match mock data exactly', async () => {
      const reviewQueue = createMockReviewQueue(7, 12, 3);
      render(<UserActivityPanel sessions={null} reviewQueue={reviewQueue} />);

      fireEvent.click(screen.getByRole('button', { name: /Review Queue/i }));

      await waitFor(() => {
        // Find the stat boxes by their parent container
        // Use more specific selector to avoid matching icons (which also have color classes)
        const pendingLabel = screen.getByText('Pending');
        const pendingValue = pendingLabel.parentElement?.querySelector('div.text-lg.font-mono');
        expect(pendingValue).toHaveTextContent(reviewQueue.pending.toString());

        const verifiedLabel = screen.getByText('Verified');
        const verifiedValue = verifiedLabel.parentElement?.querySelector('div.text-lg.font-mono');
        expect(verifiedValue).toHaveTextContent(reviewQueue.verified.toString());

        const flaggedLabel = screen.getByText('Flagged');
        const flaggedValue = flaggedLabel.parentElement?.querySelector('div.text-lg.font-mono');
        expect(flaggedValue).toHaveTextContent(reviewQueue.flagged.toString());
      });
    });

    it('AI label values are not placeholders', async () => {
      const reviewQueue = createMockReviewQueue(1, 0, 0);
      const item = reviewQueue.items[0];

      render(<UserActivityPanel sessions={null} reviewQueue={reviewQueue} />);

      fireEvent.click(screen.getByRole('button', { name: /Review Queue/i }));

      await waitFor(() => {
        item.aiLabels.slice(0, 2).forEach((label) => {
          const labelElement = screen.getByText(label.value);
          expect(labelElement).toBeInTheDocument();
          expect(labelElement.textContent).not.toBe('--');
          expect(labelElement.textContent).not.toBe('N/A');
          expect(labelElement.textContent).not.toBe('');
        });
      });
    });
  });
});
