import { ipcRenderer, clipboard } from 'electron';
const clipboardListener = require('clipboard-event');
import log_renderer from 'electron-log/renderer';
const log = log_renderer.scope('clipboard');
import { IPC_CHANNELS } from '@root/src/globals/ts/other/objects';

const charLimit = 90;
let clipboardText = '';


/**
 * Replaces half-width digits with full-width digits.
 * Removes symbols like hearts, starts, etc.
 * @param text Unformatted text
 * @returns Formatted text
 */
const formatText = (text: string): string => {
    text = text.trim()
        // remove symbols (heart, star, etc.)
        .replace(/[\u22c0-\u266b]/g, '')
        // turn half-width digits into full-width
        .replace(
            /[0-9]/g,
            function (ch) { return String.fromCharCode(ch.charCodeAt(0) + 0xfee0); }
        );
    return text;
};



/**
 * Verifies whether the current text in the clipboard contents contains Japanese characters
 * and is different than the previous clipboard contents. If yes, formats the text by stripping it
 * from junk characters and announces the formatted text.
 * @returns True if the clipboard contents was valid for further use
 */
const handleChange = (): boolean => {
    let text: string = clipboard.readText();

    /**
     * Perform two additional reads to see if misreading was detected,
     * because sometimes randomly at low frequency (exact reason unknown)
     * clipboard.readText() return empty strings.
     * If two additional reads are different from the first, original read
     * then read clipboard many times in a row to determine the majority, "real" value.
     */
    if (text === '' || text !== clipboard.readText() || text !== clipboard.readText()) {
        log.debug('Detected a misreading in clipboard');

        const EMERGENCY_CLIPBOARD_READ_NO = 11; // Number of reads to perform to determine majority

        const clipboard_reads: any = [];
        for (let i = 0; i < EMERGENCY_CLIPBOARD_READ_NO; i++) clipboard_reads[i] = clipboard.readText();

        const counts: any = {};
        for (const e of clipboard_reads) counts[e] = counts[e] ? counts[e] + 1 : 1;

        const majorityText: (string | undefined) = Object.keys(counts).length != 1
            ? Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b)
            : Object.keys(counts)[0];
        
        if (majorityText) text = majorityText;
        else return false;
    }

    text = formatText(text);

    if (text !== clipboardText && /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]|…/u.test(text)) {
        clipboardText = text;

        if (clipboardText.length >= charLimit) {
            log.warn('Too many characters copied');
            ipcRenderer.send(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.TOO_MANY_CHARACTERS);
            return false;
        } else {
            log.verbose('Detected japanese text in clipboard: ', clipboardText);
            ipcRenderer.send(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.CHANGE_DETECTED, clipboardText);
            return true;
        }
    }
    return false;
};

window.addEventListener('DOMContentLoaded', () => {

    ipcRenderer.invoke(IPC_CHANNELS.MAIN.REQUEST.LIB_PATH).then((libPath: string) => {
        clipboardListener.startListening(libPath);

        ipcRenderer.send(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.IS_READY);
        clipboardListener.on('change', () => {
            handleChange();
        });

    });
});
