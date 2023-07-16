const Store = require('electron-store');

const schemaSettings = {
    global_settings: {
        type: 'object',
        properties: {
            useDeepL: { default: true, type: 'boolean' },
            useDeepLApi: { default: false, type: 'boolean' },
            deepLApiKey: { default: '', type: 'string' },
            useReader: { default: true, type: 'boolean' },
            clickThroughWindows: { default: false, type: 'boolean' },
            ankiIntegration: { default: false, type: 'boolean' },
            ankiDeckName: { default: 'japReader', type: 'string' },
            ankiModelName: { default: 'japReader', type: 'string' },
            ankiInfinitive: { default: 'Infinitive', type: 'string' },
            ankiInfinitiveKana: { default: 'InfinitiveKana', type: 'string' },
            ankiInfinitiveFurigana: { default: 'InfinitiveFurigana', type: 'string' },
            ankiWord: { default: 'Word', type: 'string' },
            ankiWordKana: { default: 'WordKana', type: 'string' },
            ankiWordFurigana: { default: 'WordFurigana', type: 'string' },
            ankiDefinitions: { default: 'Definitions', type: 'string' },
            ankiJapaneseSentence: { default: 'JapaneseSentence', type: 'string' },
            ankiTranslatedSentence: { default: 'TranslatedSentence', type: 'string' },
        },
        default: {}
    }
};



interface SchemaStatusData {
    status_data: {
        type: 'object';
        properties: {
            seen: { default: string[]; type: 'array' };
            known: { default: string[]; type: 'array' };
            ignored: { default: string[]; type: 'array' };
        };
        default: japReader.StatusDataStore;
    };
}

const schemaStatusData: SchemaStatusData = {
    status_data: {
        type: 'object',
        properties: {
            seen: { default: [], type: 'array' },
            known: { default: [], type: 'array' },
            ignored: { default: [], type: 'array' },
        },
        default: { seen: [], known: [], ignored: [] },
    },
};

const schemaAllowedProperties = {
    'width': { type: 'number' },
    'height': { type: 'number' },
    'x': { type: 'number' },
    'y': { type: 'number' },
    'isMaximized': { type: 'boolean' },
    'backgroundColor': { type: 'string' },
    'alwaysOnTop': { type: 'boolean' },
    'additional': {
        type: 'object',
    },
};

const defaultAdditionalWindowProperties = {
    'fontSize': '16.00pt',
    'fontGlowStrength': '1',
    'bodyPadding': '1.00rem'
};

const defaultMainWindowProperties = {
    'alwaysOnTop': false,
    'backgroundColor': 'rgba(231, 222, 230, 0.925)',
};

const schemaWindow = {
    settings: {
        type: 'object',
        properties: schemaAllowedProperties,
        default: {
            ...defaultMainWindowProperties,
            additional: {
                ...defaultAdditionalWindowProperties
            }
        }
    },
    translation: {
        type: 'object',
        properties: schemaAllowedProperties,
        default: {
            ...defaultMainWindowProperties,
            additional: {
                ...defaultAdditionalWindowProperties
            }
        }
    },
    reader: {
        type: 'object',
        properties: schemaAllowedProperties,
        default: {
            ...defaultMainWindowProperties,
            additional: {
                ...defaultAdditionalWindowProperties,
                'furigana': [
                    'new', 'seen'
                ]
            }
        }
    },
    dictionary: {
        type: 'object',
        properties: schemaAllowedProperties,
        default: {
            ...defaultMainWindowProperties,
            additional: {
                ...defaultAdditionalWindowProperties,
            }
        }
    }
};

const schemaHistoryLogs = {
    history: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                timestamp: {
                    type: 'number'
                },
                japanese: {
                    type: 'string'
                },
                translation: {
                    type: ['string', 'null']
                }
            }
        }
    }
};

const windowStoreOptions = {
    schema: schemaWindow,
    name: 'window_settings',
    clearInvalidConfig: true,
    cwd: 'config',
};

const settingsStoreOptions = {
    schema: schemaSettings,
    name: 'settings',
    clearInvalidConfig: true,
    cwd: 'config',
};

const statusDataStoreOptions = {
    schema: schemaStatusData,
    name: 'status_data',
    clearInvalidConfig: true,
    cwd: 'config'
};

const historyOptioms = {
    schema: schemaHistoryLogs,
    name: 'history',
    clearInvalidConfig: true,
    cwd: 'logs'
};

const settingsStore = new Store(settingsStoreOptions);
const statusDataStore = new Store(statusDataStoreOptions);
const windowStore = new Store(windowStoreOptions);
const historyStore = new Store(historyOptioms);

export const getSettingsStore = () => settingsStore;
export const getStatusDataStore = () => statusDataStore;
export const getWindowStore = () => windowStore;
export const getHistoryStore = () => historyStore;