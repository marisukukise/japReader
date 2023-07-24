import { ElectronApplication, Page, _electron as electron } from "playwright-core";
import { test, expect } from "@playwright/test";
import { findLatestBuild, parseElectronApp, stubMultipleDialogs } from "electron-playwright-helpers";
import { read } from "fs";

let electronApp: ElectronApplication;
let readerWindow: Page;
let dictionaryWindow: Page;
let translationWindow: Page;
let settingsWindow: Page;

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

    const allPages = electronApp.windows();
    if (allPages.length !== 7) {
        throw new Error("Electron should have spawned 7 windows")
    }

     allPages.forEach((page: Page) => {
        const url = page.mainFrame().url()
        if (!url.startsWith('file:///')) return;

        const split_url = url.split('/')
        const windowName = split_url.at(-2)!

        switch (windowName) {
            case "dictionary": 
                dictionaryWindow = page;
                break;
            case "reader": 
                readerWindow = page;
                break;
            case "translation":
                translationWindow = page;
                break;
            case "settings":
                settingsWindow = page;
                break;
            default:
        }
    })

    if (!dictionaryWindow)  throw new Error("Dictionary page is not defined")
    if (!readerWindow)      throw new Error("Reader page is not defined")
    if (!translationWindow) throw new Error("Translation page is not defined")
    if (!settingsWindow)    throw new Error("Settings page is not defined")

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

test('Visible windows titles', async () => {
    const readerTitle = await readerWindow.title()
    expect(readerTitle).toBe("japReader")
    const dictionaryTitle = await dictionaryWindow.title()
    expect(dictionaryTitle).toBe("japReader - Dictionary")
    const translationTitle = await translationWindow.title()
    expect(translationTitle).toBe("japReader - Translation")
    const settingsTitle = await settingsWindow.title()
    expect(settingsTitle).toBe("japReader - Settings")
});