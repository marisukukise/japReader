const path = require('path');
const moment = require('moment');
const defaultUserSettings = {
    "options": {
        "darkMode": false,
        "useDeepL": true,
        "deepLDual": true,
        "deepLOnly": false,
        "fadeText": true,
        "addFurigana": true,
        "showGoal": true,
        "dailyGoal": 30,
        "tvMode": false,
        "translationTransparent": true,
        "readerFontSize": 25,
        "translationFontSize": 13,
        "dictFontSize": 17
    },
    "goal_data": {
        "date": moment().format("YYYY-MM-DD"),
        "streakCount": 0,
        "goalCount": 0
    },
    "status_data": {
        "seen": [],
        "known": [],
        "ignored": []
    }
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
    getDefaultUserSettings: function () { return defaultUserSettings; }
}