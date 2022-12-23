const path = require('path');
const moment = require('moment');
const schemaUserSettings = {
    options: {
        type: "object",
        properties: {
            darkMode: { default: false, type: "boolean" },
            useDeepL: { default: true, type: "boolean" },
            deepLDual: { default: true, type: "boolean" },
            fadeText: { default: true, type: "boolean" },
            translationTransparent: { default: true, type: "boolean" },
            translationFontSize: { default: 13, type: "number", minimum: 1 },
            useReader: { default: true, type: "boolean" },
            addFurigana: { default: true, type: "boolean" },
            tvMode: { default: false, type: "boolean" },
            showGoal: { default: true, type: "boolean" },
            dailyGoal: { default: 30, type: "number", minimum: 1 },
            readerFontSize: { default: 25, type: "number", minimum: 1 },
            dictFontSize: { default: 17, type: "number", minimum: 1 },
        },
        default: {}
    },
    goal_data: {
        type: "object",
        properties: {
            date: { default: moment().format("YYYY-MM-DD"), type: "string" },
            streakCount: { default: 0, type: "number" },
            goalCount: { default: 0, type: "number" },
        },
        default: {}
    },
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

const windowStoreOptions = {
    name: "window_settings",
    clearInvalidConfig: true,
}

const userStoreOptions = {
    schema: schemaUserSettings,
    name: "user_settings",
    clearInvalidConfig: true,
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
    getUserStoreOptions: function () { return userStoreOptions; },
    getWindowStoreOptions: function () { return windowStoreOptions; }
}