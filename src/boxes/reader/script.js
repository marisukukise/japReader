require('module-alias/register')

const { ipcRenderer } = require('electron');
const fs = require('fs');
const { fit } = require('furigana');
const date = require('date-and-time');

const tools = require('@tools');

let currentWords = [];
let currentText = '';



window.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line global-require
  const $ = require('jquery');

  let ichiConnected = false;
  let onTop = false;

  ipcRenderer.send('positionReader');

  const { tvMode, readerFontSize, addFurigana, fadeText, darkMode } = JSON.parse(
    fs.readFileSync(tools.dirname_path('./data/options.json'), {
      encoding: 'utf8',
      flag: 'r',
    }),
  );

  if (tvMode) document.body.classList.add('tv-mode');
  if (darkMode) {
    document.documentElement.classList.add('dark-mode');
  }
  document.querySelector('#app').style.fontSize = `${readerFontSize}px`;


  $(window).on('keyup', (e) => {
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
    ipcRenderer.send('hideDict');
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
    const statusData = JSON.parse(
      fs.readFileSync(tools.dirname_path('./data/status_data.json'), {
        encoding: 'utf8',
        flag: 'r',
      })
    );

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

    fs.writeFileSync(tools.dirname_path('./data/status_data.json'), JSON.stringify(statusData));

    ipcRenderer.send('refreshReader');
  };

  const changeStatusOnClick = (wordData, newStatus) => {
    changeStatus(wordData.dictForm, wordData.status, newStatus);
    wordData.status = newStatus;
    ipcRenderer.send('sendWordData', wordData);
    ipcRenderer.send('openDict');
  }

  const handleWords = (words) => {
    $('#app').empty();

    const { known, seen, ignored } = JSON.parse(
      fs.readFileSync(tools.dirname_path('./data/status_data.json'), {
        encoding: 'utf8',
        flag: 'r',
      }),
    );

    words.forEach((wordData) => {
      const currentWordData = wordData;

      if (currentWordData.definitions) {
        currentWordData.status = 'new';

        let wordElement = $(
          `<span class="word">${currentWordData.word}</span>`,
        );

        const furiganaWordData = fit(
          currentWordData.word,
          currentWordData.rubyReading,
          {
            type: 'object',
          },
        );

        const furiganaDictData = fit(
          currentWordData.dictForm,
          currentWordData.dictFormReading,
          {
            type: 'object',
          },
        );

        if (furiganaWordData) {
          let wordWithFurigana = '';
          furiganaWordData.forEach((element) => {
            if (element.w.match(/[一-龯]/))
              wordWithFurigana += `<ruby><rb>${element.w}</rb><rt>${element.r}</rt></ruby>`;
            else wordWithFurigana += element.r;
          });
          currentWordData.wordFuriganaHTML = wordWithFurigana;

          if (addFurigana)
            wordElement = $(`<span class="word">${wordWithFurigana}</span>`);
        }

        if (furiganaDictData) {
          let wordWithFurigana = '';
          furiganaDictData.forEach((element) => {
            if (element.w.match(/[一-龯]/))
              wordWithFurigana += `<ruby><rb>${element.w}</rb><rt>${element.r}</rt></ruby>`;
            else wordWithFurigana += element.r;
          });
          currentWordData.dictFuriganaHTML = wordWithFurigana;
        }

        if (known.includes(currentWordData.dictForm)) {
          $(wordElement).addClass('known');
          currentWordData.status = 'known';
        } else if (seen.includes(currentWordData.dictForm)) {
          $(wordElement).addClass('seen');
          currentWordData.status = 'seen';
        } else if (ignored.includes(currentWordData.dictForm)) {
          $(wordElement).addClass('ignored');
          currentWordData.status = 'ignored';
        } else {
          $(wordElement).addClass('new');
          currentWordData.status = 'new';
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
                changeStatusOnClick(currentWordData, 'seen');
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

  (() => {
    const files = fs.readdirSync(tools.dirname_path('./data/transfer/')).length;

    if (files > 0) {
      if (fs.existsSync(tools.dirname_path('./data/transfer/data_known'))) {
        const statusData = JSON.parse(
          fs.readFileSync(tools.dirname_path('./data/status_data.json'), {
            encoding: 'utf8',
            flag: 'r',
          }),
        );

        const knownList = fs
          .readFileSync(tools.dirname_path('./data/transfer/data_known'), {
            encoding: 'utf8',
            flag: 'r',
          })
          .split('\n')
          .filter((elem) => elem);

        knownList.forEach((word) => {
          if (!statusData.known.includes(word)) statusData.known.push(word);
        });

        fs.writeFileSync(tools.dirname_path('./data/status_data.json'), JSON.stringify(statusData));

        fs.unlinkSync(tools.dirname_path('./data/transfer/data_known'));
      }

      if (fs.existsSync(tools.dirname_path('./data/transfer/data_seen'))) {
        const statusData = JSON.parse(
          fs.readFileSync(tools.dirname_path('./data/status_data.json'), {
            encoding: 'utf8',
            flag: 'r',
          }),
        );

        const seenList = fs
          .readFileSync(tools.dirname_path('./data/transfer/data_seen'), {
            encoding: 'utf8',
            flag: 'r',
          })
          .split('\n')
          .filter((elem) => elem);

        seenList.forEach((word) => {
          if (!statusData.seen.includes(word)) statusData.seen.push(word);
        });

        fs.writeFileSync(tools.dirname_path('./data/status_data.json'), JSON.stringify(statusData));

        fs.unlinkSync(tools.dirname_path('./data/transfer/data_seen'));
      }

      if (fs.existsSync(tools.dirname_path('./data/transfer/data_ignored'))) {
        const statusData = JSON.parse(
          fs.readFileSync(tools.dirname_path('./data/status_data.json'), {
            encoding: 'utf8',
            flag: 'r',
          }),
        );

        const ignoredList = fs
          .readFileSync(tools.dirname_path('./data/transfer/data_ignored'), {
            encoding: 'utf8',
            flag: 'r',
          })
          .split('\n')
          .filter((elem) => elem);

        ignoredList.forEach((word) => {
          if (!statusData.ignored.includes(word)) statusData.ignored.push(word);
        });

        fs.writeFileSync(tools.dirname_path('./data/status_data.json'), JSON.stringify(statusData));

        fs.unlinkSync(tools.dirname_path('./data/transfer/data_ignored'));
      }

      if (fs.existsSync(tools.dirname_path('./data/transfer/data_goal'))) {
        const goalData = JSON.parse(
          fs.readFileSync(tools.dirname_path('./data/goal_data.json'), {
            encoding: 'utf8',
            flag: 'r',
          }),
        );

        const goalCount = fs
          .readFileSync(tools.dirname_path('./data/transfer/data_goal'), {
            encoding: 'utf8',
            flag: 'r',
          })
          .split('\n')
          .filter((elem) => elem).length;
        goalData.goalCount = goalCount;

        fs.writeFileSync(tools.dirname_path('./data/goal_data.json'), JSON.stringify(goalData));

        fs.unlinkSync(tools.dirname_path('./data/transfer/data_goal'));
      }

      if (fs.existsSync(tools.dirname_path('./data/transfer/data_info'))) {
        const goalData = JSON.parse(
          fs.readFileSync(tools.dirname_path('./data/goal_data.json'), {
            encoding: 'utf8',
            flag: 'r',
          }),
        );

        const [, streakCount] = fs
          .readFileSync(tools.dirname_path('./data/transfer/data_info'), {
            encoding: 'utf8',
            flag: 'r',
          })
          .split('\n')
          .filter((elem) => elem);

        goalData.streakCount = Number(streakCount);

        const now = new Date();
        const dateToday = date.format(now, 'YYYY-MM-DD');

        goalData.date = dateToday;

        fs.writeFileSync(tools.dirname_path('./data/goal_data.json'), JSON.stringify(goalData));

        fs.unlinkSync(tools.dirname_path('./data/transfer/data_info'));
      }
    }
  })();

  ipcRenderer.on('receiveParsedData', (event, words, fullText) => {
    currentWords = words;
    currentText = fullText;
    handleWords(currentWords);
  });

  ipcRenderer.on('refreshReader', () => {
    handleWords(currentWords);
  });
});
