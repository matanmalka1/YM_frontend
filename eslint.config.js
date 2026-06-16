import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended, reactRefresh.configs.vite],
    plugins: {
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      ...jsxA11y.flatConfigs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'jsx-a11y/no-autofocus': 'off',
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        tsconfigRootDir,
      },
    },
  }, // Block A: features cannot deep-link into OTHER features' internals
  // (pages can import feature internals directly — they are composition shells)
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '*/features/*/components/*',
                '*/features/*/hooks/*',
                '*/features/*/schemas*',
                '*/features/*/types*',
                '*/features/*/utils*',
                '*/features/*/constants*',
                '*/features/*/api/*',
              ],
              message: 'Cross-feature deep-linking is forbidden. Import from the feature root index.ts barrel instead.',
            },
          ],
        },
      ],
    },
  }, // Block B: src/components/ui/ must be pure — no API or React Query imports
  {
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['*/api/*', '@/api/*'],
              message: 'Pure UI components cannot import from api/. Move logic to a feature hook or shared component.',
            },
            {
              group: ['@tanstack/react-query'],
              message: 'Pure UI components cannot use React Query. Move logic to a feature hook.',
            },
          ],
        },
      ],
    },
  },
])
