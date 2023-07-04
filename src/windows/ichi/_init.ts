import { BrowserWindow, ipcMain } from "electron";

import { showWindowWhenReady, createWindowAndStorePositionData } from "@globals/ts/main/helpers";
import log from 'electron-log';

export const createIchiWindow = (preload_webpack_entry: string): BrowserWindow => {
  log.debug("Creating ichi BrowserWindow...")

  const ichiWindow = createWindowAndStorePositionData("ichi", {
    height: 600,
    width: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: preload_webpack_entry,
    },
  });

  ichiWindow.loadURL('https://ichi.moe/cl/qr/?q=&r=kana');
  if (process.env.JAPREADER_ENV === 'dev') ichiWindow.webContents.openDevTools();

  showWindowWhenReady(ichiWindow, false);

  ichiWindow.on('close', (event: any) => {
    event.preventDefault();
    ichiWindow.hide();
  });

  ipcMain.on('announce/clipboard/changeDetected', (event, text) => {
    ichiWindow.webContents.send('announce/clipboard/changeDetected', text);
  });


  ipcMain.on("announce/clipboard/isReady", (event) =>  { 
    ichiWindow.webContents.send("announce/clipboard/isReady")
  });

  return ichiWindow;
}