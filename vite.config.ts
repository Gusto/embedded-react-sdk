/// <reference types="vitest" />
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import stylelint from 'vite-plugin-stylelint'
import svgr from 'vite-plugin-svgr'
import circularDependencyDetector from 'vite-plugin-circular-dependency'
import checker from 'vite-plugin-checker'
import { externalizeDeps } from 'vite-plugin-externalize-deps'

export default defineConfig({
  plugins: [
    react(),
    externalizeDeps(), // Externalizes all dependencies
    dts({
      include: ['src'],
      outDir: './dist',
      tsconfigPath: './tsconfig.json',
      insertTypesEntry: true,
      rollupTypes: false,
      copyDtsFiles: false, // 🚨 Important: disables copying external .d.ts files
      exclude: [
        '**/node_modules/**',
        '**/.ladle/**',
        '**/*.stories.tsx',
        '**/*.test.tsx',
        '**/test/**',
      ],
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
    sourcemap: true,
    cssCodeSplit: false, //Force vite to generate single css file
    rollupOptions: {
      input: resolve(__dirname, 'src/index.ts'),
      output: {
        preserveModules: true, //Maintains the original file structure
        preserveModulesRoot: 'src', //Removes the root folder from the output
        dir: 'dist',
        entryFileNames: '[name].js', //Retains the original file name
        manualChunks: undefined, //Disabling manual chunking
        format: 'es',
      },
    },

    target: 'es2022',
  },
  //Explicitely exclude ladle and react from being bundled - should only affect dev
  optimizeDeps: {
    exclude: ['~ladle/*', 'react', 'react-dom'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
