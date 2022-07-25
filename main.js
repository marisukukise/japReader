const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');

// set to true to enable Chrome developer tools
let DEBUG = false;

let readerOnTop = false;
let translationOnTop = false;
let dictOnTop = false;

const { useDeepL, deepLOnly, translationTransparent } = JSON.parse(
  fs.readFileSync('./data/options.json', {
    encoding: 'utf8',
    flag: 'r',
  })
);

const createBoxes = () => {
  const clipboardBox = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, './boxes/clipboard/script.js'),
    },
  });

  clipboardBox.loadFile('./boxes/clipboard/index.html');

  clipboardBox.hide();

  clipboardBox.on('close', () => {
    app.quit();
  });

  if(DEBUG){
    clipboardBox.webContents.openDevTools();
  }

  const optionsBox = new BrowserWindow({
    width: 800,
    height: 600,
    frame: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, './boxes/options/script.js'),
    },
  });

  optionsBox.loadFile('./boxes/options/index.html');

  optionsBox.hide();

  optionsBox.on('close', () => {
    app.quit();
  });

  ipcMain.on('openOptions', () => {
    optionsBox.show();
  });

  ipcMain.on('hideOptions', () => {
    optionsBox.hide();
  });

  if(DEBUG){
    optionsBox.webContents.openDevTools();
  }

  ipcMain.on('restartProgram', () => {
    app.relaunch();
    app.quit();
  });

  if (!deepLOnly) {
    const readerBox = new BrowserWindow({
      width: 800,
      height: 200,
      frame: true,
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, './boxes/reader/script.js'),
      },
    });

    readerBox.loadFile('./boxes/reader/index.html');

    readerBox.on('close', () => {
      const data = { bounds: readerBox.getBounds() };
      fs.writeFileSync('./boxes/reader/box_size.json', JSON.stringify(data));
      app.quit();
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

    ipcMain.on('positionReader', () => {
      if (fs.existsSync('./boxes/reader/box_size.json')) {
        const data = JSON.parse(
          fs.readFileSync('./boxes/reader/box_size.json', {
            encoding: 'utf8',
            flag: 'r',
          })
        );
        readerBox.setSize(data.bounds.width, data.bounds.height);
        readerBox.setPosition(data.bounds.x, data.bounds.y);
      }
    });

    ipcMain.on('readerOnTop', () => {
      readerOnTop = !readerOnTop;
      readerBox.setAlwaysOnTop(readerOnTop);
    });

    if(DEBUG){
      readerBox.webContents.openDevTools();
    }

    const ichiBox = new BrowserWindow({
      width: 800,
      height: 600,
      autoHideMenuBar: true,
      webPreferences: {
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, './boxes/ichi/script.js'),
      },
    });

    ichiBox.loadURL('https://ichi.moe/cl/qr/?q=&r=kana');

    ichiBox.hide();

    ichiBox.on('close', () => {
      app.quit();
    });

    ipcMain.on('clipboardChanged', (event, text) => {
      ichiBox.webContents.send('parseWithIchi', text);
    });

    if(DEBUG){
      ichiBox.webContents.openDevTools();
    }

    const dictBox = new BrowserWindow({
      width: 400,
      height: 600,
      frame: true,
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, './boxes/dict/script.js'),
      },
    });

    dictBox.loadFile('./boxes/dict/index.html');

    dictBox.hide();

    dictBox.on('close', () => {
      const data = { bounds: dictBox.getBounds() };
      fs.writeFileSync('./boxes/dict/box_size.json', JSON.stringify(data));
      app.quit();
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

    ipcMain.on('positionDict', () => {
      if (fs.existsSync('./boxes/dict/box_size.json')) {
        const data = JSON.parse(
          fs.readFileSync('./boxes/dict/box_size.json', {
            encoding: 'utf8',
            flag: 'r',
          })
        );
        dictBox.setSize(data.bounds.width, data.bounds.height);
        dictBox.setPosition(data.bounds.x, data.bounds.y);
      }
    });
    if(DEBUG){
      dictBox.webContents.openDevTools();
    }
  }

  if (useDeepL) {
    const deepLBox = new BrowserWindow({
      width: 800,
      height: 600,
      autoHideMenuBar: true,
      webPreferences: {
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, './boxes/deepl/script.js'),
      },
    });

    deepLBox.loadURL('https://www.deepl.com/translator#ja/en/');

    deepLBox.hide();

    deepLBox.on('close', () => {
      app.quit();
    });

    ipcMain.on('clipboardChanged', (event, text) => {
      deepLBox.webContents.send('translateWithDeepL', text);
    });

    if(DEBUG){
      deepLBox.webContents.openDevTools();
    }

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
        preload: path.join(__dirname, './boxes/translation/script.js'),
      },
    });

    if (translationTransparent)
      translationBox.loadFile('./boxes/translation/index-transparent.html');
    else translationBox.loadFile('./boxes/translation/index.html');

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

    ipcMain.on('positionTranslation', () => {
      if (fs.existsSync('./boxes/translation/box_size.json')) {
        const data = JSON.parse(
          fs.readFileSync('./boxes/translation/box_size.json', {
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

    translationBox.on('close', () => {
      const data = { bounds: translationBox.getBounds() };
      fs.writeFileSync(
        './boxes/translation/box_size.json',
        JSON.stringify(data)
      );
      app.quit();
    });

    if(DEBUG){
      translationBox.webContents.openDevTools();
    }
  }
};

app.whenReady().then(() => {
  createBoxes();

  app.on('browser-window-focus', () => {
    globalShortcut.register('CommandOrControl+R', () => {});
    globalShortcut.register('CommandOrControl+Shift+I', () => {});
    globalShortcut.register('F5', () => {});
  });

  app.on('browser-window-blur', () => {
    globalShortcut.unregister('CommandOrControl+R');
    globalShortcut.unregister('CommandOrControl+Shift+I');
    globalShortcut.unregister('F5');
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createBoxes();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
