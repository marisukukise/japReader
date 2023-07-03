import { dialog, BrowserWindow, ipcMain } from "electron";

import { showWindowWhenReady, createWindowAndStorePositionData } from "@globals/ts/helpers";
import log from 'electron-log';

export const createSettingsWindow = (webpack_entry: string): BrowserWindow => {
  log.debug("Creating settings BrowserWindow...")

  const settingsWindow = createWindowAndStorePositionData("settings", {
    height: 600,
    width: 800,
    show: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  settingsWindow.loadURL(webpack_entry);
  if (process.env.JAPREADER_ENV === 'dev') settingsWindow.webContents.openDevTools();

  showWindowWhenReady(settingsWindow, true);

  settingsWindow.on('close', (event: any) => {
    event.preventDefault();
    settingsWindow.hide();
  });

  settingsWindow.on('blur', (event: any) => {
    settingsWindow.webContents.send('blur')
  })

  ipcMain.on('openOptions', () => {
    settingsWindow.show();
  });

  ipcMain.on('hideOptions', () => {
    settingsWindow.hide();
  });

  ipcMain.handle('showDialog', async (e, message) => {
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