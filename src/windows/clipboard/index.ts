import { ipcRenderer, clipboard } from 'electron';
const clipboardListener = require('clipboard-event');
import log_renderer from 'electron-log/renderer';
const log = log_renderer.scope('clipboard');
import { IPC_CHANNELS } from '@globals/ts/main/objects';

const charLimit = 90;
let clipboardText = '';

// Time complexity is pretty bad on Linux,
// so keep this under 20
const clipboardReads = 11;

const formatText = (text: string) => {
    text = text.trim()
    // remove symbols (heart, star, etc.)
        .replace(/[\u22c0-\u266b]/g, '')
    // turn half-width digits into full-width
        .replace(
            /[0-9]/g,
            function(ch) { return String.fromCharCode(ch.charCodeAt(0) + 0xfee0); }
        );
    return text;
};

const handleChange = () => {
    let text = clipboard.readText();
  
    // Perform two additional reads to see if misreading was detected,
    // because sometimes randomly at low frequency (exact reason unknown)
    // clipboard.readText() return empty strings.
    if (text == '' || text != clipboard.readText() || text != clipboard.readText()) {
        log.verbose('Detected a misreading in clipboard');
        // If detected a misreading in the sample of 3 reads (rare case),
        // read clipboard many times in a row and get majority value from the array
    
        const clipboard_reads: any = [];
        for (let i = 0; i < clipboardReads; i++) clipboard_reads[i] = clipboard.readText();

        const counts: any = {};
        for (const e of clipboard_reads) counts[e] = counts[e] ? counts[e] + 1 : 1;

        text =  Object.keys(counts).length != 1 
            ? Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b) 
            : Object.keys(counts)[0];
    }

    text = formatText(text);

    if (text !== clipboardText && /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]|…/u.test(text)) {
        clipboardText = text;

        if (clipboardText.length >= charLimit) {
            log.warn('Too many characters copied');
            ipcRenderer.send(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.TOO_MANY_CHARACTERS);
        } else {
            log.verbose('Detected japanese text in clipboard: ', clipboardText);
            ipcRenderer.send(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.CHANGE_DETECTED, clipboardText);
        }
    }
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
