import { ElectronApplication, JSHandle } from 'playwright-core';
import { test, expect } from '@playwright/test';
import { ElectronAppInfo } from 'electron-playwright-helpers';
import { WindowInfo } from './types';
import { startApp } from './startApp';
import { BrowserWindow, clipboard } from 'electron';
import { pause } from './utils';

let appInfo: ElectronAppInfo;
let electronApp: ElectronApplication;
let allWindows: WindowInfo[];
let visibleWindows: WindowInfo[];

let clipboardWindow: WindowInfo;
let deepWindow: WindowInfo;
let ichiWindow: WindowInfo;
let readerWindow: WindowInfo;
let dictionaryWindow: WindowInfo;
let translationWindow: WindowInfo;
let settingsWindow: WindowInfo;

const assignWindow = (windowName: string): WindowInfo => {
    if (allWindows.filter(e => e.name === windowName).length !== 1) {
        throw new Error(`There are more than 1 windows with name ${windowName}`)
    } else {
        return allWindows.filter(e => e.name === windowName)[0]
    }
}

test.beforeAll(async () => {
    const StartAppResponse = await startApp();
    appInfo = StartAppResponse.appInfo;
    electronApp = StartAppResponse.app;
    allWindows = StartAppResponse.windows;

    clipboardWindow = assignWindow("clipboard")
    deepWindow = assignWindow("deep")
    ichiWindow = assignWindow("ichi")
    readerWindow = assignWindow("reader")
    dictionaryWindow = assignWindow("dictionary")
    translationWindow = assignWindow("translation")
    settingsWindow = assignWindow("settings")

    visibleWindows = [
        readerWindow, dictionaryWindow, translationWindow, settingsWindow
    ]
});

test.afterAll(async () => {
    await electronApp.close();
});

test.describe('Visible windows tests', () => {
    test('Integrity test', async () => {
        for (const windowInfo of visibleWindows) {
            const window: JSHandle<BrowserWindow> = await electronApp.browserWindow(windowInfo.page);
            const windowState = await window.evaluate(
                (mainWindow): Promise<{ isVisible: boolean; isDevToolsOpened: boolean; isCrashed: boolean }> => {
                    const getState = () => ({
                        isVisible: mainWindow.isVisible(),
                        isDevToolsOpened: mainWindow.webContents.isDevToolsOpened(),
                        isCrashed: mainWindow.webContents.isCrashed(),
                    });

                    return new Promise(resolve => {
                        if (mainWindow.isVisible()) {
                            resolve(getState());
                        } else mainWindow.once('ready-to-show', () => resolve(getState()));
                    });
                },
            );

            expect(windowState.isCrashed, 'The app has crashed').toBeFalsy();
            expect(windowState.isVisible, `The ${windowInfo.name} window was not visible`).toBeTruthy();
            expect(windowState.isDevToolsOpened, 'The DevTools panel was open').toBeFalsy();
        }
    })
})

test.describe('Reader tests', () => {
    test('Reader displays an appropriate message when connecting to ichi.moe', async () => {
        const paragraph = readerWindow.page.locator('.ichi-state-msg.connecting')
        await paragraph.waitFor({ timeout: 5000 });
        const message = await paragraph.evaluate(node => node.innerHTML)

        expect(message.includes("Connecting")).toBe(true)
    })

    test('Reader displays an appropriate message when connected to ichi.moe', async () => {
        const paragraph = readerWindow.page.locator('.ichi-state-msg.connected')
        await paragraph.waitFor({ timeout: 5000 });
        const message = await paragraph.evaluate(node => node.innerHTML)

        expect(message.includes("Successfully")).toBe(true)
    })

    test('Read clipboard', async () => {
        await pause(1000)

        readerWindow.page.evaluate("navigator.clipboard.writeText('昨日すき焼きを食べました')")
        const paragraph = readerWindow.page.locator('.parse-notification-msg')
        await paragraph.waitFor({ timeout: 5000 });
        const message = await paragraph.evaluate(node => node.innerHTML)
        expect(message.includes("...")).toBe(true)

        const paragraph2 = readerWindow.page.locator('.sentence-wrapper')
        await paragraph2.waitFor({ timeout: 5000 });
        const message2 = await paragraph2.evaluate((node: HTMLElement) => node.innerText)
        expect(message2).toBe('昨日きのうすき焼やきを食たべました')

        await pause(1000)
    })
})

