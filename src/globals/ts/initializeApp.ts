import log from 'electron-log';

const useDeepLApi = false;
const useDeepL = true;
const useReader = true;


// Modules that create BrowserWindows and their
// predefined URLs for BrowserWindows from the Webpack
// @ts-expect-error @src is a webpack alias
import { createClipboardWindow } from '@src/windows/clipboard/main_process/create';
declare const CLIPBOARD_WEBPACK_ENTRY: string;

// @ts-expect-error @src is a webpack alias
import { createDeepWindow } from '@src/windows/deep/main_process/create';
declare const DEEP_WEBPACK_ENTRY: string;
declare const DEEP_PRELOAD_WEBPACK_ENTRY: string;

// @ts-expect-error @src is a webpack alias
import { createIchiWindow } from '@src/windows/ichi/main_process/create';
declare const ICHI_PRELOAD_WEBPACK_ENTRY: string;

// @ts-expect-error @src is a webpack alias
import { createTranslationWindow } from '@src/windows/translation/main_process/create';
declare const TRANSLATION_WEBPACK_ENTRY: string;

// @ts-expect-error @src is a webpack alias
import { createReaderWindow } from '@src/windows/reader/main_process/create';
declare const READER_WEBPACK_ENTRY: string;

// @ts-expect-error @src is a webpack alias
import { createDictionaryWindow } from '@src/windows/dictionary/main_process/create';
declare const DICTIONARY_WEBPACK_ENTRY: string;

// @ts-expect-error @src is a webpack alias
import { createSettingsWindow } from '@src/windows/settings/main_process/create';
declare const SETTINGS_WEBPACK_ENTRY: string;


export const initializeApp = (): void => {
  log.debug("Initializing japReader windows...")

  const clipboardWindow = createClipboardWindow(CLIPBOARD_WEBPACK_ENTRY);
  const ichiWindow = createIchiWindow(ICHI_PRELOAD_WEBPACK_ENTRY);
  if (useReader) {
    const readerWindow = createReaderWindow(READER_WEBPACK_ENTRY);
  }
  if (useDeepL) {
    const deepWindow = createDeepWindow(DEEP_PRELOAD_WEBPACK_ENTRY, DEEP_WEBPACK_ENTRY);
    const translationWindow = createTranslationWindow(TRANSLATION_WEBPACK_ENTRY);
  }
  const dictionaryWindow = createDictionaryWindow(DICTIONARY_WEBPACK_ENTRY);
  const settingsWindow = createSettingsWindow(SETTINGS_WEBPACK_ENTRY);
};
