import { findLatestBuild, parseElectronApp } from 'electron-playwright-helpers'
import { ElectronApplication, Page, _electron as electron } from 'playwright-core';
import { StartAppResponse, VisibleWindow } from './types';

let electronApp: ElectronApplication;

const didLaunchApp = async () => {
  const isVisible: boolean = await electronApp.evaluate(
    async ({ BrowserWindow }) => {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      const getState = () => mainWindow.isVisible();

      return new Promise((resolve) => {
        if (mainWindow.isVisible()) {
          resolve(getState());
        } else {
          mainWindow.once('ready-to-show', () => {
            setTimeout(() => resolve(getState()), 0);
          });
        }
      });
    }
  );
  return isVisible;
};

export async function startApp(): Promise<StartAppResponse> {

    console.log("Starting app...")
    // find the latest build in the out directory
    const latestBuild = findLatestBuild();

    // parse the directory and find paths and other info
    const appInfo = parseElectronApp(latestBuild);

    console.log("Creating electron app...")
    console.log("appInfo.main", appInfo.main)
    console.log("appInfo.executable", appInfo.executable)
    try {
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
    }
    catch (error) {
        console.error(error)
        throw new Error("Something went wrong when creating the Electron process")
    }

    console.log("Waiting for splash-screen to pass...")
    // wait for splash-screen to pass
    await didLaunchApp()
    console.log("launched")

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

    console.log("Returning windows...")
    return { visibleWindows: visiblePages, appInfo, electronApp };
}