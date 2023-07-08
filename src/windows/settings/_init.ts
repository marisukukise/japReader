import { dialog, BrowserWindow, ipcMain } from "electron";

import { showWindowWhenReady, createWindowAndStorePositionData } from "@globals/ts/main/helpers";
import log from 'electron-log';
import { IPC_CHANNELS } from "@globals/ts/main/objects";

export const createSettingsWindow = (webpack_entry: string): BrowserWindow => {
  log.debug("Creating settings BrowserWindow...")

  const settingsWindow = createWindowAndStorePositionData("settings", {
    height: 600,
    width: 800,
    show: false,
    zoomFactor: 1.0,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  settingsWindow.loadURL(webpack_entry);
  if (process.env.JAPREADER_ENV === 'dev') settingsWindow.webContents.openDevTools();

  showWindowWhenReady(settingsWindow, false);

  settingsWindow.on('close', (event: any) => {
    event.preventDefault();
    settingsWindow.hide();
  });

  settingsWindow.on('blur', (event: any) => {
    settingsWindow.webContents.send('blur')
  })

  ipcMain.handle(IPC_CHANNELS.SETTINGS.REQUEST.SHOW_DIALOG, async (e, message) => {
    const result = dialog.showMessageBox(settingsWindow, {
      type: 'question',
      buttons: ['Yes', 'No'],
      title: 'Confirm',
      message: message
    });
    return result;
  })


  return settingsWindow;
}