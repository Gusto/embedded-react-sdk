// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook'

import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint, { Config } from 'typescript-eslint'
import pluginReact from 'eslint-plugin-react'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import importPlugin from 'eslint-plugin-import'
import reactRefresh from 'eslint-plugin-react-refresh'
import tsdoc from 'eslint-plugin-tsdoc'
import { tsdocCoverage } from './eslint-rules/plugins'

// Base paths for public library code
const LIBRARY_BASE_PATHS = ['src/**/*.{ts,tsx}']
// Paths within the library that can be ignored, as they have no public code
const LIBRARY_IGNORE_PATHS = [
  '**/*.stories.{ts,tsx}',
  '**/*.test.{ts,tsx}',
  '**/__fixtures__/**',
  'src/test/**/*.{ts,tsx}',
  'src/test-utils/**',
  'src/**/*test-utils.{ts,tsx}',
]

export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  pluginReact.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  pluginReact.configs.flat['jsx-runtime'],
  reactRefresh.configs.vite,
  {
    plugins: {
      'react-hooks': pluginReactHooks,
      import: importPlugin,
    },
    rules: {
      // Enforce a consistent order for imports
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'never',
        },
      ],
      'import/extensions': [
        'error',
        { js: 'never', svg: 'always', png: 'always', scss: 'always', json: 'always' },
      ],
      // Enable error for unused imports (and variables)
      '@typescript-eslint/no-unused-vars': ['error'],
      // Pin to the rules enforced by eslint-plugin-react-hooks < v7.
      // v7's "recommended" preset additionally turns on React Compiler rules
      // (refs, purity, set-state-in-effect, immutability, preserve-manual-memoization,
      // static-components, globals, incompatible-library, etc.) which flag 170+
      // pre-existing sites across the SDK. We intentionally keep the scope of this
      // upgrade limited to avoid regressions; the new compiler rules can be
      // adopted incrementally in follow-up PRs.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: [
      '**/*.config.*',
      '**/*.d.ts',
      '**/*.test.ts',
      '**/assets/',
      '**/build/',
      '**/coverage/',
      '**/dist/',
      '**/docs/',
      '**/e2e/',
      '**/eslint-rules/',
      '**/stylelint-rules/',
      '**/generated/**/*',
      '**/jest.setup.*',
      '**/.prettierrc.js',
      '.storybook/**/*',
      'storybook-static/**/*',
      'docs-site/**/*',
      'sdk-app/public/**/*',
    ],
  },
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'off', // TODO SDK-486: this override is load-bearing; removing it unmasked 35 violations across src/. Address in a dedicated cleanup PR.
      '@typescript-eslint/no-unnecessary-condition': ['error', { checkTypePredicates: true }],
      '@typescript-eslint/no-unnecessary-type-assertion': 'off', // TODO: fix instances; auto-fix in typescript-eslint 8.59 removes `as` casts that tsc still requires
      '@typescript-eslint/no-deprecated': 'off', // TODO: fix instances
      '@typescript-eslint/no-misused-promises': 'off', // TODO: fix instances
      '@typescript-eslint/no-non-null-assertion': 'off', // TODO: fix instances
      '@typescript-eslint/no-unsafe-argument': 'off', // TODO: fix instances
      '@typescript-eslint/no-unsafe-assignment': 'off', // TODO: fix instances
      '@typescript-eslint/no-unsafe-member-access': 'off', // TODO: fix instances
      '@typescript-eslint/no-unsafe-return': 'off', // TODO: fix instances
      '@typescript-eslint/no-unused-expressions': 'error',
      '@typescript-eslint/unified-signatures': 'error',
      'no-console': 'error',

      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-aria',
              message:
                'Use of react-aria is not allowed outside of the UI directory. If you need to use it, create a component in the UI directory that uses it instead and make it available via the useComponentContext hook.',
            },
            {
              name: 'react-aria-components',
              message:
                'Use of react-aria-components is not allowed outside of the UI directory. If you need to use it, create a component in the UI directory that uses it instead and make it available via the useComponentContext hook.',
            },
          ],
          patterns: [
            {
              regex: '.*\/UI\/(?!.*Types(\.ts)?$).*',
              message:
                "Please use the useComponentContext hook instead: import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext' and get the component from that hook.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/components/Common/UI/**/*.{ts,tsx}',
      'src/components/Common/DateRangeFilter/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    files: ['src/components/InformationRequests/InformationRequestForm/InformationRequestForm.tsx'],
    rules: {
      '@typescript-eslint/no-unnecessary-type-arguments': 'off',
    },
  },
  {
    plugins: { tsdoc, 'tsdoc-coverage': tsdocCoverage },
  },
  /** Library: baseline. All source code with a TSDoc comment should have valid syntax. */
  {
    files: LIBRARY_BASE_PATHS,
    ignores: LIBRARY_IGNORE_PATHS,
    rules: {
      'tsdoc/syntax': 'error',
      'tsdoc-coverage/sort-tags': 'error',
      'tsdoc-coverage/valid-group': 'error',
    },
  },
  /** Library: well-documented code. */
  {
    files: LIBRARY_BASE_PATHS,
    ignores: [
      ...LIBRARY_IGNORE_PATHS,
      // As we improve documentation, remove directories from the ignore path
      'src/components/**',
      'src/contexts/**',
    ],
    rules: {
      'tsdoc-coverage/require-comment': 'error',
      'tsdoc-coverage/require-release-tag': 'error',
      'tsdoc-coverage/require-member-comment': 'error',
    },
  },
  /** Library: well-documented code allowlist. */
  {
    files: [
      'src/components/Base/**/*.{ts,tsx}',
      'src/components/Common/**/*.{ts,tsx}',
      'src/components/Common/Fields/**/*.{ts,tsx}',
      'src/components/Common/UI/**/*.{ts,tsx}',
      'src/components/Common/PaginationControl/**',
      'src/components/Common/PayrollLoading/**',
      'src/components/Employee/**/*.{ts,tsx}',
      'src/components/Flow/**/*.{ts,tsx}',
      'src/components/InformationRequests/**/*.{ts,tsx}',
      'src/contexts/ApiProvider/**/*.{ts,tsx}',
      'src/contexts/ComponentAdapter/**/*.{ts,tsx}',
      'src/contexts/GustoProvider/**/*.{ts,tsx}',
      'src/contexts/LocaleProvider/**/*.{ts,tsx}',
      'src/contexts/LoadingIndicatorProvider/**/*.{ts,tsx}',
      'src/contexts/ObservabilityProvider/**/*.{ts,tsx}',
      'src/contexts/ThemeProvider/**/*.{ts,tsx}',
    ],
    ignores: LIBRARY_IGNORE_PATHS,
    rules: {
      'tsdoc-coverage/require-comment': 'error',
      'tsdoc-coverage/require-release-tag': 'error',
      'tsdoc-coverage/require-member-comment': 'error',
    },
  },

  ...storybook.configs['flat/recommended'],
] satisfies Config
