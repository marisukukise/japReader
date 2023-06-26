// This is the main process file
// Learn more: https://www.electronjs.org/docs/latest/tutorial/process-model#the-main-process

import { app, BrowserWindow, ipcMain } from 'electron';
declare const READER_WEBPACK_ENTRY: string;
declare const READER_PRELOAD_WEBPACK_ENTRY: string;
declare const ICHI_WEBPACK_ENTRY: string;
declare const ICHI_PRELOAD_WEBPACK_ENTRY: string;

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = (): void => {
  const readerWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: READER_PRELOAD_WEBPACK_ENTRY,
    },
  });

  readerWindow.loadURL(READER_WEBPACK_ENTRY);
  readerWindow.webContents.openDevTools();

  const ichiWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: ICHI_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  ichiWindow.loadURL(ICHI_WEBPACK_ENTRY);
  ichiWindow.webContents.openDevTools();
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
