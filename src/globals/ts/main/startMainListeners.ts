import path from 'path';
import mainLog from 'electron-log';
const log = mainLog.scope('main')
import { app, ipcMain } from 'electron';
import { getHistoryStore, getSettingsStore } from '@globals/ts/main/initializeStore';
import { IPC_CHANNELS } from '@globals/ts/main/objects';
const historyStore = getHistoryStore();

let isClipboardWindowReady = false;
let isDeepWindowReady = false;
let isIchiWindowReady = false;
let isReaderWindowReady = false;
let isTranslationWindowReady = false;
let isDictionaryWindowReady = false;
let isSettingsWindowReady = false;

export function startMainListeners() {
    log.info("⏳ Setting up main listeners...")

    ipcMain.on(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.IS_READY,              () => { isClipboardWindowReady = true; });
    ipcMain.on(IPC_CHANNELS.DEEP.ANNOUNCE.IS_READY,                   () => { isDeepWindowReady = true; });
    ipcMain.on(IPC_CHANNELS.ICHI.ANNOUNCE.IS_READY,                   () => { isIchiWindowReady = true; });
    ipcMain.on(IPC_CHANNELS.READER.ANNOUNCE.IS_READY,                 () => { isReaderWindowReady = true; });
    ipcMain.on(IPC_CHANNELS.TRANSLATION.ANNOUNCE.IS_READY,            () => { isTranslationWindowReady = true; });
    ipcMain.on(IPC_CHANNELS.DICTIONARY.ANNOUNCE.IS_READY,             () => { isDictionaryWindowReady = true; });
    ipcMain.on(IPC_CHANNELS.SETTINGS.ANNOUNCE.IS_READY,               () => { isSettingsWindowReady = true; });


    ipcMain.handle(IPC_CHANNELS.CLIPBOARD.REQUEST.IS_READY,     async () => { return isClipboardWindowReady; });
    ipcMain.handle(IPC_CHANNELS.DEEP.REQUEST.IS_READY,          async () => { return isDeepWindowReady; });
    ipcMain.handle(IPC_CHANNELS.ICHI.REQUEST.IS_READY,          async () => { return isIchiWindowReady; });
    ipcMain.handle(IPC_CHANNELS.READER.REQUEST.IS_READY,        async () => { return isReaderWindowReady; });
    ipcMain.handle(IPC_CHANNELS.TRANSLATION.REQUEST.IS_READY,   async () => { return isTranslationWindowReady; });
    ipcMain.handle(IPC_CHANNELS.DICTIONARY.REQUEST.IS_READY,    async () => { return isDictionaryWindowReady; });
    ipcMain.handle(IPC_CHANNELS.SETTINGS.REQUEST.IS_READY,      async () => { return isSettingsWindowReady; });


    ipcMain.on(IPC_CHANNELS.MAIN.HANDLE.RESTART_PROGRAM, () => {
        log.info('🔄 Restarting japReader...');
        app.relaunch();
        app.exit();
    });

    ipcMain.on(IPC_CHANNELS.STORES.HISTORY.APPEND, (event, originalText, translation) => {
        if (typeof translation !== 'string' || translation == '') translation = null;

        const entry = {
            'timestamp': Date.now(),
            'japanese': originalText,
            'translation': translation
        };

        const list = historyStore.get('history');

        if (list) {
            list.push(entry);
            historyStore.set('history', list);
        }
        else historyStore.set('history', [entry]);
    });


    ipcMain.handle(IPC_CHANNELS.MAIN.REQUEST.LIB_PATH, async (event) => {
        // Some libraries (like clipboard-event) can't get packaged in order to work (for example because they use executable files)
        // Those libraries are in the src/lib folder and this function returns its path for both unpackaged and packaged versions
        // So use this function whenever you use a module from the src/lib path
        return app.isPackaged ? path.join(process.resourcesPath, 'lib') : path.join(process.cwd(), 'src', 'lib');
    });

    log.info("✔️ Set up main listeners")
}