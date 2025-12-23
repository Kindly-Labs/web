import '@testing-library/jest-dom';
import React from 'react';

// Mock matchMedia (required for framer-motion and responsive hooks)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn().mockResolvedValue(undefined),
    readText: jest.fn().mockResolvedValue(''),
  },
  writable: true,
});

// Mock ResizeObserver (required for recharts)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Filter out framer-motion specific props
const filterMotionProps = (props: Record<string, unknown>) => {
  const motionProps = [
    'whileHover',
    'whileTap',
    'whileFocus',
    'whileDrag',
    'whileInView',
    'initial',
    'animate',
    'exit',
    'transition',
    'variants',
    'onAnimationStart',
    'onAnimationComplete',
    'onUpdate',
    'layout',
    'layoutId',
    'drag',
    'dragConstraints',
    'dragElastic',
    'onDragStart',
    'onDragEnd',
    'onDrag',
  ];
  const filtered: Record<string, unknown> = {};
  for (const key of Object.keys(props)) {
    if (!motionProps.includes(key)) {
      filtered[key] = props[key];
    }
  }
  return filtered;
};

// Mock framer-motion to avoid animation timing issues in tests
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: React.forwardRef(
        (
          { children, ...props }: React.PropsWithChildren<Record<string, unknown>>,
          ref: React.Ref<HTMLDivElement>
        ) => (
          <div ref={ref as React.Ref<HTMLDivElement>} {...filterMotionProps(props)}>
            {children}
          </div>
        )
      ),
      button: React.forwardRef(
        (
          { children, ...props }: React.PropsWithChildren<Record<string, unknown>>,
          ref: React.Ref<HTMLButtonElement>
        ) => (
          <button ref={ref as React.Ref<HTMLButtonElement>} {...filterMotionProps(props)}>
            {children}
          </button>
        )
      ),
    },
    AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
  };
});

// Suppress console errors for expected test warnings
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    // Suppress React act() warnings that can occur in some async tests
    if (typeof args[0] === 'string' && args[0].includes('act(...)')) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
