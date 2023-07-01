// Learn more: https://www.electronjs.org/docs/latest/tutorial/process-model#the-main-process

/* To turn on logging, create a file named '.env' in the root of the repository
  Available variables: 
  - JAPREADER_LOGS (with log level value: https://github.com/megahertz/electron-log#log-levels)
  - JAPREADER_ENV ("dev" for a lot of windows etc., otherwise normal mode)
*/

import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron';

// @ts-expect-error @globals is a webpack alias
import { setupLogging } from '@globals/ts/setupLogging';
import log from 'electron-log';
// Setups the logging mechanism
setupLogging();


// @ts-expect-error @globals is a webpack alias
import { startMainListeners } from '@globals/ts/startMainListeners';
// Activates all ipcMain listeners defined in the globals folder
startMainListeners();


// @ts-expect-error @globals is a webpack alias
import { initializeApp } from '@globals/ts/initializeApp';
app.whenReady().then(() => {
  // Creates all windows and their listeners
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

if (require('electron-squirrel-startup')) {
  app.quit();
}