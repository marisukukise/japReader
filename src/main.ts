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
import { read } from 'original-fs';
const path = require('path');

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
      buttons: ['Ignore', 'Report', 'Exit'],
    }).then((result) => {
        if (result.response === 1) {
          createIssue('https://github.com/marisekukisu/japReader-React/issues/new', {
            title: `Error report for ${versions.app}`,
            body: 'Error:\n```' + error.stack + '\n```\n' + `OS: ${versions.os}`
          });
          return;
        }
        if (result.response === 2) {
          app.quit();
        }
      });
  }
});

log.debug('Initialized the main process');

declare const READER_WEBPACK_ENTRY: string;
declare const CLIPBOARD_WEBPACK_ENTRY: string;
declare const ICHI_PRELOAD_WEBPACK_ENTRY: string;
declare const DEEP_PRELOAD_WEBPACK_ENTRY: string;

ipcMain.on("log", (event, message) => {
  console.log(message);
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
  if(process.env.JAPREADER_SHOW_ALL_WINDOWS === "true") {
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

  ipcMain.on('sendParsedData', (event, words, fullText) => {
    readerWindow.webContents.send('receiveParsedData', words, fullText);
  });

  ipcMain.on('ichiConnected', () => {
    readerWindow.webContents.send('ichiConnected');
  });

  ipcMain.on('ichiConnectionError', () => {
    readerWindow.webContents.send('ichiConnectionError');
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
      preload: ICHI_PRELOAD_WEBPACK_ENTRY,
    },
  });

  deepWindow.loadURL('https://www.deepl.com/translator#ja/en/');
  deepWindow.webContents.openDevTools();

  showWindowWhenReady(deepWindow, false);

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

  translationWindow.loadURL(READER_WEBPACK_ENTRY);
  translationWindow.webContents.openDevTools();

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

  dictionaryWindow.loadURL(READER_WEBPACK_ENTRY);
  dictionaryWindow.webContents.openDevTools();

  showWindowWhenReady(dictionaryWindow, true);

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

  settingsWindow.loadURL(READER_WEBPACK_ENTRY);
  settingsWindow.webContents.openDevTools();

  showWindowWhenReady(settingsWindow, true);

  return settingsWindow;
}



const initializeApp = (): void => {

  const clipboardWindow = createClipboardWindow();
  const ichiWindow = createIchiWindow();
  const readerWindow = createReaderWindow();
  const deepWindow = createDeepWindow();
  const dictionaryWindow = createDictionaryWindow();
  const settingsWindow = createSettingsWindow();
  const translationWindow = createTranslationWindow();

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