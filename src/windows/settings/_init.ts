import { BrowserWindow } from 'electron';

import { showWindowWhenReady, createWindowAndStorePositionData, setDefaultVisibleWindowSettings } from '@globals/ts/main/helpers';
import { IPC_CHANNELS } from '@globals/ts/main/objects';

import { getWindowStore } from '@globals/ts/main/initializeStore';
const windowStore = getWindowStore();

export const createSettingsWindow = (webpack_entry: string): BrowserWindow => {
    const settingsWindow = createWindowAndStorePositionData('settings', {
        icon: 'images/logo/icon.png',
        height: 600,
        width: 800,
        backgroundColor: '#e7dee6',
        show: true,
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