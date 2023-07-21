import { findLatestBuild, parseElectronApp } from 'electron-playwright-helpers'
import { ElectronApplication, Page, _electron as electron } from 'playwright-core';
import { StartAppResponse, VisibleWindow } from './types';

let electronApp: ElectronApplication;

export async function startApp(): Promise<StartAppResponse> {

    // find the latest build in the out directory
    const latestBuild = findLatestBuild();

    // parse the directory and find paths and other info
    const appInfo = parseElectronApp(latestBuild);

    electronApp = await electron.launch({
        args: [appInfo.main],
        executablePath: appInfo.executable,
        recordVideo: {
            dir: 'test-results/webm',
            size: {
                width: 800,
                height: 600
            },
        },
    });

    // wait for splash-screen to pass
    await electronApp.firstWindow();

    const allPages = electronApp.windows();
    const visiblePages: VisibleWindow[] = [];

    allPages.forEach((page: Page) => {
        const url = page.mainFrame().url()
        if (!url.startsWith('file:///')) return;

        const split_url = url.split('/')
        const windowName = split_url.at(-2)!
        if (["dictionary", "reader", "translation", "settings"].includes(windowName)) {
            visiblePages.push({
                windowName: windowName,
                page: page
            })
        }
    })

    return { visibleWindows: visiblePages, appInfo, electronApp };
}