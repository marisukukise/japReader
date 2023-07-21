import { ElectronApplication, Page } from "playwright-core";
import { test, expect } from "@playwright/test";
import { startApp } from "./electronHelpers";
import { ElectronAppInfo } from "electron-playwright-helpers";



let appWindow: Page;
let appInfo: ElectronAppInfo;
let electronApp: ElectronApplication;


test.beforeAll(async () => {
    const startAppResponse = await startApp();
    appWindow = startAppResponse.appWindow;
    appInfo = startAppResponse.appInfo;
    electronApp = startAppResponse.electronApp;
});

test.afterAll(async () => {
    await appWindow.screenshot({ path: 'screenshots/final-screen.png' });
    await appWindow.context().close();
    await appWindow.close();
});

test('test click', async () => {
    console.log('test click123')
    console.log(appWindow.title())
    // Click button.
    await appWindow.click('text=Click me');

    // Exit app.
    await electronApp.close();
});