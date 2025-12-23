import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      transitionDuration: {
        instant: '75ms',
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
        emphasis: '700ms',
      },
      padding: {
        safe: 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      margin: {
        safe: 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      height: {
        safe: 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      animation: {
        breathe: 'breathe 4s ease-in-out infinite',
        ripple: 'ripple 2s linear infinite',
        'ripple-delayed': 'ripple 2s linear infinite 1s',
        'ripple-single': 'rippleSingle 800ms ease-out forwards',
        'gentle-spin': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slower': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        glow: 'glow 2s ease-in-out infinite',
        orbit: 'rotate 10s linear infinite',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        visualizer: 'visualizer 0.8s ease-in-out infinite',
        // Neural effects
        'particle-orbit': 'particleOrbit var(--orbit-duration, 10s) linear infinite',
        'particle-pulse': 'particlePulse 2s ease-in-out infinite',
        'pulse-glow': 'pulseGlow var(--pulse-duration, 3s) ease-out infinite',
        'orbital-spin': 'orbitalSpin var(--spin-duration, 15s) linear infinite',
        'core-breath': 'coreBreath var(--breath-duration, 4s) ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
        },
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        glow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        rotate: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        visualizer: {
          '0%, 100%': { height: '4px', opacity: '0.5' },
          '50%': { height: '24px', opacity: '1' },
        },
        rippleSingle: {
          '0%': { transform: 'scale(0.9)', opacity: '0.5', borderWidth: '2px' },
          '100%': { transform: 'scale(1.6)', opacity: '0', borderWidth: '1px' },
        },
        // Neural effect keyframes
        particleOrbit: {
          '0%': { transform: 'rotate(0deg) translateX(var(--orbit-radius, 120px)) rotate(0deg)' },
          '100%': {
            transform: 'rotate(360deg) translateX(var(--orbit-radius, 120px)) rotate(-360deg)',
          },
        },
        particlePulse: {
          '0%, 100%': { opacity: 'var(--base-opacity, 0.5)', transform: 'scale(1)' },
          '50%': { opacity: 'var(--peak-opacity, 0.7)', transform: 'scale(1.3)' },
        },
        pulseGlow: {
          '0%': { transform: 'scale(1)', opacity: 'var(--pulse-opacity, 0.3)' },
          '100%': { transform: 'scale(var(--pulse-scale, 1.5))', opacity: '0' },
        },
        orbitalSpin: {
          '0%': { transform: 'rotateX(var(--rx, 70deg)) rotateY(var(--ry, 0deg)) rotateZ(0deg)' },
          '100%': {
            transform: 'rotateX(var(--rx, 70deg)) rotateY(var(--ry, 0deg)) rotateZ(360deg)',
          },
        },
        coreBreath: {
          '0%, 100%': { opacity: 'var(--min-opacity, 0.4)', transform: 'scale(0.95)' },
          '50%': { opacity: 'var(--max-opacity, 0.8)', transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
