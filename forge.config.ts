import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
     "extraResource": [
      "./src/lib/",
    ]
  },
  rebuildConfig: {},
  makers: [new MakerSquirrel({}), new MakerZIP({}, ['darwin']), new MakerRpm({}), new MakerDeb({})],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      //devContentSecurityPolicy: "connect-src 'self'; default-src 'self'; script-src 'self'",
      renderer: {
        config: rendererConfig,
        nodeIntegration: true,
        entryPoints: [
          {
            html: './src/windows/reader/renderer_process/index.html',
            js: './src/windows/reader/renderer_process/index.tsx',
            name: 'reader',
          },
          {
            html: './src/windows/dictionary/renderer_process/index.html',
            js: './src/windows/dictionary/renderer_process/index.tsx',
            name: 'dictionary',
          },
          {
            html: './src/windows/translation/renderer_process/index.html',
            js: './src/windows/translation/renderer_process/index.tsx',
            name: 'translation',
          },
          {
            html: './src/windows/settings/renderer_process/index.html',
            js: './src/windows/settings/renderer_process/index.tsx',
            name: 'settings',
          },
          {
            html: './src/windows/clipboard/renderer_process/index.html',
            js: './src/windows/clipboard/renderer_process/index.ts',
            name: 'clipboard',
          },
          {
            html: './src/windows/ichi/renderer_process/index.html',
            js: './src/windows/ichi/renderer_process/index.ts',
            name: 'ichi',
            preload: {
              js: './src/windows/ichi/renderer_process/preload.ts',
            },
            nodeIntegration: false,
          },
          {
            html: './src/windows/deep/renderer_process/index.html',
            js: './src/windows/deep/renderer_process/index.ts',
            name: 'deep',
            preload: {
              js: './src/windows/deep/renderer_process/preload.ts',
            },
            nodeIntegration: false,
          },
        ],
      },
    }),
  ],
};

export default config;
