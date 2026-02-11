import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import prettierConfig from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'
import prettierPlugin from 'eslint-plugin-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.react,
      importPlugin.flatConfigs.typescript,
    ],
    plugins: {
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      ...prettierConfig.rules,

      // Prettier
      'prettier/prettier': 'error',

      // Import plugin
      'import/order': [
        'error',
        {
          groups: [
            'builtin', // Node.js built-in modules
            'external', // External packages
            'internal', // Internal modules (using path mapping)
            'parent', // Parent directories
            'sibling', // Same directory
            'index', // Index files
          ],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'never',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'import/no-unused-modules': 'warn',
      'import/no-cycle': ['error', { maxDepth: 5 }],
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': 'error',
      'import/no-unresolved': 'off', // TypeScript handles this
    },
  },
])
