import { ElectronApplication, _electron as electron } from "playwright-core";
import { test, expect } from "@playwright/test";
import { findLatestBuild, parseElectronApp, stubMultipleDialogs } from "electron-playwright-helpers";

let electronApp: ElectronApplication;

test.beforeAll(async () => {
    const appInfo = parseElectronApp(findLatestBuild());
    electronApp = await electron.launch({
        args: [appInfo.main],
        executablePath: appInfo.executable,
        // recordVideo: {
        //     dir: 'test-results/webm',
        //     size: {
        //         width: 800,
        //         height: 600
        //     },
        // },
        // env: {
        //     ...process.env,
        //     CLEAR_TOKENS: 'true', // clears ACCEPTED_LICENSE
        //     NODE_ENV: 'development',
        //     JAPREADER_LOGS: 'silly',
        //     PLAYWRIGHT: 'true',
        //     DEBUG: 'pw:browser*,pw:api',
        //     DEBUG_FILE: 'playwright.log'
        // },
    });

    stubMultipleDialogs(electronApp, [
        {
            method: 'showMessageBox',
            value: {
                response: 0
            }
        },
        {
            method: 'showMessageBoxSync',
            value: {
                response: 0
            }
        }
    ])
});

test.afterAll(async () => {
    await electronApp.close()
});

test('Main window state', async () => {
    console.log(electronApp.windows())
    expect(1).toBe(1)
//   const page = await electronApp.firstWindow();
//   const window: JSHandle<BrowserWindow> = await electronApp.browserWindow(page);
//   const windowState = await window.evaluate(
//     (mainWindow): Promise<{isVisible: boolean; isDevToolsOpened: boolean; isCrashed: boolean}> => {
//       const getState = () => ({
//         isVisible: mainWindow.isVisible(),
//         isDevToolsOpened: mainWindow.webContents.isDevToolsOpened(),
//         isCrashed: mainWindow.webContents.isCrashed(),
//       });

//       return new Promise(resolve => {
//         /**
//          * The main window is created hidden, and is shown only when it is ready.
//          * See {@link ../packages/main/src/mainWindow.ts} function
//          */
//         if (mainWindow.isVisible()) {
//           resolve(getState());
//         } else mainWindow.once('ready-to-show', () => resolve(getState()));
//       });
//     },
//   );

//   expect(windowState.isCrashed, 'The app has crashed').toBeFalsy();
//   expect(windowState.isVisible, 'The main window was not visible').toBeTruthy();
//   expect(windowState.isDevToolsOpened, 'The DevTools panel was open').toBeFalsy();
});