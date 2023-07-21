import { BrowserWindow, ipcMain } from 'electron';

import { showWindowWhenReady, createWindowAndStorePositionData } from '@globals/ts/main/helpers';
import { IPC_CHANNELS } from '@globals/ts/main/objects';

export const createIchiWindow = (preload_webpack_entry: string): BrowserWindow => {
    const ichiWindow = createWindowAndStorePositionData('ichi', {
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

    ichiWindow.loadURL('https://ichi.moe/cl/qr/?q=&r=kana');
    if (process.env['JAPREADER_ENV'] === 'dev') ichiWindow.webContents.openDevTools();

    showWindowWhenReady(ichiWindow, 'ichi', IPC_CHANNELS.ICHI, false);

    ichiWindow.on('close', (event: any) => {
        event.preventDefault();
        ichiWindow.hide();
    });

    ipcMain.on(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.CHANGE_DETECTED, (event, text) => {
        ichiWindow.webContents.send(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.CHANGE_DETECTED, text);
    });


    ipcMain.on(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.IS_READY, () => {
        ichiWindow.webContents.send(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.IS_READY);
    });

    return ichiWindow;
};