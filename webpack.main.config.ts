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
            '@root': path.resolve(__dirname),
            '@img': path.resolve(__dirname, 'src/img'),
            '@fonts': path.resolve(__dirname, 'src/fonts'),
        }
    },
    mode: process.env.JAPREADER_ENV == 'dev' ? 'development' : 'production',
    devtool: process.env.JAPREADER_ENV == 'dev' ? 'eval-cheap-source-map' : 'source-map',
    devServer: {
        static: './dist'
    }
};
