import { BrowserWindow, ipcMain } from 'electron';

import { showWindowWhenReady, createWindowAndStorePositionData } from '@root/src/globals/ts/helpers/mainHelpers';
import { IPC_CHANNELS, JAPREADER_ENV } from '@root/src/globals/ts/other/objects';


import { getSettingsStore } from '@root/src/globals/ts/initializers/initializeStore';
const settingsStore = getSettingsStore();
const { useDeepLApi } = settingsStore.get('global_settings');

export const createDeepWindow = (preload_webpack_entry: string, webpack_entry: string): BrowserWindow => {
    const deepWindow = createWindowAndStorePositionData('deep', {
        icon: 'images/logo/icon.png',
        height: 600,
        width: 800,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            preload: preload_webpack_entry,
        },
    });

    deepWindow.loadURL(useDeepLApi ? webpack_entry : 'https://www.deepl.com/translator#ja/en/');
    if (JAPREADER_ENV === 'dev') deepWindow.webContents.openDevTools();

    showWindowWhenReady(deepWindow, 'deep', IPC_CHANNELS.DEEP, false);

    deepWindow.on('close', (event: any) => {
        event.preventDefault();
        deepWindow.hide();
    });

    ipcMain.on(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.CHANGE_DETECTED, (_event, text) => {
        deepWindow.webContents.send(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.CHANGE_DETECTED, text);
    });


    return deepWindow;
};