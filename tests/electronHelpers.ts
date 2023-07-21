import { ElectronAppInfo, findLatestBuild, parseElectronApp } from 'electron-playwright-helpers'
import { ElectronApplication, Page, _electron as electron } from 'playwright-core';

let electronApp: ElectronApplication;

interface StartAppResponse {
    electronApp: ElectronApplication;
    appWindow: Page;
    appInfo: ElectronAppInfo;
}

export async function startApp(): Promise<StartAppResponse> {

    // find the latest build in the out directory
    const latestBuild = findLatestBuild();

    // parse the directory and find paths and other info
    const appInfo = parseElectronApp(latestBuild);

    electronApp = await electron.launch({
        args: [appInfo.main],
        executablePath: appInfo.executable,
        // recordVideo: {
        //     dir: 'recordings',
        //     size: {
        //         width: 1200,
        //         height: 800
        //     },
        // },
    });

    // wait for splash-screen to pass
    await electronApp.firstWindow();

    const windows = electronApp.windows();
    const appWindow: Page = windows[0];
    appWindow.on('console', console.log);

    // Capture a screenshot.
    await appWindow.screenshot({
        path: 'screenshots/initial-screen.png'
    });

    return { appWindow, appInfo, electronApp };
}