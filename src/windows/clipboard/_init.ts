import { BrowserWindow } from "electron";

import { showWindowWhenReady, createWindowAndStorePositionData } from "@globals/ts/main/helpers";
import log from 'electron-log';

export const createClipboardWindow = (webpack_entry: string): BrowserWindow => {
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