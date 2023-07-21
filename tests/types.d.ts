import { ElectronAppInfo } from "electron-playwright-helpers";
import { ElectronApplication, Page } from "playwright-core";

interface VisibleWindow {
    windowName: string;
    page: Page;
}

interface StartAppResponse {
    electronApp: ElectronApplication;
    visibleWindows: VisibleWindow[];
    appInfo: ElectronAppInfo;
}