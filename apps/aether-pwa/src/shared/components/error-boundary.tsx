'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/shared/lib/logger';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('APP', 'Uncaught error in UI', {
      error,
      componentStack: errorInfo.componentStack,
    });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex h-[100dvh] flex-col items-center justify-center bg-stone-950 p-4 text-center text-stone-200">
          <div className="glass-panel max-w-md space-y-4 p-8">
            <h2 className="text-2xl font-light text-rose-400">Something went wrong</h2>
            <p className="text-stone-400">
              Aether encountered an unexpected error. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full bg-stone-800 px-6 py-2 transition-colors hover:bg-stone-700"
            >
              Reload Aether
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="mt-4 max-h-32 overflow-auto rounded bg-black/50 p-2 text-left text-xs">
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
