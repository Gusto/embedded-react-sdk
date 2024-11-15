import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import dts from 'vite-plugin-dts'
import sassDts from 'vite-plugin-sass-dts';
import svgr from 'vite-plugin-svgr'
import stylelint from 'vite-plugin-stylelint';


export default defineConfig({
  plugins: [react(), sassDts({
    enabledMode: ['development', 'production'],
    sourceDir: resolve(__dirname, './src'),
    outputDir: resolve(__dirname, './dist'),
    prettierFilePath: '.prettierrc.js',
  }), dts({
    include: ['src'],
    outDir: './dist',
    tsconfigPath: './tsconfig.json',
    insertTypesEntry: true,
    rollupTypes: true,
    // exclude: ['test/*', 'coverage/*'],
  }), stylelint({ fix: true }),
  svgr({
    svgrOptions: {
      exportType: 'default',
      titleProp: true,
    },
    include: ['**/*.svg?react', '**/*.svg'],
  })],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/Helpers" as *;`,
      }
    }
  },
  build: {
    lib: {
      fileName: 'index',
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
    },
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.ts'),
      },
      external: ['react', 'react/jsx-runtime', 'react-dom', /\style.css$/],
    },
    target: 'es2022',
  },
})
