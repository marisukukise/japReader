import { BrowserWindow } from 'electron';

import { showWindowWhenReady, createWindowAndStorePositionData } from '@root/src/globals/ts/helpers/mainHelpers';
import { IPC_CHANNELS } from '@root/src/globals/ts/other/objects';

export const createClipboardWindow = (webpack_entry: string): BrowserWindow => {
    const clipboardWindow = createWindowAndStorePositionData('clipboard', {
        icon: 'images/logo/icon.png',
        height: 600,
        width: 800,
        show: false,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
        },
    });

    clipboardWindow.loadURL(webpack_entry);

    showWindowWhenReady(clipboardWindow, 'clipboard', IPC_CHANNELS.CLIPBOARD, false);

    clipboardWindow.on('close', (event: any) => {
        event.preventDefault();
        clipboardWindow.hide();
    });

    return clipboardWindow;
};