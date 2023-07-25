import { BrowserWindow } from 'electron';

import { showWindowWhenReady, createWindowAndStorePositionData, setDefaultVisibleWindowSettings } from '@root/src/globals/ts/helpers/mainHelpers';
import { IPC_CHANNELS } from '@root/src/globals/ts/other/objects';

export const createSettingsWindow = (webpack_entry: string): BrowserWindow => {
    const settingsWindow = createWindowAndStorePositionData('settings', {
        icon: 'images/logo/icon.png',
        height: 600,
        width: 800,
        backgroundColor: '#eee7dee6',
        show: false,
        zoomFactor: 1.0,
        frame: false,
        transparent: true,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
        },
    });

    settingsWindow.loadURL(webpack_entry);
    setDefaultVisibleWindowSettings(settingsWindow, 'settings', IPC_CHANNELS.SETTINGS);
    showWindowWhenReady(settingsWindow, 'settings', IPC_CHANNELS.SETTINGS, false);

    settingsWindow.on('close', (event: any) => {
        event.preventDefault();
        settingsWindow.hide();
    });

    return settingsWindow;
};