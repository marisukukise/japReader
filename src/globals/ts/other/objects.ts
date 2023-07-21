export const STATUS = {
    NEW: 'new',
    SEEN: 'seen',
    KNOWN: 'known',
    IGNORED: 'ignored',
};

export const IPC_CHANNELS = {
    ANKI_CONNECT: {
        INVOKE: 'invoke/anki'
    },
    MAIN: {
        SET: {
            CUSTOM_FONT: 'main/set/customFont',
        },
        HANDLE: {
            IGNORE_MOUSE_EVENTS: 'main/handle/ignoreMouseEvents',
            RESTART_PROGRAM: 'main/handle/restartProgram',
            OPEN_EXTERNAL: 'main/handle/openExternal'
        },
        REQUEST: {
            CUSTOM_FONT_PATH: 'main/request/customFontPath',
            LIB_PATH: 'main/request/libPath',
            FONT_LIST: 'main/request/fontList',
        }
    },
    ICHI: {
        ANNOUNCE: {
            CONNECTION_ERROR: 'ichi/announce/connectionError',
            PARSED_WORDS_DATA: 'ichi/announce/wordData',
            IS_READY: 'ichi/announce/isReady',
        },
        REQUEST: {
            IS_READY: 'ichi/request/isReady',
        },
    },
    READER: {
        TOGGLE: {
            ALWAYS_ON_TOP: 'reader/toggle/alwaysOnTop',
        },
        SET: {
            SHOW: 'reader/set/show',
            MOVE_TOP: 'reader/set/moveTop',
            HIDE: 'reader/set/hide',
            FOCUS: 'reader/set/focus',
            BACKGROUND_COLOR: 'reader/set/windowBackgroundColor',
            TOGGLE_UI: 'reader/set/toggleUI',
            SHOW_UI: 'reader/set/showUI',
        },
        ANNOUNCE: {
            IS_READY: 'reader/announce/isReady',
            WORD_STATUS_CHANGE_DETECTED: 'reader/announce/wordStatusChangeDetected',
            PARSED_WORDS_DATA: 'reader/announce/parsedWordsData',
        },
        REQUEST: {
            SHOW_DIALOG: 'reader/request/showDialog',
            IS_READY: 'reader/request/isReady',
        },
    },
    DEEP: {
        ANNOUNCE: {
            CONNECTION_ERROR: 'deep/announce/connectionError',
            IS_READY: 'deep/announce/isReady',
            TRANSLATED_TEXT: 'deep/announce/translationText',
        },
        REQUEST: {
            IS_READY: 'deep/request/isReady',
        },
    },
    TRANSLATION: {
        TOGGLE: {
            ALWAYS_ON_TOP: 'translation/toggle/alwaysOnTop',
        },
        SET: {
            FOCUS: 'translation/set/focus',
            SHOW: 'translation/set/show',
            MOVE_TOP: 'translation/set/moveTop',
            HIDE: 'translation/set/hide',
            BACKGROUND_COLOR: 'translation/set/windowBackgroundColor',
            TOGGLE_UI: 'translation/set/toggleUI',
            SHOW_UI: 'translation/set/showUI',
        },
        ANNOUNCE: {
            IS_READY: 'translation/announce/isReady',
        },
        REQUEST: {
            SHOW_DIALOG: 'translation/request/showDialog',
            IS_READY: 'translation/request/isReady',
        },
    },
    CLIPBOARD: {
        ANNOUNCE: {
            CHANGE_DETECTED: 'clipboard/announce/changeDetected',
            TOO_MANY_CHARACTERS: 'clipboard/announce/tooManyCharacters',
            IS_READY: 'clipboard/announce/isReady',
        },
        REQUEST: {
            IS_READY: 'clipboard/request/isReady',
        },
    },
    DICTIONARY: {
        TOGGLE: {
            ALWAYS_ON_TOP: 'dictionary/toggle/alwaysOnTop',
        },
        SET: {
            FOCUS: 'dictionary/set/focus',
            SHOW: 'dictionary/set/show',
            MOVE_TOP: 'dictionary/set/moveTop',
            HIDE: 'dictionary/set/hide',
            BACKGROUND_COLOR: 'dictionary/set/windowBackgroundColor',
            TOGGLE_UI: 'dictionary/set/toggleUI',
            SHOW_UI: 'dictionary/set/showUI',
        },
        ANNOUNCE: {
            IS_READY: 'dictionary/announce/isReady',
        },
        REQUEST: {
            SHOW_DIALOG: 'dictionary/request/showDialog',
            IS_READY: 'dictionary/request/isReady',
        },
    },
    SETTINGS: {
        TOGGLE: {
            ALWAYS_ON_TOP: 'settings/toggle/alwaysOnTop',
        },
        SET: {
            FOCUS: 'settings/set/focus',
            SHOW: 'settings/set/show',
            MOVE_TOP: 'settings/set/moveTop',
            HIDE: 'settings/set/hide',
            BACKGROUND_COLOR: 'settings/set/windowBackgroundColor',
            TOGGLE_UI: 'settings/set/toggleUI',
            SHOW_UI: 'settings/set/showUI',
        },
        ANNOUNCE: {
            IS_READY: 'settings/announce/isReady',
        },
        REQUEST: {
            SHOW_DIALOG: 'settings/request/showDialog',
            IS_READY: 'settings/request/isReady',
        },
    },
    STORES: {
        HISTORY: {
            APPEND: 'historyStore/append/entry'
        },
        // TODO: Move stores to the main process
        STATUS_DATA: {},
        SETTINGS: {},
        WINDOWS: {},
    }
};