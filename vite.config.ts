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

/**
 * Current config is set to build sdk in library mode, retaining the original file structure and file names while also allowing for css modules and single css file output.
 * Development mode removes unnecessary plugins and configurations to speed up the build process.
 */
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  return {
    plugins: [
      react(),
      externalizeDeps(), // Externalizes all dependencies
      !isDev &&
        dts({
          include: ['src', 'src/types/i18next.d.ts'],
          outDir: './dist',
          tsconfigPath: './tsconfig.json',
          insertTypesEntry: true,
          rollupTypes: false,
          copyDtsFiles: true,
          exclude: [
            '**/node_modules/**',
            '**/.ladle/**',
            '**/*.stories.tsx',
            '**/*.test.tsx',
            '**/test/**',
          ],
          strictOutput: true,
          beforeWriteFile: (filePath, content) => {
            // This is a hack to ensure that the i18next.d.ts file is imported in the index.d.ts file, otherwise i18next type augmentation is not available
            if (filePath.includes('index.d.ts')) {
              return { content: 'import "./types/i18next.d.ts"\n' + content, filePath }
            }
            return { content, filePath }
          },
        }),
      !isDev && stylelint({ fix: true }),
      svgr({
        svgrOptions: {
          exportType: 'default',
          titleProp: true,
        },
        include: ['**/*.svg?react', '**/*.svg'],
      }),
      !isDev && circularDependencyDetector(),
      !isDev &&
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
        cssFileName: 'style',
      },
      minify: !isDev,
      sourcemap: !isDev && process.env.NODE_ENV !== 'test', // Disable source maps in tests
      cssCodeSplit: false,
      rollupOptions: {
        input: resolve(__dirname, 'src/index.ts'),
        output: {
          preserveModules: true,
          preserveModulesRoot: 'src',
          dir: 'dist',
          entryFileNames: '[name].js',
          manualChunks: undefined,
          format: 'es',
        },
      },

      target: 'es2023', // Use newer target for better performance
    },
    //Explicitly exclude ladle and react from being bundled - should only affect dev
    optimizeDeps: {
      exclude: ['~ladle/*', 'react', 'react-dom'],
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      // Performance optimizations
      css: false, // Skip CSS processing in tests
      reporter: 'basic', // Use basic reporter instead of fancy one
    },
  }
})
