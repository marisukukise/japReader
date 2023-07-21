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
    console.log("Starting test...")
    const startAppResponse = await startApp();
    visibleWindows = startAppResponse.visibleWindows;
    appInfo = startAppResponse.appInfo;
    electronApp = startAppResponse.electronApp;

    console.log("Creating window objects...")
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
    console.log("Finishing up...")
    for (const visibleWindow of visibleWindows) {
        const page = visibleWindow.page;
        const windowName = visibleWindow.windowName;

        await page.context().close();

    }

});

test('Reader should get a successful message', async () => {
    console.log("Testing inside reader...")
    await readerWindow.waitForSelector('.ichi-state-msg.connected')

    const text = await readerWindow.$eval('.ichi-state-msg.connected', (el) => el.textContent)
    expect(text?.split(" ")[0]).toBe('Successfully')

    const title = await readerWindow.title()
    expect(title).toBe('japReader')
});