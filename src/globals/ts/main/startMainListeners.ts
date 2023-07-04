import path from 'path';
import log from 'electron-log';
import { app, ipcMain } from 'electron';

let isClipboardWindowReady = false;
let isDeepWindowReady = false;
let isIchiWindowReady = false;
let isReaderWindowReady = false;
let isTranslationWindowReady = false;
let isDictionaryWindowReady = false;
let isSettingsWindowReady = false;

export function startMainListeners() {
    log.debug("Starting ipcMain listeners...")

    ipcMain.on("announce/clipboard/isReady",     (event) =>  { isClipboardWindowReady = true; log.log("clipboard is ready")  })
    ipcMain.on("announce/deep/isReady",          (event) =>  { isDeepWindowReady = true; log.log("deep is ready") })
    ipcMain.on("announce/ichi/isReady",          (event) =>  { isIchiWindowReady = true; log.log("ichi is ready") })
    ipcMain.on("announce/reader/isReady",        (event) =>  { isReaderWindowReady = true; log.log("reader is ready") })
    ipcMain.on("announce/translation/isReady",   (event) =>  { isTranslationWindowReady = true; log.log("translation is ready") })
    ipcMain.on("announce/dictionary/isReady",    (event) =>  { isDictionaryWindowReady = true; log.log("dictionary is ready") })
    ipcMain.on("announce/settings/isReady",      (event) =>  { isSettingsWindowReady = true; log.log("settings is ready") })


    ipcMain.handle("get/clipboard/isReady", async (event) => { return isClipboardWindowReady });
    ipcMain.handle("get/deep/isReady", async (event) => { return isDeepWindowReady });
    ipcMain.handle("get/ichi/isReady", async (event) => { return isIchiWindowReady });
    ipcMain.handle("get/reader/isReady", async (event) => { return isReaderWindowReady });
    ipcMain.handle("get/translation/isReady", async (event) => { return isTranslationWindowReady });
    ipcMain.handle("get/dictionary/isReady", async (event) => { return isDictionaryWindowReady });
    ipcMain.handle("get/settings/isReady", async (event) => { return isSettingsWindowReady });


    ipcMain.on("log", (event, message) => {
        console.log(message);
    });

    ipcMain.on('restartProgram', () => {
        log.silly("Restarting japReader...")
        app.relaunch();
        app.exit();
    });

    ipcMain.handle("get/libPath", async (event) => {
        // Some libraries (like clipboard-event) can't get packaged in order to work (for example because they use executable files)
        // Those libraries are in the src/lib folder and this function returns its path for both unpackaged and packaged versions
        // So use this function whenever you use a module from the src/lib path
        return app.isPackaged ? path.join(process.resourcesPath, 'lib') : path.join(process.cwd(), 'src', 'lib');
    });
}