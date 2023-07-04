// Some black magic is going on in this file
// Better left alone as long as it works

const { ipcRenderer } = require('electron');
import log from 'electron-log/renderer';


const WORDS: japReader.IchiParsedWordData[] = [];
const PARSED_WORDS: japReader.IchiParsedWordData[] = [];
let FULL_TEXT: string = '';
let EMPTY_WORD_DATA: japReader.IchiParsedWordData = {
  word: '',
  dictForm: '',
  dictFormReading: '',
  rubyReading: '',
  definitions: '',
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


const getDictForm = (text: string): string => {
  return text
    .replace(/ 【.+/g, '')
    .replace(/[0-9]+\. /g, '')
    .replace(/\s/g, '');
}

const getReading = (text: string): string => {
  let readingText = text
    .replace(/.+【/g, '')
    .replace(/】/g, '')
    .replace(/[0-9]+\. /g, '')
    .replace(/\s/g, '');
  readingText = Array.from(readingText)
    .filter((char) => /[\p{Script=Hiragana}\p{Script=Katakana}]/u.test(char))
    .join('');
  return readingText;
}

const getWord = (text: string): string => {
  return text
    .replace(/ 【.+/, '')
    .replace(/[0-9]+\. /, '');
}

window.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line global-require
  const $ = require('jquery');

  ipcRenderer.on('announce/clipboard/changeDetected', (event, text) => {
    document.location.href = `https://ichi.moe/cl/qr/?q=${text}&r=kana`;
  });

  const connectionCheck = setTimeout(() => {
    if (document.querySelector('.wrapper')) {
      ipcRenderer.send('announce/ichi/isReady');
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

  const jsp_panes = document.querySelectorAll('.word-chunk .jspPane')
  Array.from(jsp_panes).forEach((jsp_pane: Element) => {
    const wordData = { ...EMPTY_WORD_DATA }

    jsp_pane.classList.add('current-word');

    const first_child_dt = document.querySelector('.current-word dt:first-child');
    wordData.word = getWord(first_child_dt.textContent);

    const dt = document.querySelector('.current-word dt');
    const compounds = document.querySelector('.current-word .compounds');
    const conj_gloss_dt = document.querySelector('.current-word .conj-gloss dl dt');
    const conjugations_dt = $('.current-word .compounds dd:first .conjugations dl dt');
    const first_dt = $('.current-word .compounds dt:first');
    const current_word = document.querySelector('.current-word')

    if (compounds) {
      if (conjugations_dt.length > 0) {
        wordData.dictForm = getDictForm(conjugations_dt[0].textContent);
        wordData.dictFormReading = getReading(conjugations_dt[0].textContent);
      }
      else {
        wordData.dictForm = getDictForm(first_dt[0].textContent);
        wordData.dictFormReading = getReading(first_dt[0].textContent);
      }

      wordData.rubyReading = getReading(dt.textContent);
    }
    else if (conj_gloss_dt) {
      wordData.dictForm = getDictForm(conj_gloss_dt.textContent);
      wordData.dictFormReading = getReading(conj_gloss_dt.textContent);
      wordData.rubyReading = getReading(dt.textContent);
    }
    else {
      wordData.dictForm = getDictForm(dt.textContent);
      wordData.dictFormReading = getReading(dt.textContent);
      wordData.rubyReading = getReading(dt.textContent);
    }

    if (current_word.innerHTML.includes('[')) {
      wordData.definitions = current_word.innerHTML;
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

  ipcRenderer.send('set/ichi/wordData', PARSED_WORDS, FULL_TEXT);
});

setTimeout(() => {
  if (document.body.children.length === 0) {
    ipcRenderer.send('announce/ichi/connectionError');
  }
}, 10000);
