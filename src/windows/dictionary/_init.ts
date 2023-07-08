import { BrowserWindow } from "electron";

import { showWindowWhenReady, createWindowAndStorePositionData, setDefaultVisibleWindowSettings, passMessageToRenderer } from "@globals/ts/main/helpers";
import { IPC_CHANNELS } from "@globals/ts/main/objects";

export const createDictionaryWindow = (webpack_entry: string): BrowserWindow => {
  const dictionaryWindow = createWindowAndStorePositionData("dictionary", {
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

  dictionaryWindow.loadURL(webpack_entry);
  setDefaultVisibleWindowSettings(dictionaryWindow, 'dictionary', IPC_CHANNELS.DICTIONARY);
  showWindowWhenReady(dictionaryWindow, false);

  dictionaryWindow.on('close', (event: any) => {
    event.preventDefault();
    dictionaryWindow.hide();
  });

  passMessageToRenderer(dictionaryWindow, IPC_CHANNELS.READER.ANNOUNCE.EXTENDED_WORDS_DATA)
  passMessageToRenderer(dictionaryWindow, IPC_CHANNELS.READER.ANNOUNCE.IS_READY)

  return dictionaryWindow;
}