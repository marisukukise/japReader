import { ElectronApplication, Page } from "playwright-core";
import { test, expect } from "@playwright/test";
import { startApp } from "./electronHelpers";
import { ElectronAppInfo, stubAllDialogs, stubDialog, stubMultipleDialogs } from "electron-playwright-helpers";
import { VisibleWindow } from "./types";



let visibleWindows: VisibleWindow[];
let appInfo: ElectronAppInfo;
let electronApp: ElectronApplication;

let dictionaryWindow: Page;
let readerWindow: Page;
let translationWindow: Page;
let settingsWindow: Page;


test.beforeAll(async () => {
    const startAppResponse = await startApp();
    visibleWindows = startAppResponse.visibleWindows;
    appInfo = startAppResponse.appInfo;
    electronApp = startAppResponse.electronApp;

    dictionaryWindow = visibleWindows.filter(e => e.windowName === 'dictionary')[0].page;
    readerWindow = visibleWindows.filter(e => e.windowName === 'reader')[0].page;
    translationWindow = visibleWindows.filter(e => e.windowName === 'translation')[0].page;
    settingsWindow = visibleWindows.filter(e => e.windowName === 'settings')[0].page;

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
    for (const visibleWindow of visibleWindows) {
        const page = visibleWindow.page;
        const windowName = visibleWindow.windowName;

        await page.screenshot({path: `screenshots/final-${windowName}.png`});

    }

});

test('Dictionary window should have h1 title with value "japReader - Dictionary" on startup', async () => {
    await dictionaryWindow.waitForSelector('h1')

    const text = await dictionaryWindow.$eval('h1', (el) => el.textContent)
    expect(text).toBe('Dictionary')

    const title = await dictionaryWindow.title()
    expect(title).toBe('japReader - Dictionary')
});