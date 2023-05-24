const path = require('path');
const moment = require('moment');
const schemaOptions = {
    options: {
        type: "object",
        properties: {
            fontFamily: { default: "NotoSansJP", type: "string" },
            darkMode: { default: false, type: "boolean" },
            useDeepL: { default: true, type: "boolean" },
            useDeepLApi: { default: false, type: "boolean" },
            deepLApiKey: { default: "", type: "string" },
            deepLDual: { default: true, type: "boolean" },
            fadeText: { default: true, type: "boolean" },
            translationTransparent: { default: true, type: "boolean" },
            translationFontSize: { default: 12, type: "number", minimum: 1 },
            useReader: { default: true, type: "boolean" },
            leftClickDisregardStatus: { default: false, type: "boolean" },
            addFurigana: { default: true, type: "boolean" },
            tvMode: { default: false, type: "boolean" },
            showGoal: { default: false, type: "boolean" },
            dailyGoal: { default: 30, type: "number", minimum: 1 },
            readerFontSize: { default: 18, type: "number", minimum: 1 },
            dictFontSize: { default: 12, type: "number", minimum: 1 },
            optionsFontSize: { default: 12, type: "number", minimum: 1 },
            ankiIntegration: { default: true, type: "boolean" },
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

const schemaGoalData = {
    goal_data: {
        type: "object",
        properties: {
            date: { default: moment().format("YYYY-MM-DD"), type: "string" },
            streakCount: { default: 0, type: "number" },
            goalCount: { default: 0, type: "number" },
        },
        default: {}
    }
}

const schemaStatusData = {
    status_data: {
        type: "object",
        properties: {
            seen: { default: [], type: "array" },
            known: { default: [], type: "array" },
            ignored: { default: [], type: "array" },
        },
        default: {}
    }
}


const schemaWindow = {
    options: {
        type: "object",
        default: {}
    },
    translation: {
        type: "object",
        default: {}
    },
    reader: {
        type: "object",
        default: {}
    },
    dict: {
        type: "object",
        default: {}
    }
}

const schemaHistoryLogs = {
    history: {
        type: "array",
        required: ["timestamp", "japanese"],
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
                    type: "string"
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

const optionsStoreOptions = {
    schema: schemaOptions,
    name: "options",
    clearInvalidConfig: true,
    cwd: 'config',
}

const goalDataStoreOptions = {
    schema: schemaGoalData,
    name: "goal_data",
    clearInvalidConfig: true,
    cwd: 'config',
}

const statusDataStoreOptions = {
    schema: schemaStatusData,
    name: "status_data",
    clearInvalidConfig: true,
    cwd: 'config'
}

const historyLogsOptioms = {
    schema: schemaHistoryLogs,
    name: "history",
    clearInvalidConfig: true,
    cwd: "logs"
}

let ___stayTimer;
module.exports = {
    dirname_path: function (directory) {
        return path.join(__dirname, directory);
    },
    toggle_onTop: function (onTop, jqry_body) {
        const $ = require('jquery');

        onTop = !onTop;
        if (onTop) {
            $('#on-top-msg').remove();
            clearTimeout(___stayTimer);
            jqry_body.prepend(
                '<div id="on-top-msg"><section>On Top: True</section></div>',
            );
            ___stayTimer = setTimeout(() => {
                $('#on-top-msg').remove();
            }, 1000);
        } else {
            $('#on-top-msg').remove();
            clearTimeout(___stayTimer);
            jqry_body.prepend(
                '<div id="on-top-msg"><section>On Top: False</section></div>',
            );
            ___stayTimer = setTimeout(() => {
                $('#on-top-msg').remove();
            }, 1000);
        }
        return onTop;
    },
    getOptionsStoreOptions: function () { return optionsStoreOptions; },
    getGoalDataStoreOptions: function () { return goalDataStoreOptions; },
    getStatusDataStoreOptions: function () { return statusDataStoreOptions; },
    getWindowStoreOptions: function () { return windowStoreOptions; },
    getHistoryLogsOptions: function () { return historyLogsOptioms; }
}