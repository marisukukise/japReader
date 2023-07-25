import { ElectronApplication } from 'playwright-core';
import { test } from '@playwright/test';
import { ElectronAppInfo } from 'electron-playwright-helpers';
import { WindowInfo } from './types';
import { startApp } from './startApp';
import { pause } from './utils';

let appInfo: ElectronAppInfo;
let electronApp: ElectronApplication;
let allWindows: WindowInfo[];
let visibleWindows: WindowInfo[];

let clipboardWindow: WindowInfo;
let deepWindow: WindowInfo;
let ichiWindow: WindowInfo;
let readerWindow: WindowInfo;
let dictionaryWindow: WindowInfo;
let translationWindow: WindowInfo;
let settingsWindow: WindowInfo;

const assignWindow = (windowName: string): WindowInfo => {
  if (allWindows.filter(e => e.name === windowName).length !== 1) {
    throw new Error(`There are more than 1 windows with name ${windowName}`)
  } else {
    return allWindows.filter(e => e.name === windowName)[0]
  }
}

test.beforeAll(async () => {
  const StartAppResponse = await startApp();
  appInfo = StartAppResponse.appInfo;
  electronApp = StartAppResponse.app;
  allWindows = StartAppResponse.windows;

  clipboardWindow = assignWindow("clipboard")
  deepWindow = assignWindow("deep")
  ichiWindow = assignWindow("ichi")
  readerWindow = assignWindow("reader")
  dictionaryWindow = assignWindow("dictionary")
  translationWindow = assignWindow("translation")
  settingsWindow = assignWindow("settings")


  return {clipboardWindow, deepWindow, ichiWindow, readerWindow, dictionaryWindow, translationWindow}
});

test.afterAll(async () => {
  await electronApp.close();
});