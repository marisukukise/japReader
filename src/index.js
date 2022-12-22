require('module-alias/register')

const { app, BrowserWindow, ipcMain, globalShortcut, dialog } = require('electron');
const fs = require('fs');
const storage = require('electron-json-storage');
const tools = require('@tools');

if (require('electron-squirrel-startup')) return app.quit();

let readerOnTop = false;
let translationOnTop = false;
let dictOnTop = false;

const { useDeepL, deepLOnly, translationTransparent } = JSON.parse(
  fs.readFileSync(tools.dirname_path('./data/options.json'), {
    encoding: 'utf8',
    flag: 'r',
  })
);

const destroyBoxes = () => {

}

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

  clipboardBox.on('close', () => {
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

  optionsBox.on('close', () => {
  });

  ipcMain.on('openOptions', () => {
    optionsBox.show();
  });

  ipcMain.on('hideOptions', () => {
    optionsBox.hide();
  });


  ipcMain.on('restartProgram', () => {
    app.relaunch();
    app.quit();
  });

  if (!deepLOnly) {
    const readerBox = new BrowserWindow({
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
        const data = { bounds: readerBox.getBounds() };
        fs.writeFileSync(tools.dirname_path('./boxes/reader/box_size.json'), JSON.stringify(data));
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
      if (fs.existsSync(tools.dirname_path('./boxes/reader/box_size.json'))) {
        const data = JSON.parse(
          fs.readFileSync(tools.dirname_path('./boxes/reader/box_size.json'), {
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

    ichiBox.on('close', () => {
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

    dictBox.on('close', () => {
      const data = { bounds: dictBox.getBounds() };
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

    deepLBox.on('close', () => {
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

    translationBox.on('close', () => {
      const data = { bounds: translationBox.getBounds() };
      fs.writeFileSync(tools.dirname_path('./boxes/translation/box_size.json'), JSON.stringify(data));
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
