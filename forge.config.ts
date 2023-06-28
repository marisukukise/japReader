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
            html: './src/windows/reader/index.html',
            js: './src/windows/reader/index.tsx',
            name: 'reader',
          },
          {
            html: './src/windows/clipboard/index.html',
            js: './src/windows/clipboard/index.ts',
            name: 'clipboard',
          },
          {
            js: './src/windows/ichi/index.ts',
            name: 'ichi',
            preload: {
              js: './src/windows/ichi/preload.ts',
            },
            nodeIntegration: false,
          },
        ],
      },
    }),
  ],
};

export default config;
