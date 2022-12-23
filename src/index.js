require('module-alias/register')

const { app, BrowserWindow, ipcMain, globalShortcut, dialog } = require('electron');
const tools = require('@tools');
const fs = require('fs');
const Store = require('electron-store')
const WINDOW_SETTINGS = new Store({
  name: "window_settings"
});
const USER_SETTINGS = new Store({
  name: "user_settings",
  defaults: {
    "options": {
      "darkMode": false,
      "useDeepL": true,
      "deepLDual": true,
      "deepLOnly": false,
      "fadeText": true,
      "addFurigana": true,
      "showGoal": true,
      "dailyGoal": 30,
      "tvMode": false,
      "translationTransparent": true,
      "readerFontSize": 25,
      "translationFontSize": 13,
      "dictFontSize": 17
    }
  }
})

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

const { useDeepL, deepLOnly, translationTransparent } = USER_SETTINGS.get('options');

/*
  Creates the following boxes:
  ALWAYS:
    clipboardBox - uses ./boxes/clipboard/*
    optionsBox - uses ./boxes/options/*
  IF (!deepLOnly)
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

  const optionsBox = new BrowserWindow({
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


  ipcMain.on('restartProgram', () => {
    app.relaunch();
    app.exit();
  });

  if (!deepLOnly) {
    const readerBox = createWindow("reader", {
      width: 800,
      height: 200,
      frame: true,
      autoHideMenuBar: false,
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


    const dictBox = new BrowserWindow({
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
      fs.writeFileSync(tools.dirname_path('./boxes/dict/box_size.json'), JSON.stringify(data));
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
      if (fs.existsSync(tools.dirname_path('./boxes/dict/box_size.json'))) {
        const data = JSON.parse(
          fs.readFileSync(tools.dirname_path('./boxes/dict/box_size.json'), {
            encoding: 'utf8',
            flag: 'r',
          })
        );
        dictBox.setSize(data.bounds.width, data.bounds.height);
        dictBox.setPosition(data.bounds.x, data.bounds.y);
      }
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


    const translationBox = new BrowserWindow({
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
      if (fs.existsSync(tools.dirname_path('./boxes/translation/box_size.json'))) {
        const data = JSON.parse(
          fs.readFileSync(tools.dirname_path('./boxes/translation/box_size.json'), {
            encoding: 'utf8',
            flag: 'r',
          })
        );
        translationBox.setSize(data.bounds.width, data.bounds.height);
        translationBox.setPosition(data.bounds.x, data.bounds.y);
      }
    });

    ipcMain.on('deepLConnected', () => {
      translationBox.webContents.send('deepLConnected');
    });

    ipcMain.on('deepLConnectionError', () => {
      translationBox.webContents.send('deepLConnectionError');
    });

    translationBox.on('close', (e) => {
      e.preventDefault();
      translationBox.hide();
    });
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
