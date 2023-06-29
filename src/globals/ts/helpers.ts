import { BrowserWindow } from "electron";
import log from 'electron-log';

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