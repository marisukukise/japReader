import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import path from 'path';

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main.ts',
  // Put your normal webpack config below here
  module: {
    rules,
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    alias: {
      '@globals': path.resolve(__dirname, 'src/globals'),
      '@src': path.resolve(__dirname, 'src'),
      '@fonts': path.resolve(__dirname, 'src/fonts'),
    }
  },
  mode: 'development',
  devtool: 'eval-cheap-source-map',
  devServer: {
    static: './dist'
  }
};
