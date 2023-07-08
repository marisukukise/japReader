import { app, dialog, BrowserWindow, ipcMain } from "electron";

import { showWindowWhenReady, createWindowAndStorePositionData } from "@globals/ts/main/helpers";

import log from 'electron-log';
import { IPC_CHANNELS } from "@globals/ts/main/objects";

import { getSettingsStore } from "@globals/ts/main/initializeStore";
const settingsStore = getSettingsStore();
const { useReader } = settingsStore.get("options")

export const createTranslationWindow = (webpack_entry: string): BrowserWindow => {
  log.debug("Creating translation BrowserWindow...")

  const translationWindow = createWindowAndStorePositionData("translation", {
    height: 600,
    width: 800,
    show: false,
    zoomFactor: 1.0,
    // frame: false,
    // transparent: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });



  translationWindow.loadURL(webpack_entry);
  if (process.env.JAPREADER_ENV === 'dev') translationWindow.webContents.openDevTools();


  ipcMain.on('fadeText', (event, shouldFade) => {
    translationWindow.webContents.send('fadeText', shouldFade);
  });

  ipcMain.on(IPC_CHANNELS.DEEP.ANNOUNCE.TRANSLATED_TEXT, (event, sourceText, targetText) => {
    translationWindow.webContents.send(IPC_CHANNELS.DEEP.ANNOUNCE.TRANSLATED_TEXT, sourceText, targetText);
  });

  translationWindow.on('blur', (event: any) => {
    translationWindow.webContents.send('blur')
  })

  ipcMain.on('requestTranslation', () => {
    translationWindow.webContents.send('requestTranslation');
  });

  ipcMain.on(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.TOO_MANY_CHARACTERS, () => {
    translationWindow.webContents.send(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.TOO_MANY_CHARACTERS);
  });


  ipcMain.on(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.CHANGE_DETECTED, () => {
    translationWindow.webContents.send(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.CHANGE_DETECTED);
  });


  ipcMain.on(IPC_CHANNELS.DEEP.ANNOUNCE.CONNECTION_ERROR, () => {
    translationWindow.webContents.send(IPC_CHANNELS.DEEP.ANNOUNCE.CONNECTION_ERROR);
  });

  if (!useReader) {
    translationWindow.on('close', (event: any) => {
      const choice = dialog.showMessageBoxSync(translationWindow,
        {
          type: 'question',
          buttons: ['Yes', 'No'],
          title: 'Confirm',
          message: 'Are you sure you want to quit?'
        });
      if (choice == 1) {
        event.preventDefault();
      }
      else {
        BrowserWindow.getAllWindows().filter(win => win.id != translationWindow.id)
          .forEach(win => {
            win.close()
          })
        app.exit();
      }
    });
  }
  else {
    translationWindow.on('close', (event: any) => {
      event.preventDefault();
      translationWindow.hide();
    });
  }

  ipcMain.on(IPC_CHANNELS.DEEP.ANNOUNCE.IS_READY, (event) => {
    translationWindow.webContents.send(IPC_CHANNELS.DEEP.ANNOUNCE.IS_READY)
  });

  ipcMain.on(IPC_CHANNELS.TRANSLATION.SET.BACKGROUND_COLOR, (event, value) => {
    translationWindow.setBackgroundColor(value);
  });

  ipcMain.on(IPC_CHANNELS.TRANSLATION.SET.ALWAYS_ON_TOP, (event, value) => {
    translationWindow.setAlwaysOnTop(value, 'screen-saver')
  })

  ipcMain.on(IPC_CHANNELS.READER.SET.FOCUS, () => {
    translationWindow.focus();
  });

  showWindowWhenReady(translationWindow, true);

  return translationWindow;
}