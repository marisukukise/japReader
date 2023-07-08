export const WORD_DATA_STATUSES = {
    NEW: "new",
    SEEN: "seen",
    KNOWN: "known",
    IGNORED: "ignored",
}

export const IPC_CHANNELS = {
    ELECTRON: {},
    MAIN: {
        HANDLE: {
            RESTART_PROGRAM: "restartProgram"
        },
        REQUEST: {
            LIB_PATH: "get/libpath"
        }
    },
    ICHI: {
        ANNOUNCE: {
            CONNECTION_ERROR: "announce/ichi/connectionError",
            PARSED_WORDS_DATA: "set/ichi/wordData",
            IS_READY: "announce/ichi/isReady",
        },
        REQUEST: {
            IS_READY: "request/ichi/isReady",
        },
    },
    READER: {
        SET: {
            FOCUS: "set/reader/focus",
            BACKGROUND_COLOR: "set/reader/windowBackgroundColor",
            ALWAYS_ON_TOP: "set/reader/onTop",
        },
        ANNOUNCE: {
            IS_READY: "announce/reader/isReady",
            WORD_STATUS_CHANGE_DETECTED: "announce/word/changeStatus",
            EXTENDED_WORDS_DATA: "set/reader/extendedWordData",
        },
        REQUEST: {
            IS_READY: "request/reader/isReady",
        },
    },
    DEEP: {
        ANNOUNCE: {
            CONNECTION_ERROR: "announce/deep/connectionError",
            IS_READY: "announce/deep/isReady",
            TRANSLATED_TEXT: "set/deep/translationText",
        },
        REQUEST: {
            IS_READY: "request/deep/isReady",
        },
    },
    TRANSLATION: {
        SET: {
            FOCUS: "set/translation/focus",
            BACKGROUND_COLOR: "set/translation/windowBackgroundColor",
            ALWAYS_ON_TOP: "set/translation/onTop",
        },
        ANNOUNCE: {
            IS_READY: "announce/translation/isReady",
        },
        REQUEST: {
            IS_READY: "request/translation/isReady",
        },
    },
    CLIPBOARD: {
        ANNOUNCE: {
            CHANGE_DETECTED: "announce/clipboard/changeDetected",
            TOO_MANY_CHARACTERS: "announce/clipboard/tooManyCharacters",
            IS_READY: "announce/clipboard/isReady",
        },
        REQUEST: {
            IS_READY: "request/clipboard/isReady",
        },
    },
    DICTIONARY: {
        SET: {
            BACKGROUND_COLOR: "set/dictionary/windowBackgroundColor",
            ALWAYS_ON_TOP: "set/dictionary/onTop",
            OPEN: "set/dictionary/open",
        },
        ANNOUNCE: {
            IS_READY: "announce/dictionary/isReady",
        },
        REQUEST: {
            IS_READY: "request/dictionary/isReady",
        },
    },
    SETTINGS: {
        ANNOUNCE: {
            IS_READY: "announce/settings/isReady",
        },
        REQUEST: {
            SHOW_DIALOG: "showDialog",
            IS_READY: "request/settings/isReady",
        },
    },
    STORES: {
        HISTORY: {
            APPEND: "append/historyStore/entry"
        },
        STATUS_DATA: {},
        SETTINGS: {},
        WINDOWS: {},
    }
}