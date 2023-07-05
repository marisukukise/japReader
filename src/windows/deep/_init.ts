import { BrowserWindow, ipcMain } from "electron";

import { showWindowWhenReady, createWindowAndStorePositionData } from "@globals/ts/main/helpers";
import log from 'electron-log';


import { getSettingsStore } from "@globals/ts/main/initializeStore";
const settingsStore = getSettingsStore();
const { useDeepLApi } = settingsStore.get("options")

export const createDeepWindow = (preload_webpack_entry: string, webpack_entry: string): BrowserWindow => {
  log.debug("Creating deep BrowserWindow...")

  const deepWindow = createWindowAndStorePositionData("deep", {
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

  deepWindow.on('close', (event: any) => {
    event.preventDefault();
    deepWindow.hide();
  });

  ipcMain.on('announce/clipboard/changeDetected', (event, text) => {
    deepWindow.webContents.send('announce/clipboard/changeDetected', text);
  });


  return deepWindow;
}