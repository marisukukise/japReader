
import { app, dialog, BrowserWindow, ipcMain } from "electron";

import { showWindowWhenReady, createWindowAndStorePositionData } from "@globals/ts/main/helpers";
import log from 'electron-log';

export const createReaderWindow = (webpack_entry: string): BrowserWindow => {
  log.debug("Creating reader BrowserWindow...")

  const readerWindow = createWindowAndStorePositionData("reader", {
    height: 600,
    width: 800,
    show: false,
    frame: false,
    transparent: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  readerWindow.loadURL(webpack_entry);
  if (process.env.JAPREADER_ENV === 'dev') readerWindow.webContents.openDevTools();

  showWindowWhenReady(readerWindow, true);

  readerWindow.on('close', (event: any) => {
    const choice = dialog.showMessageBoxSync(readerWindow,
      {
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message: 'Are you sure you want to quit?'
      });
    if (choice == 1) {
      event.preventDefault();
    }
    else {
      BrowserWindow.getAllWindows().filter(win => win.id != readerWindow.id)
        .forEach(win => {
          win.close()
        })
      app.exit();
    }
  });

  readerWindow.on('blur', (event: any) => {
    readerWindow.webContents.send('blur')
  })

  ipcMain.on('announce/clipboard/tooManyCharacters', () => {
    readerWindow.webContents.send('announce/clipboard/tooManyCharacters');
  });

  ipcMain.on('announce/clipboard/changeDetected', () => {
    readerWindow.webContents.send('announce/clipboard/changeDetected');
  });

  ipcMain.on('announce/ichi/connectionError', () => {
    readerWindow.webContents.send('announce/ichi/connectionError');
  });

  ipcMain.on('set/ichi/wordData', (event, words, fullText) => {
    readerWindow.webContents.send('set/ichi/wordData', words, fullText);
  });

  ipcMain.on('refreshReader', () => {
    readerWindow.webContents.send('refreshReader');
  });

  ipcMain.on("announce/ichi/isReady", (event) => {
    readerWindow.webContents.send("announce/ichi/isReady")
  });

  ipcMain.on('set/reader/windowBackgroundColor', (event, value) => {
    readerWindow.setBackgroundColor(value);
  });

  ipcMain.on('set/reader/onTop', (event, value) => {
    readerWindow.setAlwaysOnTop(value, 'screen-saver')
  })

  ipcMain.on('set/reader/open', () => {
    readerWindow.show();
  });

  return readerWindow;
}