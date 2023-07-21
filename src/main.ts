// Learn more: https://www.electronjs.org/docs/latest/tutorial/process-model#the-main-process

/* To turn on logging, create a file named '.env' in the root of the repository
  Available variables: 
  - JAPREADER_LOGS (with log level value: https://github.com/megahertz/electron-log#log-levels)
  - JAPREADER_ENV ("dev" for a lot of windows etc., otherwise normal mode)
*/

import { app, BrowserWindow, globalShortcut } from 'electron';

if (require('electron-squirrel-startup')) {
    app.quit();
}

import 'dotenv/config';

import { initializeLogging } from '@root/src/globals/ts/initializers/initializeLogging';
// Setups the logging mechanism
initializeLogging();


import { initializeMainListeners } from '@root/src/globals/ts/initializers/initializeMainListeners';
// Activates all ipcMain listeners defined in the globals folder
initializeMainListeners();


import { initializeApp } from '@root/src/globals/ts/initializers/initializeApp';
import { IPC_CHANNELS } from '@root/src/globals/ts/other/objects';
app.whenReady().then(() => {

    // Creates all windows and their listeners
    const windows: japReader.Windows = initializeApp();

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
        'CommandOrControl+-',
        'CommandOrControl+Shift+-',
        'CommandOrControl+0',
        'CommandOrControl+Shift+0',
    ];

    if (process.env['JAPREADER_ENV'] !== 'dev') {
        const orig_len = DISABLED_SHORTCUTS.length;
        for (let i = 0; i < orig_len; i++) {
            DISABLED_SHORTCUTS.shift();
        }
    }

    // TODO: Add a global keyboard shortcut to bring all windows up

    app.on('browser-window-focus', () => {
        DISABLED_SHORTCUTS.forEach((SHORTCUT: string) => {
            globalShortcut.register(SHORTCUT, () => { /* Register undefined to the bind not work */ });
        });
    });

    app.on('browser-window-blur', () => {
        DISABLED_SHORTCUTS.forEach((SHORTCUT: string) => {
            globalShortcut.unregister(SHORTCUT);
        });
    });

    globalShortcut.register('Alt+H', () => {
        for (const [key, window] of Object.entries(windows)) {
            if (['reader', 'translation', 'dictionary'].includes(key)) {
                window.show();

                // @ts-expect-error The keys are limited to the ones that exist
                window.webContents.send(IPC_CHANNELS[`${key.toUpperCase()}`].SET.SHOW_UI);
            }
        }

    });

});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) initializeApp();
});

app.on('will-quit', () => {
    // Unregister all shortcuts.
    globalShortcut.unregisterAll();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

