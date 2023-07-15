export const STATUS = {
    NEW: 'new',
    SEEN: 'seen',
    KNOWN: 'known',
    IGNORED: 'ignored',
};

export const IPC_CHANNELS = {
    ANKI_CONNECT: {
        INVOKE: "invoke/anki"
    },
    JAPANESE_POD: {
        GET: {
            AUDIO_DURATION: "get/japanesePod/audioDuration",
            CAN_PLAY_AUDIO: "get/japanesePod/canPlayAudio"
        },
        INVOKE: {
            PLAY_AUDIO: "invoke/japanesePod/play"
        }
    },
    MAIN: {
        HANDLE: {
            RESTART_PROGRAM: 'main/handle/restartProgram'
        },
        REQUEST: {
            LIB_PATH: 'main/request/libpath'
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
        SET: {
            SHOW: 'reader/set/show',
            HIDE: 'reader/set/hide',
            FOCUS: 'reader/set/focus',
            BACKGROUND_COLOR: 'reader/set/windowBackgroundColor',
            ALWAYS_ON_TOP: 'reader/set/alwaysOnTop',
            HIDE_UI: 'reader/set/hideUI',
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
        SET: {
            FOCUS: 'translation/set/focus',
            SHOW: 'translation/set/show',
            HIDE: 'translation/set/hide',
            BACKGROUND_COLOR: 'translation/set/windowBackgroundColor',
            ALWAYS_ON_TOP: 'translation/set/alwaysOnTop',
            HIDE_UI: 'translation/set/hideUI',
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
        SET: {
            FOCUS: 'dictionary/set/focus',
            SHOW: 'dictionary/set/show',
            HIDE: 'dictionary/set/hide',
            BACKGROUND_COLOR: 'dictionary/set/windowBackgroundColor',
            ALWAYS_ON_TOP: 'dictionary/set/alwaysOnTop',
            HIDE_UI: 'dictionary/set/hideUI',
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
        SET: {
            FOCUS: 'settings/set/focus',
            SHOW: 'settings/set/show',
            HIDE: 'settings/set/hide',
            BACKGROUND_COLOR: 'settings/set/windowBackgroundColor',
            ALWAYS_ON_TOP: 'settings/set/alwaysOnTop',
            HIDE_UI: 'settings/set/hideUI',
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