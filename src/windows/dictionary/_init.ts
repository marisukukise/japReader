import { BrowserWindow } from 'electron';

import { showWindowWhenReady, createWindowAndStorePositionData, setDefaultVisibleWindowSettings, passMessageToRenderer } from '@globals/ts/main/helpers';
import { IPC_CHANNELS } from '@globals/ts/main/objects';

export const createDictionaryWindow = (webpack_entry: string): BrowserWindow => {
    const dictionaryWindow = createWindowAndStorePositionData('dictionary', {
        icon: 'images/logo/icon.png',
        height: 600,
        width: 800,
        backgroundColor: '#e7dee6',
        show: false,
        zoomFactor: 1.0,
        frame: false,
        transparent: true,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
        },
    });

    dictionaryWindow.loadURL(webpack_entry);
    setDefaultVisibleWindowSettings(dictionaryWindow, 'dictionary', IPC_CHANNELS.DICTIONARY);
    showWindowWhenReady(dictionaryWindow, false);

    dictionaryWindow.on('close', (event: any) => {
        event.preventDefault();
        dictionaryWindow.hide();
    });

    passMessageToRenderer(dictionaryWindow, IPC_CHANNELS.READER.ANNOUNCE.PARSED_WORDS_DATA);
    passMessageToRenderer(dictionaryWindow, IPC_CHANNELS.READER.ANNOUNCE.IS_READY);
    passMessageToRenderer(dictionaryWindow, IPC_CHANNELS.READER.ANNOUNCE.WORD_STATUS_CHANGE_DETECTED);

    return dictionaryWindow;
};