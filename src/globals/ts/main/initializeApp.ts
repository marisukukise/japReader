
import { getSettingsStore } from '@globals/ts/main/initializeStore';
const settingsStore = getSettingsStore();
const { useDeepL, useReader } = settingsStore.get('global_settings');


// Modules that create BrowserWindows and their
// predefined URLs for BrowserWindows from the Webpack
import { createClipboardWindow } from '@src/windows/clipboard/_init';
declare const CLIPBOARD_WEBPACK_ENTRY: string;

import { createDeepWindow } from '@src/windows/deep/_init';
declare const DEEP_WEBPACK_ENTRY: string;
declare const DEEP_PRELOAD_WEBPACK_ENTRY: string;

import { createIchiWindow } from '@src/windows/ichi/_init';
declare const ICHI_PRELOAD_WEBPACK_ENTRY: string;

import { createTranslationWindow } from '@src/windows/translation/_init';
declare const TRANSLATION_WEBPACK_ENTRY: string;

import { createReaderWindow } from '@src/windows/reader/_init';
declare const READER_WEBPACK_ENTRY: string;

import { createDictionaryWindow } from '@src/windows/dictionary/_init';
declare const DICTIONARY_WEBPACK_ENTRY: string;

import { createSettingsWindow } from '@src/windows/settings/_init';
import { BrowserWindow } from 'electron';
declare const SETTINGS_WEBPACK_ENTRY: string;



export const initializeApp = (): japReader.Windows => {
    const clipboardWindow = createClipboardWindow(CLIPBOARD_WEBPACK_ENTRY);
    const settingsWindow = createSettingsWindow(SETTINGS_WEBPACK_ENTRY);
    const windows: japReader.Windows = {
        clipboard: clipboardWindow,
        settings: settingsWindow
    };

    if (useReader) {
        const ichiWindow = createIchiWindow(ICHI_PRELOAD_WEBPACK_ENTRY);
        windows.ichi = ichiWindow
        const readerWindow = createReaderWindow(READER_WEBPACK_ENTRY);
        windows.reader = readerWindow
        const dictionaryWindow = createDictionaryWindow(DICTIONARY_WEBPACK_ENTRY);
        windows.dictionary = dictionaryWindow
    }
    if (useDeepL) {
        const deepWindow = createDeepWindow(DEEP_PRELOAD_WEBPACK_ENTRY, DEEP_WEBPACK_ENTRY);
        windows.deep = deepWindow
        const translationWindow = createTranslationWindow(TRANSLATION_WEBPACK_ENTRY);
        windows.translation = translationWindow
    }

    return windows;
};
