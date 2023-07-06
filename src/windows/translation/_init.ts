import { app, dialog, BrowserWindow, ipcMain } from "electron";

import { showWindowWhenReady, createWindowAndStorePositionData } from "@globals/ts/main/helpers";

import log from 'electron-log';

import { getSettingsStore } from "@globals/ts/main/initializeStore";
const settingsStore = getSettingsStore();
const { useReader } = settingsStore.get("options")

export const createTranslationWindow = (webpack_entry: string): BrowserWindow => {
  log.debug("Creating translation BrowserWindow...")

  const translationWindow = createWindowAndStorePositionData("translation", {
    height: 600,
    width: 800,
    show: false,
    frame: false,
    transparent: true,
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

  ipcMain.on('set/deep/translationText', (event, sourceText, targetText) => {
    translationWindow.webContents.send('set/deep/translationText', sourceText, targetText);
  });

  translationWindow.on('blur', (event: any) => {
    translationWindow.webContents.send('blur')
  })

  ipcMain.on('requestTranslation', () => {
    translationWindow.webContents.send('requestTranslation');
  });

  ipcMain.on('announce/clipboard/tooManyCharacters', () => {
    translationWindow.webContents.send('announce/clipboard/tooManyCharacters');
  });


  ipcMain.on('announce/clipboard/changeDetected', () => {
    translationWindow.webContents.send('announce/clipboard/changeDetected');
  });


  ipcMain.on('announce/deep/connectionError', () => {
    translationWindow.webContents.send('announce/deep/connectionError');
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

  ipcMain.on("announce/deep/isReady", (event) => {
    translationWindow.webContents.send("announce/deep/isReady")
  });

  ipcMain.on('set/translation/windowBackgroundColor', (event, value) => {
    translationWindow.setBackgroundColor(value);
  });

  ipcMain.on('set/translation/onTop', (event, value) => {
    translationWindow.setAlwaysOnTop(value, 'screen-saver')
  })

  showWindowWhenReady(translationWindow, true);

  return translationWindow;
}