import { BrowserWindow, ipcMain } from "electron";

import { showWindowWhenReady, createWindowAndStorePositionData } from "@globals/ts/main/helpers";
import log from 'electron-log';

export const createDictionaryWindow = (webpack_entry: string): BrowserWindow => {
  log.debug("Creating dictionary BrowserWindow...")

  const dictionaryWindow = createWindowAndStorePositionData("dictionary", {
    height: 600,
    width: 800,
    show: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  dictionaryWindow.loadURL(webpack_entry);
  if (process.env.JAPREADER_ENV === 'dev') dictionaryWindow.webContents.openDevTools();

  showWindowWhenReady(dictionaryWindow, true);

  dictionaryWindow.on('close', (event: any) => {
    event.preventDefault();
    dictionaryWindow.hide();
  });

  dictionaryWindow.on('blur', (event: any) => {
    dictionaryWindow.webContents.send('blur')
  })

  ipcMain.on('openDict', () => {
    dictionaryWindow.show();
  });

  ipcMain.on('hideDict', () => {
    dictionaryWindow.hide();
  });

  ipcMain.on('sendWordData', (event, wordData) => {
    dictionaryWindow.webContents.send('receiveWordData', wordData);
  });

  ipcMain.on('sendTranslation', (event, englishText) => {
    dictionaryWindow.webContents.send('receiveTranslation', englishText);
  });

  ipcMain.on("announce/reader/isReady", (event) =>  { 
    dictionaryWindow.webContents.send("announce/reader/isReady")
  });

  return dictionaryWindow;
}