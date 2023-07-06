// Learn more: https://www.electronjs.org/docs/latest/tutorial/process-model#the-main-process

/* To turn on logging, create a file named '.env' in the root of the repository
  Available variables: 
  - JAPREADER_LOGS (with log level value: https://github.com/megahertz/electron-log#log-levels)
  - JAPREADER_ENV ("dev" for a lot of windows etc., otherwise normal mode)
*/

import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron';

import { setupLogging } from '@globals/ts/main/setupLogging';
// Setups the logging mechanism
setupLogging();


import { startMainListeners } from '@globals/ts/main/startMainListeners';
// Activates all ipcMain listeners defined in the globals folder
startMainListeners();


import { initializeApp } from '@globals/ts/main/initializeApp';
app.whenReady().then(() => {
  // Creates all windows and their listeners
  initializeApp();

  const DISABLED_SHORTCUTS = [
      // Reloading can lead to some bugs
      'CommandOrControl+R',
      'CommandOrControl+Shift+R',
      'F5',
      // Quitting should only be through Alt+F4 and buttons
      'CommandOrControl+W',
      // Zooming should be implemented in each Window renderer
      'CommandOrControl+numadd',
      'CommandOrControl+Shift+numadd',
      'CommandOrControl+numsub',
      'CommandOrControl+Shift+numsub',
      'CommandOrControl+Plus',
      'CommandOrControl+Shift+Plus',
      'CommandOrControl+0',
      'CommandOrControl+Shift+0',
  ];

  app.on('browser-window-focus', () => {
    globalShortcut.registerAll(DISABLED_SHORTCUTS, () => {});
  });

  app.on('browser-window-blur', () => {
    DISABLED_SHORTCUTS.forEach((SHORTCUT: string) => {
      globalShortcut.unregister(SHORTCUT);
    })
  });
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) initializeApp();
});

app.on('will-quit', () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

if (require('electron-squirrel-startup')) {
  app.quit();
}