import { ElectronApplication, Page, _electron as electron } from 'playwright-core';
import { test, expect } from '@playwright/test';
import { findLatestBuild, parseElectronApp, stubMultipleDialogs } from 'electron-playwright-helpers';
import { WindowInfo } from './types';

let electronApp: ElectronApplication;


let clipboardWindow: WindowInfo;
let deepWindow: WindowInfo;
let ichiWindow: WindowInfo;
let readerWindow: WindowInfo;
let dictionaryWindow: WindowInfo;
let translationWindow: WindowInfo;
let settingsWindow: WindowInfo;

let allWindows: WindowInfo[];
let visibleWindows: WindowInfo[];

test.beforeAll(async () => {
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
        throw new Error(`Electron should have spawned 7 windows, but spawned ${nonDevToolPages.length} windows instead`);
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

        switch (windowName) {
            case 'clipboard':
                clipboardWindow = {
                    page: page,
                    name: windowName,
                };
                break;
            case 'dictionary':
                dictionaryWindow = {
                    page: page,
                    name: windowName,
                };
                break;
            case 'ichi':
                ichiWindow = {
                    page: page,
                    name: windowName,
                };
                break;
            case 'deep':
                deepWindow = {
                    page: page,
                    name: windowName,
                };
                break;
            case 'reader':
                readerWindow = {
                    page: page,
                    name: windowName,
                };
                break;
            case 'translation':
                translationWindow = {
                    page: page,
                    name: windowName,
                };
                break;
            case 'settings':
                settingsWindow = {
                    page: page,
                    name: windowName,
                };
                break;
            default:
        }
    });

    if (!dictionaryWindow) throw new Error('Dictionary page is not defined');
    if (!readerWindow) throw new Error('Reader page is not defined');
    if (!translationWindow) throw new Error('Translation page is not defined');
    if (!settingsWindow) throw new Error('Settings page is not defined');
    if (!clipboardWindow) throw new Error('Clipboard page is not defined');
    if (!ichiWindow) throw new Error('ichi.moe page is not defined');
    if (!deepWindow) throw new Error('deepl.com page is not defined');

    visibleWindows = [
        dictionaryWindow,
        readerWindow,
        translationWindow,
        settingsWindow
    ];

    allWindows = [
        ...visibleWindows,
        clipboardWindow,
        deepWindow,
        ichiWindow
    ];
});

test.afterAll(async () => {
    await electronApp.close();
});

test('Visible windows titles', async () => {
    const readerTitle = await readerWindow.page.title();
    expect(readerTitle).toBe('japReader');
    const dictionaryTitle = await dictionaryWindow.page.title();
    expect(dictionaryTitle).toBe('japReader - Dictionary');
    const translationTitle = await translationWindow.page.title();
    expect(translationTitle).toBe('japReader - Translation');
    const settingsTitle = await settingsWindow.page.title();
    expect(settingsTitle).toBe('japReader - Settings');
});