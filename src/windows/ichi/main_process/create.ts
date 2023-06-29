import { BrowserWindow, ipcMain } from "electron";
// @ts-expect-error @globals is a webpack alias
import { showWindowWhenReady } from "@globals/ts/helpers";
import log from 'electron-log';

export const createIchiWindow = (preload_webpack_entry: string): BrowserWindow => {
  log.debug("Creating ichi BrowserWindow...")

  const ichiWindow = new BrowserWindow({
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

  ichiWindow.on('close', (e) => {
    e.preventDefault();
    ichiWindow.hide();
  });

  ipcMain.on('clipboardChanged', (event, text) => {
    ichiWindow.webContents.send('parseWithIchi', text);
  });


  return ichiWindow;
}