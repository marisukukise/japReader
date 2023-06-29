import { BrowserWindow, ipcMain } from "electron";
// @ts-expect-error @globals is a webpack alias
import { showWindowWhenReady } from "@globals/ts/helpers";
import log from 'electron-log';

const useDeepLApi = false;

export const createDeepWindow = (preload_webpack_entry: string, webpack_entry: string): BrowserWindow => {
  log.debug("Creating deep BrowserWindow...")

  const deepWindow = new BrowserWindow({
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

  deepWindow.loadURL(useDeepLApi ? webpack_entry : 'https://www.deepl.com/translator#ja/en/');
  if (process.env.JAPREADER_ENV === 'dev') deepWindow.webContents.openDevTools();

  showWindowWhenReady(deepWindow, false);

  deepWindow.on('close', (e) => {
    e.preventDefault();
    deepWindow.hide();
  });

  ipcMain.on('clipboardChanged', (event, text) => {
    deepWindow.webContents.send('translateWithDeepL', text);
  });


  return deepWindow;
}