import { BrowserWindow } from "electron";
import log from 'electron-log';
import { getWindowStore } from "@globals/ts/initializeStore";
const windowStore = getWindowStore();

export const showWindowWhenReady = (window: BrowserWindow, shouldShowInProduction: boolean): void => {
  // Set the environment variable JAPREADER_ENV to "dev" to show all windows

  if (shouldShowInProduction) {
    window.once('ready-to-show', () => { 
      window.show(); 
      log.silly("Showing ", window.getTitle())
    });
    return;
  }

  // Added for debugging convenience
  if (process.env.JAPREADER_ENV === "dev") {
    window.once('ready-to-show', () => { 
      window.show(); 
      log.silly("Showing ", window.getTitle())
    });
    return;
  }
}

function filterObjectKeys(unfilteredObj: any, allowedKeys: string[]) {
  const filtered = Object.keys(unfilteredObj)
    .filter(key => allowedKeys.includes(key))
    .reduce((obj: any, key: any) => {
      obj[key] = unfilteredObj[key];
      return obj;
    }, {});
  return filtered;
}

export const createWindowAndStorePositionData = (windowName: string, windowConfig: any) => {
  const allowed = ['width', 'height', 'isMaximized', 'x', 'y']

  if (windowStore.has(windowName)) {
    const positionSettings = filterObjectKeys(windowStore.get(windowName), allowed);
    Object.assign(windowConfig,
      positionSettings
    );
    // get rid of rubbish properties
    windowStore.delete(windowName);
    windowStore.set(windowName, positionSettings)
  }

  const window = new BrowserWindow(windowConfig)
  if (windowConfig.isMaximized) window.maximize()

  // Events that will update the window position
  window.on("maximize", () => {
    windowStore.set(windowName + ".isMaximized", true);
  })
  window.on("unmaximize", () => {
    windowStore.set(windowName + ".isMaximized", false);
  })
  // @ts-expect-error Not sure problem TypeScript sees, but everything is fine
  window.on(process.platform == 'win32' ? "resized" : "resize", () => {
    let normalBounds = window.getNormalBounds();
    windowStore.set(windowName + ".width", normalBounds.width);
    windowStore.set(windowName + ".height", normalBounds.height);
  })
  // @ts-expect-error Not sure problem TypeScript sees, but everything is fine
  window.on(process.platform == 'win32' ? "moved" : "move", () => {
    let normalBounds = window.getNormalBounds();
    windowStore.set(windowName + ".x", normalBounds.x);
    windowStore.set(windowName + ".y", normalBounds.y);
  })

  return window;
}