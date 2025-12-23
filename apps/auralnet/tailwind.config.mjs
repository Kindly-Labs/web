/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Aether "Holographic Midnight" Theme
        background: 'oklch(0.05 0.02 260)',
        foreground: 'oklch(0.98 0.01 240)',

        // Glass Panels
        card: 'oklch(0.1 0.03 260 / 0.4)',
        'card-foreground': 'oklch(0.98 0.01 240)',

        // Accents
        primary: 'oklch(0.6 0.2 230)', // Electric Cyan
        'primary-foreground': 'oklch(0.98 0.01 240)',
        secondary: 'oklch(0.2 0.05 280)', // Deep Purple
        'secondary-foreground': 'oklch(0.9 0.05 280)',

        // Text
        muted: 'oklch(0.2 0.02 260)',
        'muted-foreground': 'oklch(0.7 0.05 260)',

        // Semantic
        accent: 'oklch(0.3 0.1 230)',
        'accent-foreground': 'oklch(0.98 0.01 240)',
        destructive: 'oklch(0.6 0.2 20)',

        // Borders
        border: 'oklch(1 0 0 / 0.08)',
        input: 'oklch(1 0 0 / 0.08)',
        ring: 'oklch(0.6 0.2 230 / 0.5)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Menlo', 'monospace'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        breathe: 'breathe 4s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite',
        'aurora-float': 'aurora-float 25s ease-in-out infinite alternate',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.03)', opacity: '1' },
        },
        glow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'aurora-float': {
          '0%': { transform: 'translate(0, 0) rotate(0deg) scale(1)' },
          '33%': { transform: 'translate(5%, 10%) rotate(5deg) scale(1.1)' },
          '66%': { transform: 'translate(-5%, 5%) rotate(-5deg) scale(0.95)' },
          '100%': { transform: 'translate(0, 0) rotate(0deg) scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
