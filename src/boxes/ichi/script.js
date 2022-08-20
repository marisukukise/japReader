const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line global-require
  const $ = require('jquery');

  ipcRenderer.on('parseWithIchi', (event, text) => {
    document.location.href = `https://ichi.moe/cl/qr/?q=${text}&r=kana`;
  });

  const connectionCheck = setTimeout(() => {
    if (document.querySelector('.wrapper')) {
      ipcRenderer.send('ichiConnected');
      clearInterval(connectionCheck);
    }
  }, 500);

  if (
    document.location.href !== 'https://ichi.moe/cl/qr/?q=&r=kana' &&
    document.location.href.includes('https://ichi.moe/')
  ) {
    Array.from(document.querySelectorAll('.gloss-row')).forEach((row) => {
      if (!row.classList.contains('hidden')) row.classList.add('word-chunk');
    });

    const getDictForm = (text) =>
      text
        .replace(/ 【.+/g, '')
        .replace(/[0-9]+\. /g, '')
        .replace(/\s/g, '');

    const getReading = (text) => {
      let readingText = text
        .replace(/.+【/g, '')
        .replace(/】/g, '')
        .replace(/[0-9]+\. /g, '')
        .replace(/\s/g, '');
      readingText = Array.from(readingText)
        .filter((char) => /[ぁ-んァ-ン]/.test(char))
        .join('');
      return readingText;
    };

    const getWord = (text) =>
      text.replace(/ 【.+/, '').replace(/[0-9]+\. /, '');

    const words = [];

    Array.from(document.querySelectorAll('.word-chunk .jspPane')).forEach(
      (word) => {
        const wordData = {
          word: '',
          dictForm: '',
          dictFormReading: '',
          rubyReading: '',
          definitions: '',
        };

        word.classList.add('current-word');

        wordData.word = getWord(
          document.querySelector('.current-word dt:first-child').textContent
        );

        if (document.querySelector('.current-word .compounds')) {
          if (
            $('.current-word .compounds dd:first .conjugations dl dt').length >
            0
          ) {
            wordData.dictForm = getDictForm(
              $('.current-word .compounds dd:first .conjugations dl dt')[0]
                .textContent
            );
            wordData.dictFormReading = getReading(
              $('.current-word .compounds dd:first .conjugations dl dt')[0]
                .textContent
            );
          } else {
            wordData.dictForm = getDictForm(
              $('.current-word .compounds dt:first')[0].textContent
            );
            word.classList.add('testing');
            wordData.dictFormReading = getReading(
              $('.current-word .compounds dt:first')[0].textContent
            );
          }
          wordData.rubyReading = getReading(
            document.querySelector('.current-word dt').textContent
          );
        } else if (document.querySelector('.current-word .conj-gloss dl dt')) {
          wordData.dictForm = getDictForm(
            document.querySelector('.current-word .conj-gloss dl dt')
              .textContent
          );
          wordData.dictFormReading = getReading(
            document.querySelector('.current-word .conj-gloss dl dt')
              .textContent
          );
          wordData.rubyReading = getReading(
            document.querySelector('.current-word dt').textContent
          );
        } else {
          wordData.dictForm = getDictForm(
            document.querySelector('.current-word dt').textContent
          );
          wordData.dictFormReading = getReading(
            document.querySelector('.current-word dt').textContent
          );
          wordData.rubyReading = getReading(
            document.querySelector('.current-word dt').textContent
          );
        }

        if (document.querySelector('.current-word').innerHTML.includes('['))
          wordData.definitions = document.querySelector(
            '.current-word'
          ).innerHTML;

        words.push(wordData);

        word.classList.remove('current-word');
      }
    );

    let fullText = '';

    Array.from(document.querySelectorAll('.query-text')).forEach((element) => {
      fullText += element.textContent;
    });

    if (words.length === 0)
      words.push({
        word: fullText,
        dictForm: '',
        dictFormReading: '',
        rubyReading: '',
        definitions: '',
      });

    const returnedWords = [];

    const addMissingCharacters = (wordData, index) => {
      const searchIndex = fullText.indexOf(wordData.word);

      if (searchIndex > 0) {
        const missingText = fullText.substring(0, searchIndex);
        Array.from(missingText).forEach((char) => {
          returnedWords.push({
            word: char,
            dictForm: '',
            dictFormReading: '',
            rubyReading: '',
            definitions: '',
          });
        });

        fullText = fullText.replace(missingText, '');
        addMissingCharacters(wordData);
      } else {
        returnedWords.push(wordData);
        fullText = fullText.replace(wordData.word, '');
      }

      if (index === words.length - 1 && fullText.length > 0) {
        Array.from(fullText).forEach((char) => {
          returnedWords.push({
            word: char,
            dictForm: '',
            dictFormReading: '',
            rubyReading: '',
            definitions: '',
          });
        });
      }
    };

    words.forEach((wordData, index) => {
      addMissingCharacters(wordData, index);
    });

    fullText = '';

    Array.from(document.querySelectorAll('.query-text')).forEach((element) => {
      fullText += element.textContent;
    });

    ipcRenderer.send('sendParsedData', returnedWords, fullText);
  }
});

setTimeout(() => {
  if (document.body.children.length === 0) {
    ipcRenderer.send('ichiConnectionError');
  }
}, 10000);
