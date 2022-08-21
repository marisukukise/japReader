require('module-alias/register')

const { ipcRenderer } = require('electron');
const fs = require('fs');
const date = require('date-and-time');
const tools = require('@tools');

let currentWordData = {};
let currentEnglishText = '';


window.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line global-require
  const $ = require('jquery');

  let onTop = false;

  ipcRenderer.send('positionDict');

  const { dictFontSize, showGoal, darkMode } = JSON.parse(
    fs.readFileSync(tools.dirname_path('./data/options.json'), {
      encoding: 'utf8',
      flag: 'r',
    })
  );
  if (darkMode) {
    document.documentElement.classList.add('dark-mode');
  }
  document.querySelector('#app').style.fontSize = `${dictFontSize}px`;

  let stayTimer;
  window.addEventListener(
    'keyup',
    (event) => {
      if (event.key === 'o') ipcRenderer.send('openOptions');
      else if (event.key === 's') {
        onTop = !onTop;
        if (onTop) {
          $('#on-top-msg').remove();
          clearTimeout(stayTimer);
          document.documentElement.scrollTop = 0;
          $('body').prepend(
            '<div id="on-top-msg"><section>On Top: True</section></div>'
          );
          stayTimer = setTimeout(() => {
            $('#on-top-msg').remove();
          }, 1000);
        } else {
          $('#on-top-msg').remove();
          clearTimeout(stayTimer);
          document.documentElement.scrollTop = 0;
          $('body').prepend(
            '<div id="on-top-msg"><section>On Top: False</section></div>'
          );
          stayTimer = setTimeout(() => {
            $('#on-top-msg').remove();
          }, 1000);
        }
        ipcRenderer.send('dictOnTop');
      }
      else if (event.key === 'a') {
        btn = document.querySelector('#audio');
        if (!btn.classList.contains('disabled')) {
          let url = `https://assets.languagepod101.com`;
          url = `${url}/dictionary/japanese/audiomp3.php?kanji=`;
          url = `${url}${currentWordData.dictForm}`;
          url = `${url}&kana=${currentWordData.dictFormReading}`;

          const audio = new Audio(url);

          audio.onloadedmetadata = () => {
            if (audio.duration !== 5.694694) audio.play();
            else {
              document.querySelector('#audio').textContent =
                'No audio available';
              document.querySelector('#audio').classList.add('disabled');
            }
          };
        }
      }
      else if (event.key === 'q') {
        btn = document.querySelector('#anki');
        if (!btn.classList.contains('disabled')) {
          if (!currentWordData.wordFuriganaHTML)
            currentWordData.wordFuriganaHTML = currentWordData.word;
          if (!currentWordData.dictFuriganaHTML)
            currentWordData.dictFuriganaHTML = currentWordData.dictForm;

          currentWordData.english = currentEnglishText;

          AnkiConnect_addNote(currentWordData);
        }
      }
    },
    true
  );

  window.addEventListener(
    'keyup',
    (event) => {
      if (event.key === 'Escape') ipcRenderer.send('hideDict');
    },
    true
  );

  function invoke(action, version, params = {}) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.addEventListener('load', () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.error) {
            throw response.error;
          }
          resolve(response.result);
        } catch (e) {
          reject(e);
        }
      });

      xhr.open('POST', 'http://localhost:8765');
      xhr.send(
        JSON.stringify({
          action,
          version,
          params,
        })
      );
    });
  }

  async function AnkiConnect_addNote(wordData) {
    await invoke('addNote', 6, {
      note: {
        deckName: 'japReader',
        modelName: 'japReader',
        fields: {
          DictForm: wordData.dictForm,
          DictFormReading: wordData.dictFormReading,
          DictFormFurigana: wordData.dictFuriganaHTML,
          Word: wordData.word,
          WordReading: wordData.rubyReading,
          WordFurigana: wordData.wordFuriganaHTML,
          Definitions: wordData.definitions,
          Japanese: wordData.fullText,
          English: wordData.english,
        },
        options: {
          allowDuplicate: false,
          duplicateScope: "deck",
          duplicateScopeOptions: {
            deckName: "japReader",
            checkChildren: false,
            checkAllModels: false
          }
        },
        tags: ["japReader"],
      }
    })
      .then(() => {
        document.querySelector('#anki').textContent = "Added to Anki!";
        document.querySelector('#anki').classList.add('disabled');
      })
      .catch(() => {
        document.querySelector('#anki').textContent = "Already in collection!";
        document.querySelector('#anki').classList.add('disabled');
      });
  }

  async function AnkiConnect_canAddNotes(wordData) {
    await invoke('canAddNotes', 6, {
      note: {
        deckName: 'japReader',
        modelName: 'japReader',
        fields: {
          DictForm: wordData.dictForm,
          DictFormReading: wordData.dictFormReading,
          DictFormFurigana: wordData.dictFuriganaHTML,
          Word: wordData.word,
          WordReading: wordData.rubyReading,
          WordFurigana: wordData.wordFuriganaHTML,
          Definitions: wordData.definitions,
          Japanese: wordData.fullText,
          English: wordData.english,
        },
        options: {
          allowDuplicate: false,
          duplicateScope: "deck",
          duplicateScopeOptions: {
            deckName: "japReader",
            checkChildren: false,
            checkAllModels: false
          }
        },
        tags: ["japReader"],
      }
    });
  }

  const disableButtons = (status) => {
    if (status !== 'new') {
      if (status === 'known')
        document.querySelector('#known').classList.add('disabled');
      else if (status === 'seen')
        document.querySelector('#seen').classList.add('disabled');
      else if (status === 'ignored')
        document.querySelector('#ignored').classList.add('disabled');
    }
  };

  const setUpStreak = () => {
    const goalData = JSON.parse(
      fs.readFileSync(tools.dirname_path('./data/goal_data.json'), {
        encoding: 'utf8',
        flag: 'r',
      })
    );

    const { dailyGoal } = JSON.parse(
      fs.readFileSync(tools.dirname_path('./data/options.json'), {
        encoding: 'utf8',
        flag: 'r',
      })
    );

    const now = new Date();
    const dateToday = date.format(now, 'YYYY-MM-DD');
    const dateYesterday = date.format(date.addDays(now, -1), 'YYYY-MM-DD');

    if (goalData.date !== dateToday) {
      if (goalData.date !== dateYesterday) {
        goalData.streakCount = 0;
      } else if (goalData.date === dateYesterday) {
        if (goalData.goalCount < dailyGoal) goalData.streakCount = 0;
      }
      goalData.date = dateToday;
      goalData.goalCount = 0;
    }

    fs.writeFileSync(tools.dirname_path('./data/goal_data.json'), JSON.stringify(goalData));
  };

  const changeStatus = (wordData, newStatus) => {
    dictForm = wordData.dictForm
    prevStatus = wordData.status
    if (prevStatus === 'new' && newStatus === 'seen') {
      setUpStreak();

      const goalData = JSON.parse(
        fs.readFileSync(tools.dirname_path('./data/goal_data.json'), {
          encoding: 'utf8',
          flag: 'r',
        })
      );

      const { dailyGoal } = JSON.parse(
        fs.readFileSync(tools.dirname_path('./data/options.json'), {
          encoding: 'utf8',
          flag: 'r',
        })
      );

      goalData.goalCount += 1;

      if (goalData.goalCount === dailyGoal) {
        goalData.streakCount += 1;
      }

      document.querySelector('#goal-count').textContent = goalData.goalCount;

      fs.writeFileSync(tools.dirname_path('./data/goal_data.json'), JSON.stringify(goalData));
    }

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

    wordData.status = newStatus;
    fs.writeFileSync(tools.dirname_path('./data/status_data.json'), JSON.stringify(statusData));
    handleWordData(wordData);
    ipcRenderer.send('refreshReader');
  };

  const displayGoalData = () => {
    const { goalCount, streakCount } = JSON.parse(
      fs.readFileSync(tools.dirname_path('./data/goal_data.json'), {
        encoding: 'utf8',
        flag: 'r',
      })
    );

    const { dailyGoal } = JSON.parse(
      fs.readFileSync(tools.dirname_path('./data/options.json'), {
        encoding: 'utf8',
        flag: 'r',
      })
    );

    $('#info').append(
      `<div id="goal-area">Goal: <span id='goal-count'>${goalCount}</span>/${dailyGoal}</div>`
    );

    $('#info').append(
      `<div id="streak-area">Streak days: <span id='streak-count'>${streakCount}</span></div>`
    );

    if (!showGoal) {
      document.querySelector('#goal-area').style.display = 'none';
      document.querySelector('#streak-area').style.display = 'none';
    }
  };

  const handleWordData = (wordData) => {
    console.log("handleworddata ran")
    currentWordData = wordData;

    const { known, seen } = JSON.parse(
      fs.readFileSync(tools.dirname_path('./data/status_data.json'), {
        encoding: 'utf8',
        flag: 'r',
      })
    );

    $('#info').html(``)
    $('#info').append(`<div id="known-area">Known: ${known.length}</div>`);
    $('#info').append(`<div id="seen-area">Seen: ${seen.length}</div>`);

    setUpStreak();
    displayGoalData();

    $('#controls').html(``);
    $('#controls').append(`
      <div id='status-buttons'>
        <span id="seen" class="btn"><small>RMB</small>Seen</span>
        <span id="known" class="btn"><small>MMB</small>Known</span>
        <span id="ignored" class="btn"><small>Ctrl+LMB</small>Ignore</span>
      </div>
      <div id='other-buttons'>
        <span id="audio" class="btn"><small>A</small>Play Audio</span>
        <span id="anki" class="btn"><small>Q</small>Add to Anki</span>
      </div>
      <div id='word-info'>
        <div id="word-area" class="${currentWordData.status}">
          <div class="status">${currentWordData.status}</div>
          ${currentWordData.dictForm}
        </div>
      </div>
    `);

    disableButtons(currentWordData.status);

    status_buttons = document.querySelectorAll('#status-buttons .btn');

    status_buttons.forEach(element => {
      let status = element.id;
      element.addEventListener('click', (e) => {
        let btn = e.target;
        if (!btn.classList.contains('disabled')) {
          changeStatus(currentWordData, status);
        }
      })
    });

    document.querySelector('#audio').addEventListener('click', (e) => {
      btn = e.target;
      if (!btn.classList.contains('disabled')) {
        let url = `https://assets.languagepod101.com`;
        url = `${url}/dictionary/japanese/audiomp3.php?kanji=`;
        url = `${url}${currentWordData.dictForm}`;
        url = `${url}&kana=${currentWordData.dictFormReading}`;

        const audio = new Audio(url);

        audio.onloadedmetadata = () => {
          if (audio.duration !== 5.694694) audio.play();
          else {
            document.querySelector('#audio').textContent =
              'No audio available';
            document.querySelector('#audio').classList.add('disabled');
          }
        };
      }
    });

    document.querySelector('#anki').addEventListener('click', (e) => {
      btn = e.target;
      if (!btn.classList.contains('disabled')) {
        if (!currentWordData.wordFuriganaHTML)
          currentWordData.wordFuriganaHTML = currentWordData.word;
        if (!currentWordData.dictFuriganaHTML)
          currentWordData.dictFuriganaHTML = currentWordData.dictForm;

        currentWordData.english = currentEnglishText;

        AnkiConnect_addNote(currentWordData);
      }
    });

    $('#dict').html(currentWordData.definitions);
  };

  ipcRenderer.on('receiveWordData', (event, wordData) => {
    handleWordData(wordData);
    ipcRenderer.send('requestTranslation');
  });

  ipcRenderer.on('receiveTranslation', (event, englishText) => {
    currentEnglishText = englishText;
  });
});
