import path from 'path';
import log from 'electron-log';
import { app, ipcMain } from 'electron';
import { getHistoryStore } from "@globals/ts/main/initializeStore";
import { IPC_CHANNELS } from "@globals/ts/main/objects";
const historyStore = getHistoryStore();

let isClipboardWindowReady = false;
let isDeepWindowReady = false;
let isIchiWindowReady = false;
let isReaderWindowReady = false;
let isTranslationWindowReady = false;
let isDictionaryWindowReady = false;
let isSettingsWindowReady = false;

export function startMainListeners() {
    log.debug("Starting ipcMain listeners...")

    ipcMain.on(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.IS_READY, (event) => { isClipboardWindowReady = true; log.log("clipboard is ready") })
    ipcMain.on(IPC_CHANNELS.DEEP.ANNOUNCE.IS_READY, (event) => { isDeepWindowReady = true; log.log("deep is ready") })
    ipcMain.on(IPC_CHANNELS.ICHI.ANNOUNCE.IS_READY, (event) => { isIchiWindowReady = true; log.log("ichi is ready") })
    ipcMain.on(IPC_CHANNELS.READER.ANNOUNCE.IS_READY, (event) => { isReaderWindowReady = true; log.log("reader is ready") })
    ipcMain.on(IPC_CHANNELS.TRANSLATION.ANNOUNCE.IS_READY, (event) => { isTranslationWindowReady = true; log.log("translation is ready") })
    ipcMain.on(IPC_CHANNELS.DICTIONARY.ANNOUNCE.IS_READY, (event) => { isDictionaryWindowReady = true; log.log("dictionary is ready") })
    ipcMain.on(IPC_CHANNELS.SETTINGS.ANNOUNCE.IS_READY, (event) => { isSettingsWindowReady = true; log.log("settings is ready") })


    ipcMain.handle(IPC_CHANNELS.CLIPBOARD.REQUEST.IS_READY, async (event) => { return isClipboardWindowReady });
    ipcMain.handle(IPC_CHANNELS.DEEP.REQUEST.IS_READY, async (event) => { return isDeepWindowReady });
    ipcMain.handle(IPC_CHANNELS.ICHI.REQUEST.IS_READY, async (event) => { return isIchiWindowReady });
    ipcMain.handle(IPC_CHANNELS.READER.REQUEST.IS_READY, async (event) => { return isReaderWindowReady });
    ipcMain.handle(IPC_CHANNELS.TRANSLATION.REQUEST.IS_READY, async (event) => { return isTranslationWindowReady });
    ipcMain.handle(IPC_CHANNELS.DICTIONARY.REQUEST.IS_READY, async (event) => { return isDictionaryWindowReady });
    ipcMain.handle(IPC_CHANNELS.SETTINGS.REQUEST.IS_READY, async (event) => { return isSettingsWindowReady });


    ipcMain.on(IPC_CHANNELS.MAIN.HANDLE.RESTART_PROGRAM, () => {
        log.silly("Restarting japReader...")
        app.relaunch();
        app.exit();
    });

    ipcMain.on(IPC_CHANNELS.STORES.HISTORY.APPEND, (event, originalText, translation) => {
        if (typeof translation !== 'string' || translation == '') translation = null;

        const entry = {
            "timestamp": Date.now(),
            "japanese": originalText,
            "translation": translation
        };

        const list = historyStore.get('history');

        if (list) {
            list.push(entry)
            historyStore.set('history', list);
        }
        else historyStore.set('history', [entry]);
    })


    ipcMain.handle(IPC_CHANNELS.MAIN.REQUEST.LIB_PATH, async (event) => {
        // Some libraries (like clipboard-event) can't get packaged in order to work (for example because they use executable files)
        // Those libraries are in the src/lib folder and this function returns its path for both unpackaged and packaged versions
        // So use this function whenever you use a module from the src/lib path
        return app.isPackaged ? path.join(process.resourcesPath, 'lib') : path.join(process.cwd(), 'src', 'lib');
    });
}