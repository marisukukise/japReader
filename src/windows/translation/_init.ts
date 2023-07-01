import { app, dialog, BrowserWindow, ipcMain } from "electron";

import { showWindowWhenReady, createWindowAndStorePositionData } from "@globals/ts/helpers";

import log from 'electron-log';

import { getSettingsStore } from "@globals/ts/initializeStore";
const settingsStore = getSettingsStore();
const { useReader } = settingsStore.get("options")

export const createTranslationWindow = (webpack_entry: string): BrowserWindow => {
  log.debug("Creating translation BrowserWindow...")

  const translationWindow = createWindowAndStorePositionData("translation", {
    height: 600,
    width: 800,
    show: false,
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

  ipcMain.on('showTranslation', (event, sourceText, targetText) => {
    translationWindow.webContents.send(
      'showTranslation',
      sourceText,
      targetText
    );
  });

  ipcMain.on('requestTranslation', () => {
    translationWindow.webContents.send('requestTranslation');
  });

  ipcMain.on('tooManyCharacters', () => {
    translationWindow.webContents.send('tooManyCharacters');
  });

  ipcMain.on('translateNotification', () => {
    translationWindow.webContents.send('translateNotification');
  });

  ipcMain.on('deepLConnected', () => {
    translationWindow.webContents.send('deepLConnected');
  });

  ipcMain.on('deepLConnectionError', () => {
    translationWindow.webContents.send('deepLConnectionError');
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

  ipcMain.on("set/deep/isReady", (event) =>  { 
    translationWindow.webContents.send("set/deep/isReady")
  });

  showWindowWhenReady(translationWindow, true);

  return translationWindow;
}