
import { app, dialog, BrowserWindow, ipcMain } from "electron";

import { showWindowWhenReady, createWindowAndStorePositionData } from "@globals/ts/main/helpers";
import log from 'electron-log';
import { IPC_CHANNELS } from "@globals/ts/main/objects";

export const createReaderWindow = (webpack_entry: string): BrowserWindow => {
  log.debug("Creating reader BrowserWindow...")

  const readerWindow = createWindowAndStorePositionData("reader", {
    height: 600,
    width: 800,
    show: false,
    zoomFactor: 1.0,
    // frame: false,
    // transparent: true,
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

  ipcMain.on(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.TOO_MANY_CHARACTERS, () => {
    readerWindow.webContents.send(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.TOO_MANY_CHARACTERS);
  });

  ipcMain.on(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.CHANGE_DETECTED, () => {
    readerWindow.webContents.send(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.CHANGE_DETECTED);
  });

  ipcMain.on(IPC_CHANNELS.ICHI.ANNOUNCE.CONNECTION_ERROR, () => {
    readerWindow.webContents.send(IPC_CHANNELS.ICHI.ANNOUNCE.CONNECTION_ERROR);
  });

  ipcMain.on(IPC_CHANNELS.ICHI.ANNOUNCE.PARSED_WORDS_DATA, (event, words, fullText) => {
    readerWindow.webContents.send(IPC_CHANNELS.ICHI.ANNOUNCE.PARSED_WORDS_DATA, words, fullText);
  });

  ipcMain.on(IPC_CHANNELS.READER.ANNOUNCE.WORD_STATUS_CHANGE_DETECTED, (event, dictionaryForm, desiredStatus) => {
    readerWindow.webContents.send(IPC_CHANNELS.READER.ANNOUNCE.WORD_STATUS_CHANGE_DETECTED, dictionaryForm, desiredStatus)
  })

  ipcMain.on(IPC_CHANNELS.ICHI.ANNOUNCE.IS_READY, (event) => {
    readerWindow.webContents.send(IPC_CHANNELS.ICHI.ANNOUNCE.IS_READY)
  });

  ipcMain.on(IPC_CHANNELS.READER.SET.BACKGROUND_COLOR, (event, value) => {
    readerWindow.setBackgroundColor(value);
  });

  ipcMain.on(IPC_CHANNELS.READER.SET.ALWAYS_ON_TOP, (event, value) => {
    readerWindow.setAlwaysOnTop(value, 'screen-saver')
  })

  ipcMain.on(IPC_CHANNELS.READER.SET.FOCUS, () => {
    readerWindow.focus();
  });

  return readerWindow;
}