import { ElectronApplication, Page, _electron as electron } from 'playwright-core';
import { findLatestBuild, parseElectronApp, stubMultipleDialogs } from "electron-playwright-helpers";
import { StartAppResponse, WindowInfo } from './types';

let electronApp: ElectronApplication;
let allWindows: WindowInfo[] = [];


export const startApp = async (): Promise<StartAppResponse> => {
    const appInfo = parseElectronApp(findLatestBuild());
    electronApp = await electron.launch({
        args: [appInfo.main],
        executablePath: appInfo.executable,
        recordVideo: {
            dir: 'webm',
            size: {
                width: 800,
                height: 600
            },
        },
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
    ]);


    const allPages = electronApp.windows();
    const nonDevToolPages = allPages.filter(e =>
        !e.mainFrame().url().startsWith("devtools://")
    )

    if (nonDevToolPages.length !== 7) {
        throw new Error(
`Electron should have spawned 7 non-devtools windows, \
but spawned ${nonDevToolPages.length} non-devtools windows instead. \
There were ${allPages.length} windows spawned in total.`
        );
    }

    allPages.forEach((page: Page) => {
        const url = page.mainFrame().url();
        let windowName = '';
        if (url.startsWith('devtools://')) return;

        if (url.startsWith('file:///')) {
            const split_url = url.split('/');
            windowName = split_url.at(-2)!;
        }

        if (url.startsWith('https://')) {
            if (url.includes('ichi.moe'))
                windowName = 'ichi';
            if (url.includes('deepl.com'))
                windowName = 'deep';
        }

        allWindows.push({
            page: page,
            name: windowName,
        });
    });

    if (allWindows.length !== 7) {
        throw new Error(`Total number of windows should have been 7, but found ${allWindows.length} windows.`)
    }

    return {windows: allWindows, app: electronApp, appInfo: appInfo}
}