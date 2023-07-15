export const STATUS = {
    NEW: 'new',
    SEEN: 'seen',
    KNOWN: 'known',
    IGNORED: 'ignored',
};

export const IPC_CHANNELS = {
    MAIN: {
        HANDLE: {
            RESTART_PROGRAM: 'restartProgram'
        },
        REQUEST: {
            ANKI_CONNECT: 'post/anki',
            LIB_PATH: 'get/libpath'
        }
    },
    ICHI: {
        ANNOUNCE: {
            CONNECTION_ERROR: 'announce/ichi/connectionError',
            PARSED_WORDS_DATA: 'set/ichi/wordData',
            IS_READY: 'announce/ichi/isReady',
        },
        REQUEST: {
            IS_READY: 'request/ichi/isReady',
        },
    },
    READER: {
        SET: {
            SHOW: 'set/reader/show',
            HIDE: 'set/reader/hide',
            FOCUS: 'set/reader/focus',
            BACKGROUND_COLOR: 'set/reader/windowBackgroundColor',
            ALWAYS_ON_TOP: 'set/reader/onTop',
            HIDE_UI: 'set/reader/hideUI',
        },
        ANNOUNCE: {
            IS_READY: 'announce/reader/isReady',
            WORD_STATUS_CHANGE_DETECTED: 'announce/word/changeStatus',
            PARSED_WORDS_DATA: 'set/reader/IchiParsedWordData',
        },
        REQUEST: {
            SHOW_DIALOG: 'request/reader/showDialog',
            IS_READY: 'request/reader/isReady',
        },
    },
    DEEP: {
        ANNOUNCE: {
            CONNECTION_ERROR: 'announce/deep/connectionError',
            IS_READY: 'announce/deep/isReady',
            TRANSLATED_TEXT: 'set/deep/translationText',
        },
        REQUEST: {
            IS_READY: 'request/deep/isReady',
        },
    },
    TRANSLATION: {
        SET: {
            FOCUS: 'set/translation/focus',
            SHOW: 'set/translation/show',
            HIDE: 'set/translation/hide',
            BACKGROUND_COLOR: 'set/translation/windowBackgroundColor',
            ALWAYS_ON_TOP: 'set/translation/onTop',
            HIDE_UI: 'set/translation/hideUI',
        },
        ANNOUNCE: {
            IS_READY: 'announce/translation/isReady',
        },
        REQUEST: {
            SHOW_DIALOG: 'request/translation/showDialog',
            IS_READY: 'request/translation/isReady',
        },
    },
    CLIPBOARD: {
        ANNOUNCE: {
            CHANGE_DETECTED: 'announce/clipboard/changeDetected',
            TOO_MANY_CHARACTERS: 'announce/clipboard/tooManyCharacters',
            IS_READY: 'announce/clipboard/isReady',
        },
        REQUEST: {
            IS_READY: 'request/clipboard/isReady',
        },
    },
    DICTIONARY: {
        SET: {
            FOCUS: 'set/dictionary/focus',
            SHOW: 'set/dictionary/show',
            HIDE: 'set/dictionary/hide',
            BACKGROUND_COLOR: 'set/dictionary/windowBackgroundColor',
            ALWAYS_ON_TOP: 'set/dictionary/onTop',
            HIDE_UI: 'set/dictionary/hideUI',
        },
        ANNOUNCE: {
            IS_READY: 'announce/dictionary/isReady',
        },
        REQUEST: {
            SHOW_DIALOG: 'request/dictionary/showDialog',
            IS_READY: 'request/dictionary/isReady',
        },
    },
    SETTINGS: {
        SET: {
            FOCUS: 'set/settings/focus',
            SHOW: 'set/settings/show',
            HIDE: 'set/settings/hide',
            BACKGROUND_COLOR: 'set/settings/windowBackgroundColor',
            ALWAYS_ON_TOP: 'set/settings/onTop',
            HIDE_UI: 'set/settings/hideUI',
        },
        ANNOUNCE: {
            IS_READY: 'announce/settings/isReady',
        },
        REQUEST: {
            SHOW_DIALOG: 'request/settings/showDialog',
            IS_READY: 'request/settings/isReady',
        },
    },
    STORES: {
        HISTORY: {
            APPEND: 'append/historyStore/entry'
        },
        STATUS_DATA: {},
        SETTINGS: {},
        WINDOWS: {},
    }
};