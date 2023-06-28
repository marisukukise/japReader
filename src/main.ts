// This is the main process file
// Learn more: https://www.electronjs.org/docs/latest/tutorial/process-model#the-main-process

/* To turn on logging, create a file named '.env' in the root of the repository
  Available variables: 
  - JAPREADER_LOGS (with log level value: https://github.com/megahertz/electron-log#log-levels)
  - JAPREADER_SHOW_ALL_WINDOWS ("true" for yes, otherwise no)
*/

import { dialog, app, BrowserWindow, globalShortcut, ipcMain } from 'electron';
import 'dotenv/config';
import log from 'electron-log';
const path = require('path');

const useDeepLApi = false;
const useDeepL = true;
const useReader = true;

log.initialize({ preload: true });

// Reading the log level from the environment variable, and if not applicable, then set default (in else)
if (["error", "warn", "info", "verbose", "debug", "silly"].includes(process.env.JAPREADER_LOGS)) {
  // @ts-expect-error
  log.transports.file.level = process.env.JAPREADER_LOGS;
  // @ts-expect-error
  log.transports.console.level = process.env.JAPREADER_LOGS;
} else {
  log.transports.file.level = "info";
  log.transports.console.level = "warn";
}

log.errorHandler.startCatching({
  showDialog: false,
  onError({ createIssue, error, processType, versions }) {
    if (processType === 'renderer') {
      return;
    }
    dialog.showMessageBox({
      title: 'An error occurred',
      message: error.message,
      detail: error.stack,
      type: 'error',
      buttons: ['Ignore', 'Report on github', 'Exit'],
    }).then((result) => {
      if (result.response === 1) {
        createIssue('https://github.com/marisukukise/japReader/issues/new', {
          title: `[ERROR] Report for ${versions.app}`,
          body: 'Error message:\n```' + error.stack + '\n```\n\n' + `OS: ${versions.os}\n\nDescription of what lead to the error:\n\n\n\nAdditional info (optional):\n\n`
        });
        return;
      }
      if (result.response === 2) {
        app.quit();
      }
    });
  }
});

log.silly('Initialized the main process');

declare const READER_WEBPACK_ENTRY: string;
declare const DICTIONARY_WEBPACK_ENTRY: string;
declare const SETTINGS_WEBPACK_ENTRY: string;
declare const TRANSLATION_WEBPACK_ENTRY: string;
declare const CLIPBOARD_WEBPACK_ENTRY: string;
declare const ICHI_PRELOAD_WEBPACK_ENTRY: string;
declare const DEEP_WEBPACK_ENTRY: string;
declare const DEEP_PRELOAD_WEBPACK_ENTRY: string;

ipcMain.on("log", (event, message) => {
  console.log(message);
});

ipcMain.on('restartProgram', () => {
  app.relaunch();
  app.exit();
});

ipcMain.handle("get/libPath", async (event) => {
  // Some libraries (like clipboard-event) can't get packaged in order to work (for example because they use executable files)
  // Those libraries are in the src/lib folder and this function returns its path for both unpackaged and packaged versions
  // So use this function whenever you use a module from the src/lib path
  return app.isPackaged ? path.join(process.resourcesPath, 'lib') : path.join(process.cwd(), 'src', 'lib');
});


const showWindowWhenReady = (window: BrowserWindow, shouldShowInProduction: boolean): void => {
  // Set the environment variable JAPREADER_SHOW_ALL_WINDOWS to "true" to show all windows

  if (shouldShowInProduction) {
    window.once('ready-to-show', () => { window.show(); });
    return;
  }

  // Added for debugging convenience
  if (process.env.JAPREADER_SHOW_ALL_WINDOWS === "true") {
    window.once('ready-to-show', () => { window.show(); });
    return;
  }
}

const createReaderWindow = (): BrowserWindow => {
  const readerWindow = new BrowserWindow({
    height: 600,
    width: 800,
    show: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  readerWindow.loadURL(READER_WEBPACK_ENTRY);
  readerWindow.webContents.openDevTools();

  showWindowWhenReady(readerWindow, true);

  readerWindow.on('close', (e) => {
    const choice = dialog.showMessageBoxSync(readerWindow,
      {
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message: 'Are you sure you want to quit?'
      });
    if (choice == 1) {
      e.preventDefault();
    }
    else {
      BrowserWindow.getAllWindows().filter(win => win.id != readerWindow.id)
        .forEach(win => {
          win.close()
        })
      app.exit();
    }
  });

  ipcMain.on('tooManyCharacters', () => {
    readerWindow.webContents.send('tooManyCharacters');
  });

  ipcMain.on('parseNotification', () => {
    readerWindow.webContents.send('parseNotification');
  });

  ipcMain.on('ichiConnected', () => {
    readerWindow.webContents.send('ichiConnected');
  });

  ipcMain.on('ichiConnectionError', () => {
    readerWindow.webContents.send('ichiConnectionError');
  });

  ipcMain.on('sendParsedData', (event, words, fullText) => {
    readerWindow.webContents.send('receiveParsedData', words, fullText);
  });

  ipcMain.on('refreshReader', () => {
    readerWindow.webContents.send('refreshReader');
  });

  return readerWindow;
}

const createClipboardWindow = (): BrowserWindow => {
  const clipboardWindow = new BrowserWindow({
    height: 600,
    width: 800,
    show: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  clipboardWindow.loadURL(CLIPBOARD_WEBPACK_ENTRY);
  clipboardWindow.webContents.openDevTools();

  showWindowWhenReady(clipboardWindow, false);

  clipboardWindow.on('close', (e) => {
    e.preventDefault();
    clipboardWindow.hide();
  });

  return clipboardWindow;
}

const createIchiWindow = (): BrowserWindow => {
  const ichiWindow = new BrowserWindow({
    height: 600,
    width: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: ICHI_PRELOAD_WEBPACK_ENTRY,
    },
  });

  ichiWindow.loadURL('https://ichi.moe/cl/qr/?q=&r=kana');
  ichiWindow.webContents.openDevTools();

  showWindowWhenReady(ichiWindow, false);

  ichiWindow.on('close', (e) => {
    e.preventDefault();
    ichiWindow.hide();
  });

  ipcMain.on('clipboardChanged', (event, text) => {
    ichiWindow.webContents.send('parseWithIchi', text);
  });


  return ichiWindow;
}

const createDeepWindow = (): BrowserWindow => {
  const deepWindow = new BrowserWindow({
    height: 600,
    width: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: DEEP_PRELOAD_WEBPACK_ENTRY,
    },
  });

  deepWindow.loadURL(useDeepLApi ? DEEP_WEBPACK_ENTRY : 'https://www.deepl.com/translator#ja/en/');
  deepWindow.webContents.openDevTools();

  showWindowWhenReady(deepWindow, false);

  deepWindow.on('close', (e) => {
    e.preventDefault();
    deepWindow.hide();
  });

  ipcMain.on('clipboardChanged', (event, text) => {
    deepWindow.webContents.send('translateWithDeepL', text);
  });


  return deepWindow;
}

const createTranslationWindow = (): BrowserWindow => {
  const translationWindow = new BrowserWindow({
    height: 600,
    width: 800,
    show: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  translationWindow.loadURL(TRANSLATION_WEBPACK_ENTRY);
  translationWindow.webContents.openDevTools();



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
    translationWindow.on('close', (e) => {
      const choice = dialog.showMessageBoxSync(translationWindow,
        {
          type: 'question',
          buttons: ['Yes', 'No'],
          title: 'Confirm',
          message: 'Are you sure you want to quit?'
        });
      if (choice == 1) {
        e.preventDefault();
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
    translationWindow.on('close', (e) => {
      e.preventDefault();
      translationWindow.hide();
    });
  }


  showWindowWhenReady(translationWindow, true);

  return translationWindow;
}

const createDictionaryWindow = (): BrowserWindow => {
  const dictionaryWindow = new BrowserWindow({
    height: 600,
    width: 800,
    show: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  dictionaryWindow.loadURL(DICTIONARY_WEBPACK_ENTRY);
  dictionaryWindow.webContents.openDevTools();

  showWindowWhenReady(dictionaryWindow, true);

  dictionaryWindow.on('close', (e) => {
    e.preventDefault();
    dictionaryWindow.hide();
  });
  ipcMain.on('openDict', () => {
    dictionaryWindow.show();
  });

  ipcMain.on('hideDict', () => {
    dictionaryWindow.hide();
  });

  ipcMain.on('sendWordData', (event, wordData) => {
    dictionaryWindow.webContents.send('receiveWordData', wordData);
  });

  ipcMain.on('sendTranslation', (event, englishText) => {
    dictionaryWindow.webContents.send('receiveTranslation', englishText);
  });

  return dictionaryWindow;
}

const createSettingsWindow = (): BrowserWindow => {
  const settingsWindow = new BrowserWindow({
    height: 600,
    width: 800,
    show: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  settingsWindow.loadURL(SETTINGS_WEBPACK_ENTRY);
  settingsWindow.webContents.openDevTools();

  showWindowWhenReady(settingsWindow, true);

  settingsWindow.on('close', (event) => {
    event.preventDefault();
    settingsWindow.hide();
  });

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



const initializeApp = (): void => {

  const clipboardWindow = createClipboardWindow();
  const ichiWindow = createIchiWindow();
  if (useReader) {
    const readerWindow = createReaderWindow();
  }
  if (useDeepL) {
    const deepWindow = createDeepWindow();
    const translationWindow = createTranslationWindow();
  }
  const dictionaryWindow = createDictionaryWindow();
  const settingsWindow = createSettingsWindow();

};


if (require('electron-squirrel-startup')) {
  app.quit();
}

app.whenReady().then(() => {
  initializeApp();

  app.on('browser-window-focus', () => {
    globalShortcut.register('CommandOrControl+R', () => { });
    globalShortcut.register('Control+W', () => { });
    globalShortcut.register('F5', () => { });
  });

  app.on('browser-window-blur', () => {
    globalShortcut.unregister('CommandOrControl+R');
    globalShortcut.unregister('Control+W');
    globalShortcut.unregister('F5');
  });
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) initializeApp();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});