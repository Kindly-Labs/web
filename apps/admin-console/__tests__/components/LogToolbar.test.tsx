import React from 'react';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { LogToolbar, LogToolbarRef } from '@/components/features/logs/LogToolbar';
import { createMockLogEntries, MockLogEntry } from '../utils/mock-generators';
import { LOG_PRESETS } from '@/lib/log-parser';
import type { LogLevel, LogCategory, LogPreset } from '@/lib/log-parser';

describe('LogToolbar', () => {
  // Create fresh randomized props for each test
  const createTestProps = () => {
    const mockLogs = createMockLogEntries(20);
    const uniqueServices = [...new Set(mockLogs.map((l) => l.service))];

    return {
      services: uniqueServices.length > 0 ? uniqueServices : ['backend', 'frontend'],
      activeServiceFilters: [] as string[],
      activeLevelFilters: [] as LogLevel[],
      activeCategoryFilters: [] as LogCategory[],
      searchQuery: '',
      filteredLogs: mockLogs as unknown as Parameters<typeof LogToolbar>[0]['filteredLogs'],
      activePreset: null as string | null,
      onServiceFilterToggle: jest.fn(),
      onLevelFilterToggle: jest.fn(),
      onCategoryFilterToggle: jest.fn(),
      onSearchChange: jest.fn(),
      onPresetChange: jest.fn(),
      onClear: jest.fn(),
    };
  };

  describe('Initial Render', () => {
    it('renders preset dropdown with "Custom" when no preset active', () => {
      const props = createTestProps();
      render(<LogToolbar {...props} />);

      expect(screen.getByText('Custom')).toBeInTheDocument();
    });

    it('renders "All Services" when no service filters active', () => {
      const props = createTestProps();
      render(<LogToolbar {...props} />);

      expect(screen.getByText('All Services')).toBeInTheDocument();
    });

    it('renders all filter pills (Errors, Warnings, Info, Business, HTTP, Lifecycle)', () => {
      const props = createTestProps();
      render(<LogToolbar {...props} />);

      expect(screen.getByText('Errors')).toBeInTheDocument();
      expect(screen.getByText('Warnings')).toBeInTheDocument();
      expect(screen.getByText('Info')).toBeInTheDocument();
      expect(screen.getByText('Business')).toBeInTheDocument();
      expect(screen.getByText('HTTP')).toBeInTheDocument();
      expect(screen.getByText('Lifecycle')).toBeInTheDocument();
    });

    it('renders search input with placeholder', () => {
      const props = createTestProps();
      render(<LogToolbar {...props} />);

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('renders copy, analyze, and clear buttons', () => {
      const props = createTestProps();
      render(<LogToolbar {...props} />);

      expect(screen.getByTitle('Copy logs')).toBeInTheDocument();
      expect(screen.getByTitle('Copy AI analysis prompt')).toBeInTheDocument();
      expect(screen.getByTitle('Clear logs')).toBeInTheDocument();
    });
  });

  describe('Preset Selection', () => {
    it('opens preset menu on click', async () => {
      const props = createTestProps();
      render(<LogToolbar {...props} />);

      fireEvent.click(screen.getByText('Custom'));

      await waitFor(() => {
        expect(screen.getByText('Smart')).toBeInTheDocument();
      });
    });

    it('calls onPresetChange with correct preset when selected', async () => {
      const props = createTestProps();
      render(<LogToolbar {...props} />);

      fireEvent.click(screen.getByText('Custom'));

      await waitFor(() => {
        expect(screen.getByText('Smart')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Smart'));

      expect(props.onPresetChange).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'smart', name: 'Smart' })
      );
    });

    it('displays active preset name when preset is set', () => {
      const props = createTestProps();
      props.activePreset = 'errors';

      render(<LogToolbar {...props} />);

      expect(screen.getByText('Errors Only')).toBeInTheDocument();
    });
  });

  describe('Service Filtering', () => {
    it('shows service count when filters are active', () => {
      const props = createTestProps();
      props.activeServiceFilters = ['backend', 'frontend'];

      render(<LogToolbar {...props} />);

      expect(screen.getByText('2 Services')).toBeInTheDocument();
    });

    it('opens service menu and lists available services', async () => {
      const props = createTestProps();
      props.services = ['backend', 'frontend', 'mlx'];

      render(<LogToolbar {...props} />);

      fireEvent.click(screen.getByText('All Services'));

      await waitFor(() => {
        // Services are lowercase in DOM but displayed uppercase via CSS
        expect(screen.getByText('backend')).toBeInTheDocument();
        expect(screen.getByText('frontend')).toBeInTheDocument();
        expect(screen.getByText('mlx')).toBeInTheDocument();
      });
    });

    it('excludes "control" service from menu', async () => {
      const props = createTestProps();
      props.services = ['backend', 'frontend', 'control'];

      render(<LogToolbar {...props} />);

      fireEvent.click(screen.getByText('All Services'));

      await waitFor(() => {
        expect(screen.getByText('backend')).toBeInTheDocument();
        expect(screen.getByText('frontend')).toBeInTheDocument();
        expect(screen.queryByText('control')).not.toBeInTheDocument();
      });
    });

    it('calls onServiceFilterToggle when service selected', async () => {
      const props = createTestProps();
      props.services = ['backend', 'frontend'];

      render(<LogToolbar {...props} />);

      fireEvent.click(screen.getByText('All Services'));

      await waitFor(() => {
        expect(screen.getByText('backend')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('backend'));

      expect(props.onServiceFilterToggle).toHaveBeenCalledWith('backend');
    });
  });

  describe('Level and Category Filters', () => {
    it('calls onLevelFilterToggle when Errors pill clicked', () => {
      const props = createTestProps();
      render(<LogToolbar {...props} />);

      fireEvent.click(screen.getByText('Errors'));

      expect(props.onLevelFilterToggle).toHaveBeenCalledWith('error');
    });

    it('calls onLevelFilterToggle when Warnings pill clicked', () => {
      const props = createTestProps();
      render(<LogToolbar {...props} />);

      fireEvent.click(screen.getByText('Warnings'));

      expect(props.onLevelFilterToggle).toHaveBeenCalledWith('warn');
    });

    it('calls onLevelFilterToggle when Info pill clicked', () => {
      const props = createTestProps();
      render(<LogToolbar {...props} />);

      fireEvent.click(screen.getByText('Info'));

      expect(props.onLevelFilterToggle).toHaveBeenCalledWith('info');
    });

    it('calls onCategoryFilterToggle when Business pill clicked', () => {
      const props = createTestProps();
      render(<LogToolbar {...props} />);

      fireEvent.click(screen.getByText('Business'));

      expect(props.onCategoryFilterToggle).toHaveBeenCalledWith('business');
    });

    it('calls onCategoryFilterToggle when HTTP pill clicked', () => {
      const props = createTestProps();
      render(<LogToolbar {...props} />);

      fireEvent.click(screen.getByText('HTTP'));

      expect(props.onCategoryFilterToggle).toHaveBeenCalledWith('http');
    });

    it('calls onCategoryFilterToggle when Lifecycle pill clicked', () => {
      const props = createTestProps();
      render(<LogToolbar {...props} />);

      fireEvent.click(screen.getByText('Lifecycle'));

      expect(props.onCategoryFilterToggle).toHaveBeenCalledWith('lifecycle');
    });

    it('shows active styling when level filter is active', () => {
      const props = createTestProps();
      props.activeLevelFilters = ['error'];

      render(<LogToolbar {...props} />);

      const errorButton = screen.getByText('Errors');
      expect(errorButton).toHaveClass('bg-red-500/20');
    });

    it('shows active styling when category filter is active', () => {
      const props = createTestProps();
      props.activeCategoryFilters = ['business'];

      render(<LogToolbar {...props} />);

      const businessButton = screen.getByText('Business');
      expect(businessButton).toHaveClass('bg-violet-500/20');
    });
  });

  describe('Search', () => {
    it('calls onSearchChange when typing in search input', () => {
      const props = createTestProps();
      render(<LogToolbar {...props} />);

      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'test query' } });

      expect(props.onSearchChange).toHaveBeenCalledWith('test query');
    });

    it('shows clear button when search has value', () => {
      const props = createTestProps();
      props.searchQuery = 'test';

      render(<LogToolbar {...props} />);

      const searchContainer = screen.getByPlaceholderText('Search...').parentElement;
      expect(searchContainer?.querySelector('button')).toBeInTheDocument();
    });

    it('clears search when X button clicked', () => {
      const props = createTestProps();
      props.searchQuery = 'test';

      render(<LogToolbar {...props} />);

      const searchContainer = screen.getByPlaceholderText('Search...').parentElement;
      const clearButton = searchContainer?.querySelector('button');

      if (clearButton) {
        fireEvent.click(clearButton);
        expect(props.onSearchChange).toHaveBeenCalledWith('');
      }
    });

    it('displays current search query value', () => {
      const props = createTestProps();
      props.searchQuery = 'my search';

      render(<LogToolbar {...props} />);

      const searchInput = screen.getByPlaceholderText('Search...') as HTMLInputElement;
      expect(searchInput.value).toBe('my search');
    });
  });

  describe('Action Buttons', () => {
    it('calls onClear when clear button clicked', () => {
      const props = createTestProps();
      render(<LogToolbar {...props} />);

      fireEvent.click(screen.getByTitle('Clear logs'));

      expect(props.onClear).toHaveBeenCalled();
    });

    it('copies logs to clipboard when copy button clicked', async () => {
      const props = createTestProps();
      render(<LogToolbar {...props} />);

      fireEvent.click(screen.getByTitle('Copy logs'));

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
      });
    });

    it('copies AI analysis prompt when analyze button clicked', async () => {
      const props = createTestProps();
      // Clear any previous clipboard mock calls
      (navigator.clipboard.writeText as jest.Mock).mockClear();

      render(<LogToolbar {...props} />);

      fireEvent.click(screen.getByTitle('Copy AI analysis prompt'));

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
        // Get the most recent call (in case there are multiple)
        const calls = (navigator.clipboard.writeText as jest.Mock).mock.calls;
        const lastCall = calls[calls.length - 1][0];
        expect(lastCall).toContain('--- LOGS END ---');
      });
    });
  });

  describe('Ref API', () => {
    it('exposes focusSearch method via ref', () => {
      const props = createTestProps();
      const ref = React.createRef<LogToolbarRef>();

      render(<LogToolbar {...props} ref={ref} />);

      expect(ref.current).toBeDefined();
      expect(typeof ref.current?.focusSearch).toBe('function');
    });

    it('focusSearch focuses the search input', () => {
      const props = createTestProps();
      const ref = React.createRef<LogToolbarRef>();

      render(<LogToolbar {...props} ref={ref} />);

      ref.current?.focusSearch();

      const searchInput = screen.getByPlaceholderText('Search...');
      expect(document.activeElement).toBe(searchInput);
    });
  });

  describe('Data Integrity', () => {
    it('does not display hardcoded placeholder values', () => {
      const props = createTestProps();
      render(<LogToolbar {...props} />);

      // Verify no placeholder text is shown
      expect(screen.queryByText('--')).not.toBeInTheDocument();
      expect(screen.queryByText('N/A')).not.toBeInTheDocument();
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });
});
