import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginReact from 'eslint-plugin-react'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import importPlugin from 'eslint-plugin-import'
import reactRefresh from 'eslint-plugin-react-refresh'

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
      // Retain the react-hooks recommended rules
      ...pluginReactHooks.configs.recommended.rules,
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
      '**/generated/**/*',
      '**/jest.setup.*',
      '**/.prettierrc.js',
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
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unnecessary-condition': ['error', { checkTypePredicates: true }],
      '@typescript-eslint/no-deprecated': 'off', // TODO: fix instances
      '@typescript-eslint/no-misused-promises': 'off', // TODO: fix instances
      '@typescript-eslint/no-non-null-assertion': 'off', // TODO: fix instances
      '@typescript-eslint/no-unsafe-argument': 'off', // TODO: fix instances
      '@typescript-eslint/no-unsafe-assignment': 'off', // TODO: fix instances
      '@typescript-eslint/no-unsafe-member-access': 'off', // TODO: fix instances
      '@typescript-eslint/no-unsafe-return': 'off', // TODO: fix instances
      '@typescript-eslint/no-unused-expressions': 'off', // TODO: fix instances
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
    files: ['src/components/Common/UI/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
]
