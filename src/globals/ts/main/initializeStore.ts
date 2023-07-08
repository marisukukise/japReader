const Store = require('electron-store');

const schemaOptions = {
    options: {
        type: "object",
        properties: {
            fontFamily: { default: "NotoSansJP", type: "string" },
            darkMode: { default: false, type: "boolean" },
            useDeepL: { default: true, type: "boolean" },
            useDeepLApi: { default: false, type: "boolean" },
            deepLApiKey: { default: "", type: "string" },
            deepLDual: { default: false, type: "boolean" },
            fadeText: { default: false, type: "boolean" },
            translationTransparent: { default: true, type: "boolean" },
            translationFontSize: { default: 12, type: "number", minimum: 1 },
            useReader: { default: true, type: "boolean" },
            leftClickDisregardStatus: { default: false, type: "boolean" },
            addFuriganaNew: { default: true, type: "boolean" },
            addFuriganaSeen: { default: true, type: "boolean" },
            addFuriganaKnown: { default: false, type: "boolean" },
            addFuriganaIgnored: { default: false, type: "boolean" },
            tvMode: { default: false, type: "boolean" },
            readerFontSize: { default: 18, type: "number", minimum: 1 },
            dictFontSize: { default: 12, type: "number", minimum: 1 },
            optionsFontSize: { default: 12, type: "number", minimum: 1 },
            ankiIntegration: { default: false, type: "boolean" },
            ankiDeckName: { default: "japReader", type: "string" },
            ankiModelName: { default: "japReader", type: "string" },
            ankiDictForm: { default: "DictForm", type: "string" },
            ankiDictFormReading: { default: "DictFormReading", type: "string" },
            ankiDictFormFurigana: { default: "DictFormFurigana", type: "string" },
            ankiWord: { default: "Word", type: "string" },
            ankiWordReading: { default: "WordReading", type: "string" },
            ankiWordFurigana: { default: "WordFurigana", type: "string" },
            ankiDefinitions: { default: "Definitions", type: "string" },
            ankiJapanese: { default: "Japanese", type: "string" },
            ankiEnglish: { default: "English", type: "string" },
        },
        default: {}
    }
}

interface StatusData {
    seen: string[];
    known: string[];
    ignored: string[];
}

interface SchemaStatusData {
    status_data: {
        type: "object";
        properties: {
            seen: { default: string[]; type: "array" };
            known: { default: string[]; type: "array" };
            ignored: { default: string[]; type: "array" };
        };
        default: StatusData;
    };
}

const schemaStatusData: SchemaStatusData = {
    status_data: {
        type: "object",
        properties: {
            seen: { default: [], type: "array" },
            known: { default: [], type: "array" },
            ignored: { default: [], type: "array" },
        },
        default: { seen: [], known: [], ignored: [] },
    },
};

const schemaAllowedProperties = {
    'width': { type: "number"},
    'height': { type: "number"},
    'x': { type: "number"},
    'y': { type: "number"},
    'isMaximized': { type: "boolean"},
    'backgroundColor': { type: "string"},
    'fontColor': { type: "string"},
    'fontSize': { type: "string"},
}

const schemaWindow = {
    settings: {
        type: "object",
        properties: schemaAllowedProperties,
        default: {}
    },
    translation: {
        type: "object",
        properties: schemaAllowedProperties,
        default: {}
    },
    reader: {
        type: "object",
        properties: schemaAllowedProperties,
        default: {}
    },
    dict: {
        type: "object",
        properties: schemaAllowedProperties,
        default: {}
    }
}

const schemaHistoryLogs = {
    history: {
        type: "array",
        items: {
            type: "object",
            properties: {
                timestamp: {
                    type: "number"
                },
                japanese: {
                    type: "string"
                },
                translation: {
                    type: ["string", "null"]
                }
            }
        }
    }
}

const windowStoreOptions = {
    schema: schemaWindow,
    name: "window_settings",
    clearInvalidConfig: true,
    cwd: 'config',
}

// TODO: change filename of settingsStore to settings.json from options.json
const settingsStoreOptions = {
    schema: schemaOptions,
    name: "options",
    clearInvalidConfig: true,
    cwd: 'config',
}

const statusDataStoreOptions = {
    schema: schemaStatusData,
    name: "status_data",
    clearInvalidConfig: true,
    cwd: 'config'
}

const historyOptioms = {
    schema: schemaHistoryLogs,
    name: "history",
    clearInvalidConfig: true,
    cwd: "logs"
}

const settingsStore = new Store(settingsStoreOptions);
const statusDataStore = new Store(statusDataStoreOptions);
const windowStore = new Store(windowStoreOptions)
const historyStore = new Store(historyOptioms);

export const getSettingsStore = () => settingsStore;
export const getStatusDataStore = () => statusDataStore;
export const getWindowStore = () => windowStore;
export const getHistoryStore = () => historyStore;