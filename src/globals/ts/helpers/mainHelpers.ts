import { BrowserWindow, app, dialog, ipcMain } from 'electron';
import mainLog from 'electron-log';
const log = mainLog.scope('main');
import { getWindowStore } from '@globals/ts/initializers/initializeStore';
import { JAPREADER_ENV } from '@globals/ts/other/objects';
const windowStore = getWindowStore();

export const setDefaultVisibleWindowSettings = (window: BrowserWindow, windowName: string, ipcBase: any): void => {
    if (JAPREADER_ENV === 'dev') window.webContents.openDevTools();

    passMessageToRenderer(window, ipcBase.SET.TOGGLE_UI);
    passMessageToRenderer(window, ipcBase.SET.SHOW_UI);

    ipcMain.on(ipcBase.SET.BACKGROUND_COLOR, (_event, value: string) => {
        windowStore.set(`${windowName}.backgroundColor`, value);
        window.setBackgroundColor(value);
    });

    ipcMain.on(ipcBase.TOGGLE.ALWAYS_ON_TOP, () => {
        const value = window.isAlwaysOnTop();
        windowStore.set(`${windowName}.alwaysOnTop`, !value);
        window.setAlwaysOnTop(!value, 'pop-up-menu');
    });

    ipcMain.on(ipcBase.SET.FOCUS, () => {
        window.focus();
    });

    ipcMain.on(ipcBase.SET.SHOW, () => {
        window.show();
        if(windowStore.get(`${windowName}.alwaysOnTop`, false) != window.isAlwaysOnTop()) {
            window.setAlwaysOnTop(windowStore.get(`${windowName}.alwaysOnTop`, false), 'pop-up-menu');
        }
    });

    ipcMain.on(ipcBase.SET.MOVE_TOP, () => {
        // The window is moved to the top and stays there persistently,
        // So don't use it unless you want this behavior. It doesn't just show it.
        if(window.isVisible())
            window.moveTop();
        else
            window.show();
    });

    ipcMain.on(ipcBase.SET.HIDE, () => {
        window.hide();
    });

    window.on('blur', () => {
        window.webContents.send('blur');
    });

    ipcMain.handle(ipcBase.REQUEST.SHOW_DIALOG, async (_event, message: string) => {
        const result = dialog.showMessageBox(window, {
            type: 'question',
            buttons: ['Yes', 'No'],
            title: 'Confirm',
            message: message
        });
        return result;
    });


};

export const passMessageToRenderer = (window: BrowserWindow, ipcChannel: string) => {
    ipcMain.on(ipcChannel, (_event, ...args: any[]) => {
        window.webContents.send(ipcChannel, ...args);
    });
};

export const showExitDialog = (event: any, window: BrowserWindow): void => {
    const choice = dialog.showMessageBoxSync(window,
        {
            type: 'question',
            buttons: ['Yes', 'No'],
            title: 'Confirm',
            message: 'Are you sure you want to quit?'
        });
    if (choice == 1) {
        event.preventDefault();
    }
    else {
        BrowserWindow.getAllWindows().filter(win => win.id != window.id)
            .forEach(win => {
                win.close();
            });
        app.exit();
    }
};

export const showWindowWhenReady = (window: BrowserWindow, windowName: string, _ipcBase: any, shouldShowInProduction: boolean): void => {
    window.webContents.on('did-finish-load', () => {
        window.webContents.setZoomFactor(1);
        window.webContents.setZoomLevel(0);
        window.webContents.setVisualZoomLevelLimits(1, 1);
    });

    // Set the environment variable JAPREADER_ENV to "dev" to show all windows
    if (shouldShowInProduction) {
        window.once('ready-to-show', () => {
            log.info(`⌛ Showing ${window.getTitle()}`);
            window.show();

            if (windowStore.get(`${windowName}.alwaysOnTop`)) {
                window.setAlwaysOnTop(true, 'pop-up-menu');
            }

        });
        return;
    }

    // Added for debugging convenience
    if (JAPREADER_ENV === 'dev') {
        window.once('ready-to-show', () => {
            log.info(`⌛ Showing ${window.getTitle()}`);
            window.show();
        });
        return;
    }
};

function filterObjectKeys(unfilteredObj: any, allowedKeys: string[]) {
    const filtered = Object.keys(unfilteredObj)
        .filter(key => allowedKeys.includes(key))
        .reduce((obj: any, key: any) => {
            obj[key] = unfilteredObj[key];
            return obj;
        }, {});
    return filtered;
}

export const createWindowAndStorePositionData = (windowName: string, windowConfig: any) => {
    log.info(`⏳ Creating ${windowName} BrowserWindow...`);
    const allowed = ['width', 'height', 'isMaximized', 'x', 'y', 'alwaysOnTop', 'backgroundColor'];

    if (windowStore.has(windowName)) {
        let additional = {};
        if (windowStore.has(`${windowName}.additional`)) {
            additional = windowStore.get(`${windowName}.additional`);
        }

        const windowSettings = filterObjectKeys(windowStore.get(windowName), allowed);
        Object.assign(windowConfig,
            windowSettings
        );
        // get rid of rubbish properties
        windowStore.delete(windowName);
        windowStore.set(windowName, Object.keys(additional).length === 0 ? windowSettings : { ...windowSettings, 'additional': additional });
    }

    const window = new BrowserWindow(windowConfig);
    if (windowConfig.isMaximized) {
        window.maximize();
    }
    // Events that will update the window position
    window.on('maximize', () => {
        windowStore.set(windowName + '.isMaximized', true);
    });
    window.on('unmaximize', () => {
        windowStore.set(windowName + '.isMaximized', false);
    });
    // @ts-expect-error Not sure what problem TypeScript sees, but everything is fine
    window.on(process.platform == 'win32' ? 'resized' : 'resize', () => {
        const normalBounds = window.getNormalBounds();
        windowStore.set(windowName + '.width', normalBounds.width);
        windowStore.set(windowName + '.height', normalBounds.height);
    });
    // @ts-expect-error Not sure what problem TypeScript sees, but everything is fine
    window.on(process.platform == 'win32' ? 'moved' : 'move', () => {
        const normalBounds = window.getNormalBounds();
        windowStore.set(windowName + '.x', normalBounds.x);
        windowStore.set(windowName + '.y', normalBounds.y);
    });

    log.info(`✔️ Created ${windowName} BrowserWindow`);
    return window;
};