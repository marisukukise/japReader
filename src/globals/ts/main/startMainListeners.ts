import path from 'path';
import mainLog from 'electron-log';
import axios from 'axios';
const log = mainLog.scope('main');
import { BrowserWindow, app, clipboard, ipcMain, shell } from 'electron';
import { promises as fsPromises } from 'fs';
import { getHistoryStore, getSettingsStore } from '@globals/ts/main/initializeStore';
import { IPC_CHANNELS } from '@globals/ts/main/objects';
const historyStore = getHistoryStore();
const settingsStore = getSettingsStore();

const { clickThroughWindows } = settingsStore.get('global_settings');

let isClipboardWindowReady = false;
let isDeepWindowReady = false;
let isIchiWindowReady = false;
let isReaderWindowReady = false;
let isTranslationWindowReady = false;
let isDictionaryWindowReady = false;
let isSettingsWindowReady = false;

export function startMainListeners() {
    log.info('⏳ Setting up main listeners...');

    ipcMain.on(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.IS_READY, () => { isClipboardWindowReady = true; });
    ipcMain.on(IPC_CHANNELS.DEEP.ANNOUNCE.IS_READY, () => { isDeepWindowReady = true; });
    ipcMain.on(IPC_CHANNELS.ICHI.ANNOUNCE.IS_READY, () => { isIchiWindowReady = true; });
    ipcMain.on(IPC_CHANNELS.READER.ANNOUNCE.IS_READY, () => { isReaderWindowReady = true; });
    ipcMain.on(IPC_CHANNELS.TRANSLATION.ANNOUNCE.IS_READY, () => { isTranslationWindowReady = true; });
    ipcMain.on(IPC_CHANNELS.DICTIONARY.ANNOUNCE.IS_READY, () => { isDictionaryWindowReady = true; });
    ipcMain.on(IPC_CHANNELS.SETTINGS.ANNOUNCE.IS_READY, () => { isSettingsWindowReady = true; });


    ipcMain.handle(IPC_CHANNELS.CLIPBOARD.REQUEST.IS_READY, async () => { return isClipboardWindowReady; });
    ipcMain.handle(IPC_CHANNELS.DEEP.REQUEST.IS_READY, async () => { return isDeepWindowReady; });
    ipcMain.handle(IPC_CHANNELS.ICHI.REQUEST.IS_READY, async () => { return isIchiWindowReady; });
    ipcMain.handle(IPC_CHANNELS.READER.REQUEST.IS_READY, async () => { return isReaderWindowReady; });
    ipcMain.handle(IPC_CHANNELS.TRANSLATION.REQUEST.IS_READY, async () => { return isTranslationWindowReady; });
    ipcMain.handle(IPC_CHANNELS.DICTIONARY.REQUEST.IS_READY, async () => { return isDictionaryWindowReady; });
    ipcMain.handle(IPC_CHANNELS.SETTINGS.REQUEST.IS_READY, async () => { return isSettingsWindowReady; });


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

    if (process.env['JAPREADER_ENV'] == 'dev') {
        // Insert some text to clipboard when reader ready for easier testing
        ipcMain.on(IPC_CHANNELS.READER.ANNOUNCE.IS_READY, () => {
            clipboard.writeText('昨日の大雨による被害は出ていないようで何よりだ。');
        });
    }

    ipcMain.handle(IPC_CHANNELS.MAIN.REQUEST.LIB_PATH, async (event) => {
        // Some libraries (like clipboard-event) can't get packaged in order to work (for example because they use executable files)
        // Those libraries are in the src/lib folder and this function returns its path for both unpackaged and packaged versions
        // So use this function whenever you use a module from the src/lib path
        return app.isPackaged ? path.join(process.resourcesPath, 'lib') : path.join(process.cwd(), 'src', 'lib');
    });

    ipcMain.handle(IPC_CHANNELS.MAIN.REQUEST.FONT_LIST, async (event: any): Promise<japReader.FontInfo[]> => {
        // Returns the list of .ttf filenames in useData/fonts directory
        const userDataPath = app.getPath('userData');
        const fontsPath = path.join(userDataPath, 'fonts');
        try {
            await fsPromises.access(fontsPath);
            const files = await fsPromises.readdir(fontsPath);
            return files
                .filter(e => e.endsWith('.ttf'))
                .map((e: string) => {
                    return {
                        'filename': e,
                        'filepath': path.join(fontsPath, e)
                    };
                });
        }
        catch {
            console.warn(`Couldn't access the directory: ${fontsPath}. If you want to use custom fonts make sure that they're in this directory.`);
            return [];
        }
    });

    ipcMain.on(IPC_CHANNELS.MAIN.HANDLE.IGNORE_MOUSE_EVENTS, (event, state) => {
        if (clickThroughWindows && (process.platform == 'win32' || process.platform == 'darwin')) {
            const win = BrowserWindow.fromWebContents(event.sender);
            const options = state ? { forward: true } : undefined;
            win.setIgnoreMouseEvents(state, options);
        }
    });

    ipcMain.on(IPC_CHANNELS.MAIN.HANDLE.OPEN_EXTERNAL, (event, url) => {
        console.log('in ipcmain');
        shell.openExternal(url);
    });


    ipcMain.handle(IPC_CHANNELS.ANKI_CONNECT.INVOKE, async (event, action: any, params: any = {}) => {
        return axios.post(
            'http://127.0.0.1:8765',
            JSON.stringify({ action, version: 6, params })
        ).then((response: any) => {
            const data = response.data;
            if (Object.getOwnPropertyNames(data).length != 2) {
                throw 'AnkiConnect: response has an unexpected number of fields';
            }
            if (!Object.prototype.hasOwnProperty.call(data, 'error')) {
                throw 'AnkiConnect: response is missing required error field';
            }
            if (!Object.prototype.hasOwnProperty.call(data, 'result')) {
                throw 'AnkiConnect: response is missing required result field';
            }
            if (data.error) {
                throw 'AnkiConnect: ' + data.error;
            }
            return data.result;
        });
    });

    log.info('✔️ Set up main listeners');
}