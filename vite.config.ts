/// <reference types="vitest" />
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'
import { defineConfig } from 'vite'
// import dts from 'vite-plugin-dts'
// import sassDts from 'vite-plugin-sass-dts'
import stylelint from 'vite-plugin-stylelint'
import svgr from 'vite-plugin-svgr'
import circularDependencyDetector from 'vite-plugin-circular-dependency'
import checker from 'vite-plugin-checker'
import { externalizeDeps } from 'vite-plugin-externalize-deps'
import generatePackageJson from 'rollup-plugin-generate-package-json'
// import { dependencies, peerDependencies } from './package.json'

export default defineConfig({
  plugins: [
    react(),
    externalizeDeps({}),
    // {
    //   ...copy({
    //     targets: [
    //       { src: 'package.json', dest: 'dist' },
    //       { src: 'CONTRIBUTING.md', dest: 'dist' }, // optional
    //     ],
    //     flatten: true,
    //     hook: 'writeBundle', // ensures it's copied after the bundle is created
    //   }),
    //   apply: 'build',
    // },
    // sassDts({
    //   enabledMode: ['development', 'production'],
    //   sourceDir: resolve(__dirname, './src'),
    //   outputDir: resolve(__dirname, './dist'),
    //   prettierFilePath: '.prettierrc.js',
    // }),
    // dts({
    //   include: ['src'],
    //   outDir: './dist',
    //   tsconfigPath: './tsconfig.json',
    //   insertTypesEntry: true,
    //   rollupTypes: true,
    //   copyDtsFiles: false, // 🚨 Important: disables copying external .d.ts files
    //   exclude: ['**/node_modules/**', '**/.ladle/**', '**/*.stories.tsx' '**/*.stories.tsx',
    // '**/*.test.tsx',
    // '**/*.spec.tsx',
    // '**/__mocks__/**',
    // '**/.ladle/**',
    // '**/test/**',],
    //   strictOutput: true,
    // }),
    stylelint({ fix: true }),
    svgr({
      svgrOptions: {
        exportType: 'default',
        titleProp: true,
      },
      include: ['**/*.svg?react', '**/*.svg'],
    }),
    circularDependencyDetector(),
    checker({
      typescript: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: `@use "@/styles/Helpers" as *; @use '@/styles/Responsive' as *;
`,
      },
    },
  },
  build: {
    lib: {
      fileName: 'index',
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
    },
    sourcemap: false,
    cssCodeSplit: false,
    rollupOptions: {
      input: resolve(__dirname, 'src/index.ts'),
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        dir: 'dist',
        entryFileNames: '[name].js',
        manualChunks: undefined,
        format: 'es',
        validate: true,
      },
      plugins: [
        {
          name: 'filter-test-files',
          resolveId(source) {
            if (
              source.includes('test') ||
              source.includes('spec') ||
              source.includes('stories') ||
              source.includes('__mocks__') ||
              source.includes('test-utils') ||
              source.includes('@testing-library') ||
              source.includes('vitest') ||
              source.includes('jsdom') ||
              source.includes('pretty-format')
            ) {
              return false // Exclude these files from the build
            }
            return null // Let other plugins handle the resolution
          },
        },
        generatePackageJson({
          outputFolder: 'dist',
          baseContents: pkg => {
            // Filter out test dependencies
            const filteredDeps = Object.entries(pkg.dependencies || {}).reduce<
              Record<string, string>
            >((acc, [key, value]) => {
              if (
                !key.includes('test') &&
                !key.includes('vitest') &&
                !key.includes('jsdom') &&
                typeof value === 'string'
              ) {
                acc[key] = value
              }
              return acc
            }, {})

            return {
              name: pkg.name,
              version: pkg.version,
              license: pkg.license,
              main: './index.js',
              module: './index.js',
              types: './index.d.ts',
              exports: {
                '.': {
                  import: './index.js',
                  require: './index.js',
                  types: './index.d.ts',
                },
                './*.css': {
                  import: './*.css',
                  require: './*.css',
                },
              },
              peerDependencies: pkg.peerDependencies,
              dependencies: filteredDeps,
            }
          },
        }),
      ],
      // external: [
      //   ...Object.keys(dependencies || {}),
      //   ...Object.keys(peerDependencies || {}),
      //   /^node_modules\//,
      //   /^@gusto\//, // ensure gusto deps are never bundled
      //   /^react/, // in case transitive react packages sneak in
      //   /^classnames$/,
      //   /^deepmerge$/,
      //   /^dompurify$/,
      //   /^i18next$/,
      //   /^react-aria/,
      //   /^react-aria-components/,
      //   /^react-error-boundary/,
      //   /^react-hook-form/,
      //   /^react-i18next/,
      //   /^react-robot/,
      //   /^robot3/,
      //   /^valibot/,
      //   /^@hookform\//,
      //   /^@internationalized\//,
      //   /^~ladle\//,
      // ],
    },

    target: 'es2022',
  },
  optimizeDeps: {
    exclude: ['~ladle/*', 'react', 'react-dom'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
