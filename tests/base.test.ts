import { ElectronApplication, Page, _electron as electron } from 'playwright-core';
import { test, expect } from '@playwright/test';
import { ElectronAppInfo, findLatestBuild, parseElectronApp, stubMultipleDialogs } from 'electron-playwright-helpers';
import { WindowInfo } from './types';
import { startApp } from './startApp';

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

test('Visible windows titles', async () => {
    const readerTitle = await readerWindow.page.title();
    expect(readerTitle).toBe('japReader');
    const dictionaryTitle = await dictionaryWindow.page.title();
    expect(dictionaryTitle).toBe('japReader - Dictionary');
    const translationTitle = await translationWindow.page.title();
    expect(translationTitle).toBe('japReader - Translation');
    const settingsTitle = await settingsWindow.page.title();
    expect(settingsTitle).toBe('japReader - Settings');
});
