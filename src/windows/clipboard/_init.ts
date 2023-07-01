import { BrowserWindow, ipcMain } from "electron";
// @ts-expect-error @globals is a webpack alias
import { showWindowWhenReady, createWindowAndStorePositionData } from "@globals/ts/helpers";
import log from 'electron-log';

export const createClipboardWindow = (webpack_entry: string): BrowserWindow => {
  log.debug("Creating clipboard BrowserWindow...")

  const clipboardWindow = createWindowAndStorePositionData("clipboard", {
    height: 600,
    width: 800,
    show: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  clipboardWindow.loadURL(webpack_entry);
  if (process.env.JAPREADER_ENV === 'dev') clipboardWindow.webContents.openDevTools();

  showWindowWhenReady(clipboardWindow, false);

  clipboardWindow.on('close', (event: any) => {
    event.preventDefault();
    clipboardWindow.hide();
  });

  return clipboardWindow;
}