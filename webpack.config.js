import { join } from 'node:path'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'

export default {
  entry: join(import.meta.dirname, 'src', 'index.ts'),
  experiments: {
    outputModule: true,
  },
  output: {
    path: join(import.meta.dirname, 'dist'),
    library: {
      type: 'module',
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.png/,
        type: 'asset/resource',
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              additionalData: `@use "@/styles/Helpers" as *; @use '@/styles/Responsive' as *;`,
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    plugins: [new TsconfigPathsPlugin()],
    alias: {
      '@': join(import.meta.dirname, 'src'),
    },
  },
  stats: {
    errorDetails: true,
  },
  externals: ['react', 'react/jsx-runtime', 'react-dom'],
}
