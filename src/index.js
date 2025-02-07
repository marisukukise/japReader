require("module-alias/register");

const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  dialog,
  shell,
} = require("electron");
const { spawn } = require("child_process");

const tools = require("@tools");

const Store = require("electron-store");
const WINDOW_SETTINGS = new Store(tools.getWindowStoreOptions());
const OPTIONS = new Store(tools.getOptionsStoreOptions());
const HISTORY = new Store(tools.getHistoryLogsOptions());

if (require("electron-squirrel-startup")) return app.quit();

let readerOnTop = false;
let translationOnTop = false;
let dictOnTop = false;

function filterObjectKeys(unfilteredObj, allowedKeys) {
  const filtered = Object.keys(unfilteredObj)
    .filter((key) => allowedKeys.includes(key))
    .reduce((obj, key) => {
      obj[key] = unfilteredObj[key];
      return obj;
    }, {});
  return filtered;
}

function createWindow(windowName, windowConfig) {
  const allowed = ["width", "height", "isMaximized", "x", "y"];

  if (WINDOW_SETTINGS.has(windowName)) {
    const positionSettings = filterObjectKeys(
      WINDOW_SETTINGS.get(windowName),
      allowed,
    );
    Object.assign(windowConfig, positionSettings);
    // get rid of rubbish properties
    WINDOW_SETTINGS.delete(windowName);
    WINDOW_SETTINGS.set(windowName, positionSettings);
  }

  const mainWindow = new BrowserWindow(windowConfig);
  if (windowConfig.isMaximized) mainWindow.maximize();

  // Events that will update the window position
  mainWindow.on("maximize", () => {
    WINDOW_SETTINGS.set(windowName + ".isMaximized", true);
  });
  mainWindow.on("unmaximize", () => {
    WINDOW_SETTINGS.set(windowName + ".isMaximized", false);
  });
  mainWindow.on(process.platform == "win32" ? "resized" : "resize", () => {
    let normalBounds = mainWindow.getNormalBounds();
    WINDOW_SETTINGS.set(windowName + ".width", normalBounds.width);
    WINDOW_SETTINGS.set(windowName + ".height", normalBounds.height);
  });
  mainWindow.on(process.platform == "win32" ? "moved" : "move", () => {
    let normalBounds = mainWindow.getNormalBounds();
    WINDOW_SETTINGS.set(windowName + ".x", normalBounds.x);
    WINDOW_SETTINGS.set(windowName + ".y", normalBounds.y);
  });

  return mainWindow;
}

const { useDeepL, useDeepLApi, useReader, translationTransparent } =
  OPTIONS.get("options");

ipcMain.on("openExternal", (event, url) => {
  shell.openExternal(url);
});

ipcMain.on("showItemInFolder", (event, fullPath) => {
  shell.showItemInFolder(fullPath);
});

ipcMain.on("openPath", (event, path) => {
  if (process.platform === "linux") {
    // Spawn a detached process using xdg-open on Linux
    spawn("xdg-open", [path], { detached: true, stdio: "ignore" }).unref(); // Unreference the child process to detach it
  } else {
    // Open the folder with shell.openPath on other platforms
    shell.openPath(path);
  }
});

ipcMain.on("appendToHistory", (event, originalText, translation) => {
  if (typeof translation !== "string" || translation == "") translation = null;

  const entry = {
    timestamp: Date.now(),
    japanese: originalText,
    translation: translation,
  };

  const list = HISTORY.get("history");

  if (list) HISTORY.set("history", list.concat(entry));
  else HISTORY.set("history", [entry]);
});

const createBoxes = () => {
  const clipboardBox = new BrowserWindow({
    icon: "images/logo/icon.png",
    show: false,
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: tools.dirname_path("./boxes/clipboard/script.js"),
      nodeIntegration: true,
    },
  });

  clipboardBox.loadFile(tools.dirname_path("./boxes/clipboard/index.html"));

  clipboardBox.on("close", (e) => {
    e.preventDefault();
    clipboardBox.hide();
  });

  const optionsBox = createWindow("options", {
    icon: "images/logo/icon.png",
    identifier: "options",
    show: false,
    width: 800,
    height: 600,
    frame: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: tools.dirname_path("./boxes/options/script.js"),
      nodeIntegration: true,
    },
  });

  optionsBox.loadFile(tools.dirname_path("./boxes/options/index.html"));

  optionsBox.on("close", (e) => {
    e.preventDefault();
    optionsBox.hide();
  });

  ipcMain.on("openOptions", () => {
    optionsBox.show();
  });

  ipcMain.on("hideOptions", () => {
    optionsBox.hide();
  });

  ipcMain.handle("showDialog", async (e, message) => {
    const result = dialog.showMessageBox(optionsBox, {
      type: "question",
      buttons: ["Yes", "No"],
      title: "Confirm",
      message: message,
    });
    return result;
  });

  ipcMain.on("restartProgram", () => {
    app.relaunch();
    app.exit();
  });

  if (useReader) {
    const readerBox = createWindow("reader", {
      icon: "images/logo/icon.png",
      width: 800,
      height: 200,
      frame: true,
      autoHideMenuBar: true,
      webPreferences: {
        preload: tools.dirname_path("./boxes/reader/script.js"),
        nodeIntegration: true,
      },
    });

    readerBox.loadFile(tools.dirname_path("./boxes/reader/index.html"));

    readerBox.on("close", (e) => {
      const choice = dialog.showMessageBoxSync(readerBox, {
        type: "question",
        buttons: ["Yes", "No"],
        title: "Confirm",
        message: "Are you sure you want to quit?",
      });
      if (choice == 1) {
        e.preventDefault();
      } else {
        BrowserWindow.getAllWindows()
          .filter((win) => win.id != readerBox.id)
          .forEach((win) => {
            win.close();
          });
        app.exit();
      }
    });

    ipcMain.on("tooManyCharacters", () => {
      readerBox.webContents.send("tooManyCharacters");
    });

    ipcMain.on("parseNotification", () => {
      readerBox.webContents.send("parseNotification");
    });

    ipcMain.on("ichiConnected", () => {
      readerBox.webContents.send("ichiConnected");
    });

    ipcMain.on("ichiConnectionError", () => {
      readerBox.webContents.send("ichiConnectionError");
    });

    ipcMain.on("sendParsedData", (event, words, fullText) => {
      readerBox.webContents.send("receiveParsedData", words, fullText);
    });

    ipcMain.on("refreshReader", () => {
      readerBox.webContents.send("refreshReader");
    });

    ipcMain.on("readyReader", () => {});

    ipcMain.on("readerOnTop", () => {
      readerOnTop = !readerOnTop;
      readerBox.setAlwaysOnTop(readerOnTop);
    });

    const ichiBox = new BrowserWindow({
      icon: "images/logo/icon.png",
      show: false,
      width: 800,
      height: 600,
      autoHideMenuBar: true,
      webPreferences: {
        contextIsolation: true,
        enableRemoteModule: false,
        preload: tools.dirname_path("./boxes/ichi/script.js"),
        nodeIntegration: true,
      },
    });

    ichiBox.loadURL("https://ichi.moe/cl/qr/?q=&r=kana");

    ichiBox.on("close", (e) => {
      e.preventDefault();
      ichiBox.hide();
    });

    ipcMain.on("clipboardChanged", (event, text) => {
      ichiBox.webContents.send("parseWithIchi", text);
    });

    const dictBox = createWindow("dict", {
      icon: "images/logo/icon.png",
      show: false,
      width: 400,
      height: 600,
      frame: true,
      autoHideMenuBar: true,
      webPreferences: {
        preload: tools.dirname_path("./boxes/dict/script.js"),
        nodeIntegration: true,
      },
    });

    dictBox.loadFile(tools.dirname_path("./boxes/dict/index.html"));

    dictBox.on("close", (e) => {
      e.preventDefault();
      dictBox.hide();
    });
    ipcMain.on("openDict", () => {
      dictBox.show();
    });

    ipcMain.on("hideDict", () => {
      dictBox.hide();
    });

    ipcMain.on("dictOnTop", () => {
      dictOnTop = !dictOnTop;
      dictBox.setAlwaysOnTop(dictOnTop);
    });

    ipcMain.on("sendWordData", (event, wordData) => {
      dictBox.webContents.send("receiveWordData", wordData);
    });

    ipcMain.on("sendTranslation", (event, englishText) => {
      dictBox.webContents.send("receiveTranslation", englishText);
    });

    ipcMain.on("readyDict", () => {});
  }

  if (useDeepL) {
    const deepLBox = new BrowserWindow({
      icon: "images/logo/icon.png",
      show: true,
      width: 800,
      height: 600,
      autoHideMenuBar: true,
      webPreferences: {
        devTools: true,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: tools.dirname_path("./boxes/deepl/script.js"),
        nodeIntegration: true,
      },
    });

    if (!useDeepLApi) {
      deepLBox.loadURL("https://www.deepl.com/translator#ja/en/");
    } else {
      deepLBox.loadFile(tools.dirname_path("./boxes/deepl/index.html"));
    }

    deepLBox.on("close", (e) => {
      e.preventDefault();
      deepLBox.hide();
    });

    ipcMain.on("clipboardChanged", (event, text) => {
      deepLBox.webContents.send("translateWithDeepL", text);
    });

    const translationBox = createWindow("translation", {
      icon: "images/logo/icon.png",
      width: 800,
      height: 200,
      frame: !translationTransparent,
      minimizable: !translationTransparent,
      maximizable: !translationTransparent,
      closable: !useReader,
      transparent: translationTransparent,
      autoHideMenuBar: true,
      webPreferences: {
        contextIsolation: true,
        preload: tools.dirname_path("./boxes/translation/script.js"),
        nodeIntegration: true,
      },
    });

    if (translationTransparent)
      translationBox.loadFile(
        tools.dirname_path("./boxes/translation/index-transparent.html"),
      );
    else
      translationBox.loadFile(
        tools.dirname_path("./boxes/translation/index.html"),
      );

    ipcMain.on("translationOnTop", () => {
      translationOnTop = !translationOnTop;
      translationBox.setAlwaysOnTop(translationOnTop);
    });

    ipcMain.on("fadeText", (event, shouldFade) => {
      translationBox.webContents.send("fadeText", shouldFade);
    });

    ipcMain.on("showTranslation", (event, sourceText, targetText) => {
      translationBox.webContents.send(
        "showTranslation",
        sourceText,
        targetText,
      );
    });

    ipcMain.on("requestTranslation", () => {
      translationBox.webContents.send("requestTranslation");
    });

    ipcMain.on("tooManyCharacters", () => {
      translationBox.webContents.send("tooManyCharacters");
    });

    ipcMain.on("translateNotification", () => {
      translationBox.webContents.send("translateNotification");
    });

    ipcMain.on("readyTranslation", () => {});

    ipcMain.on("deepLConnected", () => {
      translationBox.webContents.send("deepLConnected");
    });

    ipcMain.on("deepLConnectionError", (event, message) => {
      translationBox.webContents.send("deepLConnectionError", message);
    });

    if (!useReader) {
      translationBox.on("close", (e) => {
        const choice = dialog.showMessageBoxSync(translationBox, {
          type: "question",
          buttons: ["Yes", "No"],
          title: "Confirm",
          message: "Are you sure you want to quit?",
        });
        if (choice == 1) {
          e.preventDefault();
        } else {
          BrowserWindow.getAllWindows()
            .filter((win) => win.id != translationBox.id)
            .forEach((win) => {
              win.close();
            });
          app.exit();
        }
      });
    } else {
      translationBox.on("close", (e) => {
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
  // Load missing props in options from schema
  OPTIONS.set("options", OPTIONS.store.options);

  createBoxes();

  app.on("browser-window-focus", () => {
    globalShortcut.register("CommandOrControl+R", () => {});
    globalShortcut.register("Control+W", () => {});
    globalShortcut.register("F5", () => {});
  });

  app.on("browser-window-blur", () => {
    globalShortcut.unregister("CommandOrControl+R");
    globalShortcut.unregister("Control+W");
    globalShortcut.unregister("F5");
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createBoxes();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
