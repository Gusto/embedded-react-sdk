/// <reference types="vitest" />
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import sassDts from 'vite-plugin-sass-dts'
import stylelint from 'vite-plugin-stylelint'
import svgr from 'vite-plugin-svgr'
import circularDependencyDetector from 'vite-plugin-circular-dependency'
import checker from 'vite-plugin-checker'
import { externalizeDeps } from 'vite-plugin-externalize-deps'
import generatePackageJson from 'rollup-plugin-generate-package-json'

export default defineConfig({
  plugins: [
    react(),
    externalizeDeps(),
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
    sassDts({
      enabledMode: ['development', 'production'],
      sourceDir: resolve(__dirname, './src'),
      outputDir: resolve(__dirname, './dist'),
      prettierFilePath: '.prettierrc.js',
    }),
    dts({
      include: ['src'],
      outDir: './dist',
      tsconfigPath: './tsconfig.json',
      insertTypesEntry: true,
      rollupTypes: true,
      copyDtsFiles: false, // 🚨 Important: disables copying external .d.ts files
      exclude: ['**/node_modules/**', '**/.ladle/**', '**/*.stories.tsx'],
      strictOutput: true,
    }),
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
      // input: {
      //   main: resolve(__dirname, 'src/index.ts'),
      // },
      input: resolve(__dirname, 'src/index.ts'),
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        dir: 'dist',
        entryFileNames: '[name].js',
        manualChunks: undefined,
        format: 'es',
        exports: 'named',
      },
      plugins: [
        generatePackageJson({
          outputFolder: 'dist',
          baseContents: pkg => ({
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
            dependencies: pkg.dependencies,
          }),
        }),
      ],
      external: [
        /^~ladle\//, // Internal alias, always external
      ],
    },

    target: 'es2022',
  },
  optimizeDeps: {
    exclude: ['~ladle/*'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
