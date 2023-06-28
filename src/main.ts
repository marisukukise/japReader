// This is the main process file
// Learn more: https://www.electronjs.org/docs/latest/tutorial/process-model#the-main-process

// To turn on logging, create a file named '.env' in the root of the repository with contents 'JAPREADER_ENV="dev"'

import { dialog, app, BrowserWindow, globalShortcut, ipcMain } from 'electron';
import 'dotenv/config';
import log from 'electron-log';
const path = require('path');

log.initialize({ preload: true });
log.transports.file.level = process.env.JAPREADER_ENV === "dev" ? "silly": false;
log.transports.console.level = process.env.JAPREADER_ENV === "dev" ? "silly": false;

log.errorHandler.startCatching({
  showDialog: false,
  onError({ createIssue, error, processType, versions }) {
    if (processType === 'renderer') {
      return;
    } 
    dialog.showMessageBox({
      title: 'An error occurred',
      message: error.message,
      detail: error.stack,
      type: 'error',
      buttons: ['Ignore', 'Report', 'Exit'],
    }).then((result) => {
        if (result.response === 1) {
          createIssue('https://github.com/marisekukisu/japReader-React/issues/new', {
            title: `Error report for ${versions.app}`,
            body: 'Error:\n```' + error.stack + '\n```\n' + `OS: ${versions.os}`
          });
          return;
        }
        if (result.response === 2) {
          app.quit();
        }
      });
  }
});
log.debug('Initialized the main process');

declare const READER_WEBPACK_ENTRY: string;
declare const ICHI_WEBPACK_ENTRY: string;
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

  ipcMain.on('sendParsedData', (event, words, fullText) => {
    readerWindow.webContents.send('receiveParsedData', words, fullText);
  });

  ipcMain.on('ichiConnected', () => {
    readerWindow.webContents.send('ichiConnected');
  });

  ipcMain.on('ichiConnectionError', () => {
    readerWindow.webContents.send('ichiConnectionError');
  });

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
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: ICHI_PRELOAD_WEBPACK_ENTRY,
    },
  });

  ichiWindow.loadURL('https://ichi.moe/cl/qr/?q=&r=kana');
  ichiWindow.webContents.openDevTools();

  ipcMain.on('clipboardChanged', (event, text) => {
    ichiWindow.webContents.send('parseWithIchi', text);
  });
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