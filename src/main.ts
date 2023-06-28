// This is the main process file
// Learn more: https://www.electronjs.org/docs/latest/tutorial/process-model#the-main-process

import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron';
import log from 'electron-log';
const path = require('path');

log.initialize({ preload: true });
if (process.env.NODE_ENV === "development") {
	log.transports.file.level = false;
	log.transports.console.level = false;
}
if (process.env.NODE_ENV === "production") {
	log.transports.file.level = false;
	log.transports.console.level = false;
}

declare const READER_WEBPACK_ENTRY: string;
declare const CLIPBOARD_WEBPACK_ENTRY: string;
declare const ICHI_PRELOAD_WEBPACK_ENTRY: string;

ipcMain.on("log", (event, message) => {
  console.log(message);
});

ipcMain.handle("get/libPath", async (event) => {
    // Some libraries (like clipboard-event) can't get packaged in order to work (for example because they use executable files)
    // Those libraries are in the src/lib folder and this function returns its path for both unpackaged and packaged versions
    // So use this function whenever you use a module from the src/lib path
    return app.isPackaged ? path.join(process.resourcesPath, 'lib') : path.join(process.cwd(), 'src', 'lib');
});

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = (): void => {
  log.info('Log from the main process');
  const readerWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  readerWindow.loadURL(READER_WEBPACK_ENTRY);
  readerWindow.webContents.openDevTools();

  const clipboardWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  clipboardWindow.loadURL(CLIPBOARD_WEBPACK_ENTRY);
  clipboardWindow.webContents.openDevTools();

  const ichiWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: ICHI_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  ichiWindow.loadURL('https://ichi.moe/cl/qr/?q=&r=kana');
  ichiWindow.webContents.openDevTools();
};


app.whenReady().then(() => {
  createWindow();

    app.on('browser-window-focus', () => {
    globalShortcut.register('CommandOrControl+R', () => { });
    globalShortcut.register('Control+W', () => { });
    globalShortcut.register('F5', () => { });
  });

  app.on('browser-window-blur', () => {
    globalShortcut.unregister('CommandOrControl+R');
    globalShortcut.unregister('Control+W');
    globalShortcut.unregister('F5');
  });
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});