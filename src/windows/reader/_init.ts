
import { app, dialog, BrowserWindow, ipcMain } from "electron";

import { showWindowWhenReady, createWindowAndStorePositionData } from "@globals/ts/helpers";
import log from 'electron-log';

export const createReaderWindow = (webpack_entry: string): BrowserWindow => {
  log.debug("Creating reader BrowserWindow...")

  const readerWindow = createWindowAndStorePositionData("reader", {
    height: 600,
    width: 800,
    show: false,
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

  ipcMain.on('tooManyCharacters', () => {
    readerWindow.webContents.send('tooManyCharacters');
  });

  ipcMain.on('parseNotification', () => {
    readerWindow.webContents.send('parseNotification');
  });

  ipcMain.on('ichiConnected', () => {
    readerWindow.webContents.send('ichiConnected');
  });

  ipcMain.on('ichiConnectionError', () => {
    readerWindow.webContents.send('ichiConnectionError');
  });

  ipcMain.on('sendParsedData', (event, words, fullText) => {
    readerWindow.webContents.send('receiveParsedData', words, fullText);
  });

  ipcMain.on('refreshReader', () => {
    readerWindow.webContents.send('refreshReader');
  });

  ipcMain.on("set/ichi/isReady", (event) =>  { 
    readerWindow.webContents.send("set/ichi/isReady")
  });

  return readerWindow;
}