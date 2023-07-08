import { BrowserWindow, ipcMain } from "electron";

import { showWindowWhenReady, createWindowAndStorePositionData } from "@globals/ts/main/helpers";
import log from 'electron-log';
import { IPC_CHANNELS } from "@globals/ts/main/objects";

export const createDictionaryWindow = (webpack_entry: string): BrowserWindow => {
  log.debug("Creating dictionary BrowserWindow...")

  const dictionaryWindow = createWindowAndStorePositionData("dictionary", {
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

  dictionaryWindow.loadURL(webpack_entry);
  if (process.env.JAPREADER_ENV === 'dev') dictionaryWindow.webContents.openDevTools();

  showWindowWhenReady(dictionaryWindow, false);

  dictionaryWindow.on('close', (event: any) => {
    event.preventDefault();
    dictionaryWindow.hide();
  });

  dictionaryWindow.on('blur', (event: any) => {
    dictionaryWindow.webContents.send('blur')
  })

  ipcMain.on(IPC_CHANNELS.DICTIONARY.SET.OPEN, () => {
    dictionaryWindow.show();
  });

  ipcMain.on(IPC_CHANNELS.READER.ANNOUNCE.EXTENDED_WORDS_DATA, (event, word: japReader.ExtendedWordData) => {
    dictionaryWindow.webContents.send(IPC_CHANNELS.READER.ANNOUNCE.EXTENDED_WORDS_DATA, word);
  });

  ipcMain.on(IPC_CHANNELS.READER.ANNOUNCE.IS_READY, (event) =>  { 
    dictionaryWindow.webContents.send(IPC_CHANNELS.READER.ANNOUNCE.IS_READY)
  });

  ipcMain.on(IPC_CHANNELS.DICTIONARY.SET.BACKGROUND_COLOR, (event, value) => {
    dictionaryWindow.setBackgroundColor(value);
  });

  ipcMain.on(IPC_CHANNELS.DICTIONARY.SET.ALWAYS_ON_TOP, (event, value) => {
    dictionaryWindow.setAlwaysOnTop(value, 'screen-saver')
  })

  return dictionaryWindow;
}