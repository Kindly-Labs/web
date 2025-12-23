import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const sizes = {
  sm: 16,
  md: 24,
  lg: 32,
};

export function LoadingSpinner({
  size = 'md',
  color = 'currentColor',
  className = '',
}: LoadingSpinnerProps) {
  const dimension = sizes[size];

  return (
    <svg
      className={className}
      width={dimension}
      height={dimension}
      viewBox="0 0 24 24"
      fill="none"
      style={{
        animation: 'spin 1s linear infinite',
      }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="31.42 31.42"
        opacity="0.25"
      />
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="31.42 31.42"
        strokeDashoffset="62.84"
        style={{
          animation: 'dash 1.5s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes dash {
          0% { stroke-dashoffset: 62.84; }
          50% { stroke-dashoffset: 15.71; }
          100% { stroke-dashoffset: 62.84; }
        }
      `}</style>
    </svg>
  );
}
