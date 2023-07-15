import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const config: ForgeConfig = {
    packagerConfig: {
        icon: './images/logo/icon',
        asar: true,
        'extraResource': [
            './src/lib/',
        ]
    },
    rebuildConfig: {},
    makers: [
        new MakerZIP({}),
        new MakerSquirrel({
            iconUrl: 'https://raw.githubusercontent.com/marisukukise/japReader/main/images/logo/icon.ico',
            setupIcon: './images/logo/icon.ico',
            authors: 'marisukukise',
            description: 'japReader is an app for breaking down Japanese sentences and tracking vocabulary progress',
        }),
        new MakerDMG({
            background: './images/logo/icon.icns',
            format: 'ULFO'
        }),
        new MakerRpm({ options: {
            homepage: 'https://github.com/marisukukise/japReader',
            icon: './images/logo/icon.png',
        }}),
        new MakerDeb({ options: {
            maintainer: 'marisukukise',
            homepage: 'https://github.com/marisukukise/japReader',
            icon: './images/logo/icon.png',
        }})
    ],
    plugins: [
        new AutoUnpackNativesPlugin({}),
        new WebpackPlugin({
            // TODO: change securitypolicy
            devContentSecurityPolicy: '\
            default-src \'self\' \'unsafe-inline\' data:;\
            script-src \'self\' \'unsafe-eval\' \'unsafe-inline\' data:;\
            media-src \'self\' \'unsafe-eval\' \'unsafe-inline\' data: http: https:;\
            connect-src * \'unsafe-eval\' \'unsafe-inline\';\
            ',
            mainConfig,
            //devContentSecurityPolicy: "connect-src 'self'; default-src 'self'; script-src 'self'",
            renderer: {
                config: rendererConfig,
                nodeIntegration: true,
                entryPoints: [
                    {
                        html: './src/windows/reader/index.html',
                        js: './src/windows/reader/index.tsx',
                        name: 'reader',
                    },
                    {
                        html: './src/windows/dictionary/index.html',
                        js: './src/windows/dictionary/index.tsx',
                        name: 'dictionary',
                    },
                    {
                        html: './src/windows/translation/index.html',
                        js: './src/windows/translation/index.tsx',
                        name: 'translation',
                    },
                    {
                        html: './src/windows/settings/index.html',
                        js: './src/windows/settings/index.tsx',
                        name: 'settings',
                    },
                    {
                        html: './src/windows/clipboard/index.html',
                        js: './src/windows/clipboard/index.ts',
                        name: 'clipboard',
                    },
                    {
                        html: './src/windows/ichi/index.html',
                        js: './src/windows/ichi/index.ts',
                        name: 'ichi',
                        preload: {
                            js: './src/windows/ichi/preload.ts',
                        },
                        nodeIntegration: false,
                    },
                    {
                        html: './src/windows/deep/index.html',
                        js: './src/windows/deep/index.ts',
                        name: 'deep',
                        preload: {
                            js: './src/windows/deep/preload.ts',
                        },
                        nodeIntegration: false,
                    },
                ],
            },
        }),
    ],
};

export default config;
