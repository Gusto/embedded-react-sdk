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
import { glob } from 'fs/promises'

// console.log('HERE!!!!!!!!!!!!!')
// console.log(await Array.fromAsync(glob('src/**/!(*.d|*.test|*.stories).ts?(x)')))

export default defineConfig({
  plugins: [
    react(),
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
      copyDtsFiles: true,
      insertTypesEntry: true,
      rollupTypes: true,
      exclude: ['test/*', 'coverage/*'],
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
      entry: [...(await Array.fromAsync(glob('src/!(test)**/!(*.d|*.test|*.stories).ts?(x)')))],
      formats: ['es'],
    },
    sourcemap: true,
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', 'react-dom', /\style.css$/],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
    },
    target: 'es2022',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
