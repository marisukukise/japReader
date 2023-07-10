import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';
import path from 'path';

rules.push({
    test: /\.s[ac]ss$/i,
    use: [
        { loader: 'style-loader' }, { loader: 'css-loader' }, 
        { loader: 'sass-loader',
            options: {
                webpackImporter: true,
            }
        }
    ],
});

export const rendererConfig: Configuration = {
    module: {
        rules,
    },
    plugins,
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
        alias: {
            '@globals': path.resolve(__dirname, 'src/globals'),
            '@src': path.resolve(__dirname, 'src'),
            '@img': path.resolve(__dirname, 'src/img'),
            '@fonts': path.resolve(__dirname, 'src/fonts'),
        }
    },
};
