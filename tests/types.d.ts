import { ElectronAppInfo } from 'electron-playwright-helpers';
import { ElectronApplication, Page } from 'playwright-core';

interface WindowInfo {
    name: string;
    page: Page;
}

interface StartAppResponse {
    windows: WindowInfo[],
    app: ElectronApplication,
    appInfo: ElectronAppInfo,
}