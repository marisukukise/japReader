
import { BrowserWindow } from 'electron';

import { showWindowWhenReady, createWindowAndStorePositionData, setDefaultVisibleWindowSettings, showExitDialog, passMessageToRenderer } from '@globals/ts/main/helpers';
import { IPC_CHANNELS } from '@globals/ts/main/objects';

import { getSettingsStore } from '@globals/ts/main/initializeStore';
const settingsStore = getSettingsStore();
const { useDeepL } = settingsStore.get('global_settings');

export const createReaderWindow = (webpack_entry: string): BrowserWindow => {
    const readerWindow = createWindowAndStorePositionData('reader', {
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

    readerWindow.loadURL(webpack_entry);

    setDefaultVisibleWindowSettings(readerWindow, 'reader', IPC_CHANNELS.READER);
    showWindowWhenReady(readerWindow, 'reader', IPC_CHANNELS.READER, true);

    readerWindow.on('close', (event: any) => {
        showExitDialog(readerWindow, event);
    });

    if (useDeepL) {
        passMessageToRenderer(readerWindow, IPC_CHANNELS.DEEP.ANNOUNCE.CONNECTION_ERROR);
        passMessageToRenderer(readerWindow, IPC_CHANNELS.DEEP.ANNOUNCE.TRANSLATED_TEXT);
    }

    passMessageToRenderer(readerWindow, IPC_CHANNELS.CLIPBOARD.ANNOUNCE.TOO_MANY_CHARACTERS);
    passMessageToRenderer(readerWindow, IPC_CHANNELS.CLIPBOARD.ANNOUNCE.CHANGE_DETECTED);
    passMessageToRenderer(readerWindow, IPC_CHANNELS.ICHI.ANNOUNCE.CONNECTION_ERROR);
    passMessageToRenderer(readerWindow, IPC_CHANNELS.ICHI.ANNOUNCE.PARSED_WORDS_DATA);
    passMessageToRenderer(readerWindow, IPC_CHANNELS.READER.ANNOUNCE.WORD_STATUS_CHANGE_DETECTED);
    passMessageToRenderer(readerWindow, IPC_CHANNELS.ICHI.ANNOUNCE.IS_READY);

    return readerWindow;
};