import { dialog, BrowserWindow, ipcMain } from "electron";

import { showWindowWhenReady, createWindowAndStorePositionData, setDefaultVisibleWindowSettings } from "@globals/ts/main/helpers";
import log from 'electron-log';
import { IPC_CHANNELS } from "@globals/ts/main/objects";

import { getWindowStore } from "@globals/ts/main/initializeStore";
const windowStore = getWindowStore();

export const createSettingsWindow = (webpack_entry: string): BrowserWindow => {
  const settingsWindow = createWindowAndStorePositionData("settings", {
    height: 600,
    width: 800,
    show: false,
    zoomFactor: 1.0,
    frame: false,
    transparent: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  settingsWindow.loadURL(webpack_entry);
  setDefaultVisibleWindowSettings(settingsWindow, 'settings', IPC_CHANNELS.SETTINGS);
  showWindowWhenReady(settingsWindow, false);

  settingsWindow.on('close', (event: any) => {
    event.preventDefault();
    settingsWindow.hide();
  });

  return settingsWindow;
}