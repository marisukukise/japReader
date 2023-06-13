require('module-alias/register')

const { ipcRenderer } = require('electron');
const fs = require('fs');
const { fit } = require('furigana');
const date = require('date-and-time');

const tools = require('@tools');
const Store = require('electron-store')

const OPTIONS = new Store(tools.getOptionsStoreOptions());
const STATUS_DATA = new Store(tools.getStatusDataStoreOptions());

let currentWords = [];
let currentText = '';

window.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line global-require
  const $ = require('jquery');

  let ichiConnected = false;
  let onTop = false;

  ipcRenderer.send('readyReader');

  const { tvMode, readerFontSize, fontFamily, useDeepL, addFuriganaNew, addFuriganaSeen, addFuriganaKnown, addFuriganaIgnored, fadeText, darkMode, leftClickDisregardStatus } = OPTIONS.get('options')

  if (tvMode) document.body.classList.add('tv-mode');
  if (darkMode) {
    document.documentElement.classList.add('dark-mode');
  }
  document.querySelector('#app').style.fontSize = `${readerFontSize}pt`;
  document.querySelector('#app').style.fontFamily = `${fontFamily}`;


  $(window).on('keydown', (e) => {
    switch (e.key) {
      case 'o':
        ipcRenderer.send('openOptions');
        break;
      case 's':
        onTop = tools.toggle_onTop(onTop, $('body'));
        ipcRenderer.send('readerOnTop');
        break;
    }
    return true;
  });

  $('#app').html('Connecting to <span class="url">https://ichi.moe/</span>.');
  $('#app').append('<br>');
  $('#app').append('Please wait patiently...');

  ipcRenderer.on('ichiConnected', () => {
    if (!ichiConnected) {
      ichiConnected = true;
      $('#app').html(
        'Successfully connected to <span class="url">https://ichi.moe/</span>.',
      );
      $('#app').append('<br>');
      $('#app').append('Copy Japanese text to begin using japReader.');
    }
  });

  ipcRenderer.on('parseNotification', () => {
    $('#app').html('Detecting words...');
  });

  ipcRenderer.on('ichiConnectionError', () => {
    $('#app').html(
      'Unable to connect to <span class="url">https://ichi.moe/</span>.',
    );
    $('#app').append('<br>');
    $('#app').append(
      'Check your internet connection, and make sure the site is up.',
    );
    $('#app').append('<br><br>');
    $('#app').append(
      'Once you are able to connect to the site, restart this program.',
    );
    $('#app').append('<br>');
    $('#app').append('All of your progress will be saved.');
  });

  const changeStatus = (dictForm, prevStatus, newStatus) => {
    const statusData = STATUS_DATA.get('status_data')

    if (prevStatus === 'known') {
      statusData.known = statusData.known.filter((elem) => elem !== dictForm);
    } else if (prevStatus === 'seen') {
      statusData.seen = statusData.seen.filter((elem) => elem !== dictForm);
    } else if (prevStatus === 'ignored') {
      statusData.ignored = statusData.ignored.filter(
        (elem) => elem !== dictForm
      );
    }

    if (newStatus === 'known') {
      statusData.known.push(dictForm);
    } else if (newStatus === 'seen') {
      statusData.seen.push(dictForm);
    } else if (newStatus === 'ignored') {
      statusData.ignored.push(dictForm);
    }

    STATUS_DATA.set('status_data', statusData);

    ipcRenderer.send('refreshReader');
  };

  const changeStatusOnClick = (wordData, newStatus) => {
    changeStatus(wordData.dictForm, wordData.status, newStatus);
    wordData.status = newStatus;
    ipcRenderer.send('sendWordData', wordData);
    ipcRenderer.send('openDict');
  }

  const getFuriganaWordData = (currentWordData) => {
    try {
      const furiganaWordData = fit(
        currentWordData.word,
        currentWordData.rubyReading,
        {
          type: 'object',
        },
      );
      return furiganaWordData;
    }
    catch {
      // return anyway if the word is a digit
      if (/^[０１２３４５６７８９]+$/.test(currentWordData.dictForm)){
        return [{
          w: currentWordData.word,
          r: currentWordData.rubyReading,
        }]
      }
    }
  }

  const getFuriganaDictData = (currentWordData) => {
    try {
      const furiganaDictData = fit(
        currentWordData.dictForm,
        currentWordData.dictFormReading,
        {
          type: 'object',
        },
      );
      return furiganaDictData;
    }
    catch (err) {
      // return anyway if the word is a digit
      if (/^[０１２３４５６７８９]+$/.test(currentWordData.dictForm)){
        return [{
          w: currentWordData.dictForm,
          r: currentWordData.dictFormReading
        }]
      }
    }
  }

  const handleWords = (words) => {
    $('#app').empty();

    const { known, seen, ignored } = STATUS_DATA.get('status_data')

    words.forEach((wordData) => {
      const currentWordData = wordData;

      if (currentWordData.definitions) {
        currentWordData.status = 'new';

        let wordElement = $(
          `<span class="word">${currentWordData.word}</span>`,
        );

        const furiganaWordData = getFuriganaWordData(currentWordData);
        const furiganaDictData = getFuriganaDictData(currentWordData);

        if (furiganaWordData) {
          let wordWithFurigana = '';
          furiganaWordData.forEach((element) => {
            // Check if element contains kanji
            if (element.w.match(/\p{Script=Han}/u))
              wordWithFurigana += `<ruby><rb>${element.w}</rb><rt>${element.r}</rt></ruby>`;
            else wordWithFurigana += element.w;
          });
          currentWordData.wordFuriganaHTML = wordWithFurigana;

          wordElement = $(`<span class="word">${wordWithFurigana}</span>`);
        }

        if (furiganaDictData) {
          let wordWithFurigana = '';
          furiganaDictData.forEach((element) => {
            // Check if element contains kanji
            if (element.w.match(/\p{Script=Han}/u))
              wordWithFurigana += `<ruby><rb>${element.w}</rb><rt>${element.r}</rt></ruby>`;
            else wordWithFurigana += element.w;
          });
          currentWordData.dictFuriganaHTML = wordWithFurigana;
        }

        if (known.includes(currentWordData.dictForm)) {
          $(wordElement).addClass('known');
          currentWordData.status = 'known';
          if (addFuriganaKnown) {
            $(wordElement).addClass('furigana');
          }
        } else if (seen.includes(currentWordData.dictForm)) {
          $(wordElement).addClass('seen');
          currentWordData.status = 'seen';
          if (addFuriganaSeen) {
            $(wordElement).addClass('furigana');
          }
        } else if (ignored.includes(currentWordData.dictForm)) {
          $(wordElement).addClass('ignored');
          currentWordData.status = 'ignored';
          if (addFuriganaIgnored) {
            $(wordElement).addClass('furigana');
          }
        } else {
          $(wordElement).addClass('new');
          currentWordData.status = 'new';
          if (addFuriganaNew) {
            $(wordElement).addClass('furigana');
          }
        }

        currentWordData.fullText = currentText;

        $('#app').append(wordElement);

        $(wordElement).on('mousedown', (e) => {
          switch (e.which) {
            case 1: // LeftClick
              if (e.ctrlKey) { // + Ctrl 
                changeStatusOnClick(currentWordData, 'ignored');
              }
              else {
                if (leftClickDisregardStatus) {
                  changeStatusOnClick(currentWordData, 'seen');
                } else {
                  if (currentWordData.status == 'new') {
                    changeStatusOnClick(currentWordData, 'seen');
                  } else {
                    ipcRenderer.send('sendWordData', wordData);
                    ipcRenderer.send('openDict');
                  }
                }
              }
              break;
            case 3: // RightClick
              changeStatusOnClick(currentWordData, 'known');
              break;
          }
          return true;
        });
      } else {
        const junkElement = `<span class="junk">${currentWordData.word}</span>`;
        $('#app').append(junkElement);
      }
    });

    const seenWordCount = document.querySelectorAll('.seen').length;
    const newWordCount = document.querySelectorAll('.new').length;

    const seenWords = document.querySelectorAll('.seen');
    const newWords = document.querySelectorAll('.new');

    let isPlusOne = true;
    if (newWords.length == 0 && seenWords.length > 0) {
      const firstWord = seenWords[0].innerText;
      seenWords.forEach((word) => {
        if (word.innerText != firstWord)
          isPlusOne = false;
      })
    } else
      if (seenWords.length == 0 && newWords.length > 0) {
        const firstWord = newWords[0].innerText;
        newWords.forEach((word) => {
          if (word.innerText != firstWord)
            isPlusOne = false;
        })
      } else isPlusOne = false;

    if (isPlusOne)
      document.querySelector('body').classList.add('plusOne');
    else document.querySelector('body').classList.remove('plusOne');

    if (fadeText) {
      const shouldFade = seenWordCount + newWordCount <= 1;
      ipcRenderer.send('fadeText', shouldFade);
    }
  };

  ipcRenderer.on('tooManyCharacters', () => {
    $('#app').html('Too many characters copied to clipboard...');
    $('#app').append('<br>');
    $('#app').append(
      'No request has been made to <span class="url">https://ichi.moe/</span>.',
    );
    $('#app').append('<br>');
    $('#app').append(
      'This has been implemented to prevent you from being banned.',
    );
  });

  ipcRenderer.on('receiveParsedData', (event, words, fullText) => {
    currentWords = words;
    currentText = fullText;
    if(!useDeepL) ipcRenderer.send('appendToHistory', currentText, null) 
    handleWords(currentWords);
  });

  ipcRenderer.on('refreshReader', () => {
    handleWords(currentWords);
  });
});
