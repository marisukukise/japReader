require('module-alias/register')

const { app, BrowserWindow, ipcMain, globalShortcut, dialog } = require('electron');
const tools = require('@tools');
const log = require('electron-log')
const getCurrentLine = require('get-current-line')

const logFormat = '{level} | {y}-{m}-{d} {h}:{i}:{s}.{ms} | {text}';
if (process.env.NODE_ENV === 'production') {
  log.transports.file.level = false;
  log.transports.console.level = false;
} else {
  log.transports.console.level = 'debug';
  log.transports.console.format = logFormat;
  log.transports.file.level = 'debug';
  log.transports.file.format = logFormat;
}

const Store = require('electron-store')
const WINDOW_SETTINGS = new Store(tools.getWindowStoreOptions());
const OPTIONS = new Store(tools.getOptionsStoreOptions());

if (require('electron-squirrel-startup')) return app.quit();

let readerOnTop = false;
let translationOnTop = false;
let dictOnTop = false;

function createWindow(windowName, windowConfig) {
  Object.assign(windowConfig, WINDOW_SETTINGS.get(windowName))
  const mainWindow = new BrowserWindow(windowConfig)
  if (windowConfig.isMaximized) {
    mainWindow.maximize()
  }
  mainWindow.on("close", () => {
    Object.assign(windowConfig, {
      isMaximized: mainWindow.isMaximized()
    }, mainWindow.getNormalBounds())
    WINDOW_SETTINGS.set(windowName, windowConfig);
  });
  return mainWindow;
}

const { useDeepL, useReader, translationTransparent } = OPTIONS.get('options');

/*
  Creates the following boxes:
  ALWAYS:
    clipboardBox - uses ./boxes/clipboard/*
    optionsBox - uses ./boxes/options/*
  IF (useReader)
    readerBox - uses ./boxes/reader/*
    ichiBox - uses ./boxes/ichi/*
    dictBox - uses ./boxes/dict/*
  IF (useDeepL)
    deepLBox - uses ./boxes/deepl/*
    translationBox - uses ./boxes/translation/*
*/
const createBoxes = () => {
  const clipboardBox = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: tools.dirname_path('./boxes/clipboard/script.js'),
      nodeIntegration: true,
    },
  });

  clipboardBox.loadFile(tools.dirname_path('./boxes/clipboard/index.html'));

  clipboardBox.hide();

  clipboardBox.on('close', (e) => {
    e.preventDefault();
    clipboardBox.hide();
  });

  const optionsBox = createWindow("options", {
    width: 800,
    height: 600,
    frame: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: tools.dirname_path('./boxes/options/script.js'),
      nodeIntegration: true,
    },
  });

  optionsBox.loadFile(tools.dirname_path('./boxes/options/index.html'));

  optionsBox.hide();

  optionsBox.on('close', (e) => {
    e.preventDefault();
    optionsBox.hide();
  });

  ipcMain.on('openOptions', () => {
    optionsBox.show();
  });

  ipcMain.on('hideOptions', () => {
    optionsBox.hide();
  });

  ipcMain.handle('showDialog', async (e, message) => {
    const result = dialog.showMessageBox(optionsBox, {
      type: 'question',
      buttons: ['Yes', 'No'],
      title: 'Confirm',
      message: message
    });
    return result;
  })

  ipcMain.on('restartProgram', () => {
    app.relaunch();
    app.exit();
  });

  if (useReader) {
    const readerBox = createWindow("reader", {
      width: 800,
      height: 200,
      frame: true,
      autoHideMenuBar: true,
      webPreferences: {
        preload: tools.dirname_path('./boxes/reader/script.js'),
        nodeIntegration: true,
      },
    });

    readerBox.loadFile(tools.dirname_path('./boxes/reader/index.html'));


    readerBox.on('close', (e) => {
      const choice = dialog.showMessageBoxSync(readerBox,
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
        BrowserWindow.getAllWindows().filter(win => win.id != readerBox.id)
          .forEach(win => {
            win.close()
          })
        app.exit();
      }
    });

    ipcMain.on('tooManyCharacters', () => {
      readerBox.webContents.send('tooManyCharacters');
    });

    ipcMain.on('parseNotification', () => {
      readerBox.webContents.send('parseNotification');
    });

    ipcMain.on('ichiConnected', () => {
      readerBox.webContents.send('ichiConnected');
    });

    ipcMain.on('ichiConnectionError', () => {
      readerBox.webContents.send('ichiConnectionError');
    });

    ipcMain.on('sendParsedData', (event, words, fullText) => {
      readerBox.webContents.send('receiveParsedData', words, fullText);
    });

    ipcMain.on('refreshReader', () => {
      readerBox.webContents.send('refreshReader');
    });

    ipcMain.on('readyReader', () => {
    });

    ipcMain.on('readerOnTop', () => {
      readerOnTop = !readerOnTop;
      readerBox.setAlwaysOnTop(readerOnTop);
    });


    const ichiBox = new BrowserWindow({
      width: 800,
      height: 600,
      autoHideMenuBar: true,
      webPreferences: {
        contextIsolation: true,
        enableRemoteModule: false,
        preload: tools.dirname_path('./boxes/ichi/script.js'),
        nodeIntegration: true,
      },
    });

    ichiBox.loadURL('https://ichi.moe/cl/qr/?q=&r=kana');

    ichiBox.hide();

    ichiBox.on('close', (e) => {
      e.preventDefault();
      ichiBox.hide();
    });

    ipcMain.on('clipboardChanged', (event, text) => {
      ichiBox.webContents.send('parseWithIchi', text);
    });


    const dictBox = createWindow("dict", {
      width: 400,
      height: 600,
      frame: true,
      autoHideMenuBar: true,
      webPreferences: {
        preload: tools.dirname_path('./boxes/dict/script.js'),
        nodeIntegration: true,
      },
    });


    dictBox.loadFile(tools.dirname_path('./boxes/dict/index.html'));

    dictBox.hide();

    dictBox.on('close', (e) => {
      e.preventDefault();
      dictBox.hide();
    });

    ipcMain.on('openDict', () => {
      dictBox.show();
    });

    ipcMain.on('hideDict', () => {
      dictBox.hide();
    });

    ipcMain.on('dictOnTop', () => {
      dictOnTop = !dictOnTop;
      dictBox.setAlwaysOnTop(dictOnTop);
    });

    ipcMain.on('sendWordData', (event, wordData) => {
      dictBox.webContents.send('receiveWordData', wordData);
    });


    ipcMain.on('sendTranslation', (event, englishText) => {
      dictBox.webContents.send('receiveTranslation', englishText);
    });

    ipcMain.on('readyDict', () => {
    });
  }

  if (useDeepL) {
    const deepLBox = new BrowserWindow({
      width: 800,
      height: 600,
      autoHideMenuBar: true,
      webPreferences: {
        contextIsolation: true,
        enableRemoteModule: false,
        preload: tools.dirname_path('./boxes/deepl/script.js'),
        nodeIntegration: true,
      },
    });

    deepLBox.loadURL('https://www.deepl.com/translator#ja/en/');

    deepLBox.hide();

    deepLBox.on('close', (e) => {
      e.preventDefault();
      deepLBox.hide();
    });

    ipcMain.on('clipboardChanged', (event, text) => {
      deepLBox.webContents.send('translateWithDeepL', text);
    });


    const translationBox = createWindow("translation", {
      width: 800,
      height: 200,
      frame: false,
      minimizable: false,
      maximizable: false,
      transparent: translationTransparent,
      autoHideMenuBar: true,
      webPreferences: {
        contextIsolation: true,
        preload: tools.dirname_path('./boxes/translation/script.js'),
        nodeIntegration: true,
      },
    });

    if (translationTransparent)
      translationBox.loadFile(tools.dirname_path('./boxes/translation/index-transparent.html'));
    else translationBox.loadFile(tools.dirname_path('./boxes/translation/index.html'));

    ipcMain.on('translationOnTop', () => {
      translationOnTop = !translationOnTop;
      translationBox.setAlwaysOnTop(translationOnTop);
    });

    ipcMain.on('fadeText', (event, shouldFade) => {
      translationBox.webContents.send('fadeText', shouldFade);
    });

    ipcMain.on('showTranslation', (event, sourceText, targetText) => {
      translationBox.webContents.send(
        'showTranslation',
        sourceText,
        targetText
      );
    });

    ipcMain.on('requestTranslation', () => {
      translationBox.webContents.send('requestTranslation');
    });

    ipcMain.on('tooManyCharacters', () => {
      translationBox.webContents.send('tooManyCharacters');
    });

    ipcMain.on('translateNotification', () => {
      translationBox.webContents.send('translateNotification');
    });

    ipcMain.on('readyTranslation', () => {
    });

    ipcMain.on('deepLConnected', () => {
      translationBox.webContents.send('deepLConnected');
    });

    ipcMain.on('deepLConnectionError', () => {
      translationBox.webContents.send('deepLConnectionError');
    });

    if (!useReader) {
      translationBox.on('close', (e) => {
        const choice = dialog.showMessageBoxSync(translationBox,
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
          BrowserWindow.getAllWindows().filter(win => win.id != translationBox.id)
            .forEach(win => {
              win.close()
            })
          app.exit();
        }
      });
    }
    else {
      translationBox.on('close', (e) => {
        e.preventDefault();
        translationBox.hide();
      });
    }
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createBoxes();

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

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createBoxes();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
