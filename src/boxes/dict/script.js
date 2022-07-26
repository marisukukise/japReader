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

  var onTop = false;

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

  $(window).on('keyup', (e) => {
    switch (e.key) {
      case 'o':
        ipcRenderer.send('openOptions');
        break;
      case 's':
        onTop = tools.toggle_onTop(onTop, $('body'));
        ipcRenderer.send('dictOnTop');
        break;
      case 'a':
        var btn = document.querySelector('#audio');
        playAudio(currentWordData, btn);
        break;
      case 'q':
        var btn = document.querySelector('#anki');
        addNote(currentWordData, btn);
        break;
      case 'Escape':
        ipcRenderer.send('hideDict');
        break;
    }
    return true;
  });

  function invoke(action, version, params = {}) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.addEventListener('error', () => reject('AnkiConnect: Failed to issue request'));
      xhr.addEventListener('load', () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (Object.getOwnPropertyNames(response).length != 2) {
            throw 'AnkiConnect: Response has an unexpected number of fields';
          }
          if (!response.hasOwnProperty('error')) {
            throw 'AnkiConnect: Response is missing required error field';
          }
          if (!response.hasOwnProperty('result')) {
            throw 'AnkiConnect: Response is missing required result field';
          }
          if (response.error) {
            throw response.error;
          }
          resolve(response.result);
        } catch (e) {
          reject(e);
        }
      });

      xhr.open('POST', 'http://localhost:8765');
      xhr.send(JSON.stringify({ action, version, params }));
    });
  }

  async function __anki__addNote(wordData) {
    const res = await invoke('addNote', 6, {
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
    return res;
  }

  async function __anki__canAddNotes(wordData) {
    const res = await invoke('canAddNotes', 6, {
      notes: [{
        deckName: 'japReader',
        modelName: 'japReader',
        fields: {
          DictForm: wordData.dictForm,
        }
      }]
    });
    return res;
  }

  const addNote = (wordData, btn) => {
    if (!btn.classList.contains('disabled')) {
      if (!wordData.wordFuriganaHTML)
        wordData.wordFuriganaHTML = wordData.word;
      if (!wordData.dictFuriganaHTML)
        wordData.dictFuriganaHTML = wordData.dictForm;

      wordData.english = currentEnglishText;
      __anki__addNote(wordData)
        .then(() => {
          btn.textContent = "Added to Anki";
          btn.classList.add('disabled');
        })
        .catch(() => {
          btn.textContent = "Already in collection";
          btn.classList.add('disabled');
        });
    }
  }

  const playAudio = (wordData, btn) => {
    if (!btn.classList.contains('disabled')) {
      __playAudio(wordData);
    }
  }

  async function __getDuration(url) {
    return new Promise((resolve) => {
      const audio = document.createElement("audio");
      audio.muted = true;
      const source = document.createElement("source");
      source.src = url; //--> blob URL
      audio.preload = "metadata";
      audio.appendChild(source);
      audio.onloadedmetadata = function () {
        resolve(audio.duration)
      };
    });
  }

  const __canPlayAudio = async (wordData) => {
    let url = `https://assets.languagepod101.com`;
    url = `${url}/dictionary/japanese/audiomp3.php?kanji=`;
    url = `${url}${wordData.dictForm}`;
    url = `${url}&kana=${wordData.dictFormReading}`;

    const duration = await __getDuration(url);
    if (duration === 5.694694) return false;
    else return true;
  }

  const __playAudio = (wordData) => {
    let url = `https://assets.languagepod101.com`;
    url = `${url}/dictionary/japanese/audiomp3.php?kanji=`;
    url = `${url}${wordData.dictForm}`;
    url = `${url}&kana=${wordData.dictFormReading}`;

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

  const checkIfDisableButton = (button_query, condition, success_message, fail_message) => {
    if (condition) {
      button_query.classList.remove('disabled');
      button_query.innerHTML = success_message;
    }
    else {
      button_query.innerHTML = fail_message;
    }
  }

  const disableButtons = (wordData) => {
    var status_selector = '#' + wordData.status;
    var qry_status = document.querySelector(status_selector);
    qry_status.classList.add('disabled');


    var qry_anki = document.querySelector('#anki');
    var anki_innerhtml = qry_anki.innerHTML;
    qry_anki.innerHTML = "Checking...";
    qry_anki.classList.add('disabled');
    __anki__canAddNotes(wordData)
      .then(res => {
        console.log("res", res);
        var canClick = res[0];
        checkIfDisableButton(qry_anki, canClick, anki_innerhtml, "Already in collection");
      })
      .catch(err => {
        qry_anki.innerHTML = "Something went wrong";
      });

    var qry_audio = document.querySelector('#audio');
    var audio_innerhtml = qry_audio.innerHTML;
    qry_audio.innerHTML = "Checking...";
    qry_audio.classList.add('disabled');
    __canPlayAudio(wordData)
      .then(res => {
        var canClick = res;
        checkIfDisableButton(qry_audio, canClick, audio_innerhtml, "Audio not available");
      })
      .catch(err => {
        qry_audio.innerHTML = "Something went wrong";
      });
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
        <span id="seen" class="btn">Seen</span>
        <span id="known" class="btn">Known</span>
        <span id="ignored" class="btn">Ignore</span>
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

    disableButtons(currentWordData);

    status_buttons = document.querySelectorAll('#status-buttons .btn');

    status_buttons.forEach(element => {
      let status = element.id;
      element.addEventListener('click', (e) => {
        var btn = e.target;
        if (!btn.classList.contains('disabled')) {
          changeStatus(currentWordData, status);
        }
      })
    });

    document.querySelector('#audio').addEventListener('click', (e) => {
      var btn = e.target;
      playAudio(currentWordData, e.target);
    });

    document.querySelector('#anki').addEventListener('click', (e) => {
      var btn = e.target;
      addNote(currentWordData, btn);
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
