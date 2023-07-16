import { BrowserWindow } from 'electron';

import { getSettingsStore } from '@globals/ts/main/initializeStore';
import { showWindowWhenReady, createWindowAndStorePositionData, setDefaultVisibleWindowSettings, showExitDialog, passMessageToRenderer } from '@globals/ts/main/helpers';

import { IPC_CHANNELS } from '@globals/ts/main/objects';


const settingsStore = getSettingsStore();
const { useReader } = settingsStore.get('global_settings');

export const createTranslationWindow = (webpack_entry: string): BrowserWindow => {
    const translationWindow = createWindowAndStorePositionData('translation', {
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

    translationWindow.loadURL(webpack_entry);

    setDefaultVisibleWindowSettings(translationWindow, 'translation', IPC_CHANNELS.TRANSLATION);
    showWindowWhenReady(translationWindow, 'translation', IPC_CHANNELS.TRANSLATION, true);

    if (!useReader) {
        translationWindow.on('close', (event: any) => {
            showExitDialog(event, translationWindow);
        });
    }
    else {
        translationWindow.on('close', (event: any) => {
            event.preventDefault();
            translationWindow.hide();
        });
    }

    passMessageToRenderer(translationWindow, IPC_CHANNELS.DEEP.ANNOUNCE.TRANSLATED_TEXT);
    passMessageToRenderer(translationWindow, IPC_CHANNELS.CLIPBOARD.ANNOUNCE.TOO_MANY_CHARACTERS);
    passMessageToRenderer(translationWindow, IPC_CHANNELS.CLIPBOARD.ANNOUNCE.CHANGE_DETECTED);
    passMessageToRenderer(translationWindow, IPC_CHANNELS.DEEP.ANNOUNCE.CONNECTION_ERROR);
    passMessageToRenderer(translationWindow, IPC_CHANNELS.DEEP.ANNOUNCE.IS_READY);

    return translationWindow;
};