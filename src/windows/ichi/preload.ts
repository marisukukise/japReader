// Some black magic is going on in this file
// Better left alone as long as it works

import { ipcRenderer } from 'electron';
import log_renderer from 'electron-log/renderer';
const log = log_renderer.scope('ichi');
import { IPC_CHANNELS } from '@globals/ts/main/objects';
import { getWordStatusData, mountLog } from '@globals/ts/renderer/helpers';


const WORDS: japReader.IchiParsedWordData[] = [];
const PARSED_WORDS: japReader.IchiParsedWordData[] = [];
let FULL_TEXT = '';
const EMPTY_WORD_DATA: japReader.IchiParsedWordData = {
    word: '',
    infinitive: '',
    infinitiveKana: '',
    wordKana: '',
    definitions: '',
    status: '',
};


const addMissingCharacters = (wordData: japReader.IchiParsedWordData, index: any): void => {
    const searchIndex = FULL_TEXT.indexOf(wordData.word);

    if (searchIndex > 0) {
        const missingText = FULL_TEXT.substring(0, searchIndex);
        Array.from(missingText).forEach((char) => {
            PARSED_WORDS.push({
                ...EMPTY_WORD_DATA,
                word: char,
            });
        });

        FULL_TEXT = FULL_TEXT.replace(missingText, '');
        addMissingCharacters(wordData, null);
    } else {
        PARSED_WORDS.push(wordData);
        FULL_TEXT = FULL_TEXT.replace(wordData.word, '');
    }

    if (index === WORDS.length - 1 && FULL_TEXT.length > 0) {
        Array.from(FULL_TEXT).forEach((char) => {
            PARSED_WORDS.push({
                ...EMPTY_WORD_DATA,
                word: char,
            });
        });
    }
};


const getInfinitive = (text: string): string => {
    return text
        .replace(/ 【.+/g, '')
        .replace(/[0-9]+\. /g, '')
        .replace(/\s/g, '');
};

const getReading = (text: string): string => {
    let readingText = text
        .replace(/.+【/g, '')
        .replace(/】/g, '')
        .replace(/[0-9]+\. /g, '')
        .replace(/\s/g, '');
    readingText = Array.from(readingText)
        .filter((char) => /[\p{Script=Hiragana}\p{Script=Katakana}|ー]/u.test(char))
        .join('');
    return readingText;
};

const getWord = (text: string): string => {
    return text
        .replace(/ 【.+/, '')
        .replace(/[0-9]+\. /, '');
};

window.addEventListener('DOMContentLoaded', () => {
    mountLog(log, '🔺 Mounted');
    // eslint-disable-next-line global-require
    const $ = require('jquery');

    ipcRenderer.on(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.CHANGE_DETECTED, (event, text) => {
        document.location.href = `https://ichi.moe/cl/qr/?q=${text}&r=kana`;
    });

    const connectionCheck = setTimeout(() => {
        if (document.querySelector('.wrapper')) {
            ipcRenderer.send(IPC_CHANNELS.ICHI.ANNOUNCE.IS_READY);
            clearInterval(connectionCheck);
        }
    }, 500);

    if (document.location.href === 'https://ichi.moe/cl/qr/?q=&r=kana')
        return;
    if (!document.location.href.includes('https://ichi.moe/'))
        return;

    const gloss_row = document.querySelectorAll('.gloss-row');
    Array.from(gloss_row).forEach((row) => {
        if (!row.classList.contains('hidden'))
            row.classList.add('word-chunk');
    });

    const jsp_panes = document.querySelectorAll('.word-chunk .jspPane');
    Array.from(jsp_panes).forEach((jsp_pane: Element) => {
        const wordData = { ...EMPTY_WORD_DATA };

        jsp_pane.classList.add('current-word');

        const first_child_dt = document.querySelector('.current-word dt:first-child');
        wordData.word = getWord(first_child_dt.textContent);

        const dt = document.querySelector('.current-word dt');
        const compounds = document.querySelector('.current-word .compounds');
        const conj_gloss_dt = document.querySelector('.current-word .conj-gloss dl dt');
        const conjugations_dt = $('.current-word .compounds dd:first .conjugations dl dt');
        const first_dt = $('.current-word .compounds dt:first');
        const current_word = document.querySelector('.current-word');

        if (compounds) {
            if (conjugations_dt.length > 0) {
                wordData.infinitive = getInfinitive(conjugations_dt[0].textContent);
                wordData.infinitiveKana = getReading(conjugations_dt[0].textContent);
            }
            else {
                wordData.infinitive = getInfinitive(first_dt[0].textContent);
                wordData.infinitiveKana = getReading(first_dt[0].textContent);
            }

            wordData.wordKana = getReading(dt.textContent);
        }
        else if (conj_gloss_dt) {
            wordData.infinitive = getInfinitive(conj_gloss_dt.textContent);
            wordData.infinitiveKana = getReading(conj_gloss_dt.textContent);
            wordData.wordKana = getReading(dt.textContent);
        }
        else {
            wordData.infinitive = getInfinitive(dt.textContent);
            wordData.infinitiveKana = getReading(dt.textContent);
            wordData.wordKana = getReading(dt.textContent);
        }

        const alternatives = document.querySelector('.current-word dl.alternatives');
        if (current_word.innerHTML.includes('[')) {
            wordData.definitions = alternatives.innerHTML;
        }

        WORDS.push(wordData);

        jsp_pane.classList.remove('current-word');
    }
    );

    const query_text = document.querySelectorAll('.query-text');
    Array.from(query_text).forEach((element) => {
        FULL_TEXT += element.textContent;
    });

    if (WORDS.length === 0)
        WORDS.push({
            ...EMPTY_WORD_DATA,
            word: FULL_TEXT,
        });

    WORDS.forEach((wordData, index) => {
        addMissingCharacters(wordData, index);
    });

    FULL_TEXT = '';

    Array.from(query_text).forEach((element) => {
        FULL_TEXT += element.textContent;
    });

    // Add status to words
    const EXTENDED_WORDS: japReader.IchiParsedWordData[] = PARSED_WORDS.map((word: japReader.IchiParsedWordData) => {
        word['status'] = getWordStatusData(word.infinitive);
        return word;
    });
    ipcRenderer.send(IPC_CHANNELS.ICHI.ANNOUNCE.PARSED_WORDS_DATA, EXTENDED_WORDS, FULL_TEXT);
});

setTimeout(() => {
    if (document.body.children.length === 0) {
        ipcRenderer.send(IPC_CHANNELS.ICHI.ANNOUNCE.CONNECTION_ERROR);
    }
}, 10000);
