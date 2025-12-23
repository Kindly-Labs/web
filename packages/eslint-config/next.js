/**
 * @owly-labs/eslint-config/next
 *
 * ESLint configuration for Next.js projects.
 * Use Next.js built-in config and extend with our rules.
 */

const { FlatCompat } = require('@eslint/eslintrc');
const prettierConfig = require('eslint-config-prettier');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'coverage/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // Override Next.js defaults
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // React rules
      'react/jsx-key': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  prettierConfig,
];
