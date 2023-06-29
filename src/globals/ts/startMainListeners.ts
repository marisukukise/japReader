import path from 'path';
import log from 'electron-log';
import { app, ipcMain } from 'electron';

export function startMainListeners() {
    log.debug("Starting ipcMain listeners...")

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