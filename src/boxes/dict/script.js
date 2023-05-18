require('module-alias/register')

const { ipcRenderer } = require('electron');
const fs = require('fs');
const date = require('date-and-time');
const tools = require('@tools');
const Store = require('electron-store')

const OPTIONS = new Store(tools.getOptionsStoreOptions());
const GOAL_DATA = new Store(tools.getGoalDataStoreOptions());
const STATUS_DATA = new Store(tools.getStatusDataStoreOptions());

let currentWordData = {};
let currentEnglishText = '';


window.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line global-require
  const $ = require('jquery');

  var onTop = false;

  ipcRenderer.send('readyDict');

  const { 
    dictFontSize, fontFamily, showGoal, darkMode, 
    ankiIntegration, ankiDeckName, ankiModelName, 
    ankiDictForm, ankiDefinitions, ankiJapanese, ankiEnglish
  } = OPTIONS.get('options')
  if (darkMode) {
    document.documentElement.classList.add('dark-mode');
  }
  document.querySelector('#app').style.fontSize = `${dictFontSize}pt`;
  document.querySelector('#app').style.fontFamily = `${fontFamily}`;

  $(window).on('keydown', (e) => {
    switch (e.key) {
      case 'o':
        ipcRenderer.send('openOptions');
        break;
      case 's':
        onTop = tools.toggle_onTop(onTop, $('body'));
        ipcRenderer.send('dictOnTop');
        break;
      case 'a':
        var btn = document.querySelector('#audio.btn');
        playAudio(currentWordData, btn);
        break;
      case 'q':
        var btn = document.querySelector('#anki.btn');
        if (btn.classList.contains('preview')){
          previewNote(currentWordData, btn)
        } else {
          addNote(currentWordData, btn);
        }
        break;
      case 'Escape':
        ipcRenderer.send('hideDict');
        break;
    }
    return true;
  });

  handleGoogle = (query) => {
    openUrl(`https://www.google.co.jp/search?q=${query}&tbm=isch`);
  }

  handleDuckduckgo = (query) => {
    openUrl(`https://duckduckgo.com/?q=${query}&kp=-1&kl=jp-jp&iax=images&ia=images`);
  }
  
  handleJisho = (query) => {
    openUrl(`https://jisho.org/search/${query}`);
  }

  handleWeblioEn = (query) => {
    openUrl(`https://ejje.weblio.jp/english-thesaurus/content/${query}`);
  }

  handleWeblioJp = (query) => {
    openUrl(`https://www.weblio.jp/content/${query}`);
  }

  handleWiktionaryEn = (query) => {
    openUrl(`https://en.wiktionary.org/wiki/${query}#Japanese`);
  }

  handleWiktionaryJp = (query) => {
    openUrl(`https://ja.wiktionary.org/wiki/${query}#日本語`);
  }

  handleWikipedia = (query) => {
    openUrl(`https://ja.wikipedia.org/wiki/${query}`);
  }

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

  const __anki__populateFieldsIfNonEmpty = (fieldsObj, key, value) => {
    if(key) {
      fieldsObj[key] = value;
    }
  }

  async function __anki__addNote(wordData) {
    const fields = {};
    __anki__populateFieldsIfNonEmpty(fields, `${ankiDictForm}`, wordData.dictForm);
    __anki__populateFieldsIfNonEmpty(fields, `${ankiDefinitions}`, wordData.definitions);
    __anki__populateFieldsIfNonEmpty(fields, `${ankiJapanese}`, wordData.fullText);
    __anki__populateFieldsIfNonEmpty(fields, `${ankiEnglish}`, wordData.english);
    console.log(fields);
    const res = await invoke('addNote', 6, {
      note: {
        deckName: `${ankiDeckName}`,
        modelName: `${ankiModelName}`,
        fields: fields,
        // {
          // ankiDictForm: wordData.dictForm,
          // DictFormReading: wordData.dictFormReading,
          // DictFormFurigana: wordData.dictFuriganaHTML,
          // Word: wordData.word,
          // WordReading: wordData.rubyReading,
          // WordFurigana: wordData.wordFuriganaHTML,
          // Definitions: wordData.definitions,
          // Japanese: wordData.fullText,
          // English: wordData.english,
        // },
        options: {
          allowDuplicate: false,
          duplicateScope: "deck",
          duplicateScopeOptions: {
            deckName: `${ankiDeckName}`,
            checkChildren: false,
            checkAllModels: false
          }
        },
        tags: ["japReader"],
      }
    });
    return res;
  }

  async function __anki__findNotes(query) {
    const res = await invoke('findNotes', 6, {
      query: query
    })
    return res;
  }

  async function __anki__guiEditNote(id) {
    invoke('guiEditNote', 6, {
      note: id
    })
  }

  async function __anki__canAddNotes(wordData) {
    const fields = {};
    fields[`${ankiDictForm}`] = wordData.dictForm;
    const res = await invoke('canAddNotes', 6, {
      notes: [{
        deckName: `${ankiDeckName}`,
        modelName: `${ankiModelName}`,
        fields: fields 
        // {
        // DictForm: wordData.dictForm,
        // }
      }]
    });
    return res;
  }

  const previewNote = (wordData, btn) => {
    if (!btn.classList.contains('disabled')) {
      let query = `deck:${ankiDeckName} ${ankiDictForm}:${wordData.dictForm}`;
      btn.classList.add('disabled');
      __anki__findNotes(query)
        .then(res => {
          btn.classList.remove('disabled');
          if(res.length == 1){
            __anki__guiEditNote(res[0])
          } else { 
            btn.classList.add('disabled');
            btn.textContent = "Could not preview the card";
            btn.classList.remove('preview');
          }
        })
        .catch(err => {
          btn.textContent = "Could not preview the card";
          btn.classList.remove('preview');
        })
    }
  }

  const openUrl = (url) => {
    ipcRenderer.send("openUrl", url);
  }

  const addNote = (wordData, btn) => {
    if (!btn.classList.contains('disabled')) {
      if (!wordData.wordFuriganaHTML)
        wordData.wordFuriganaHTML = wordData.word;
      if (!wordData.dictFuriganaHTML)
        wordData.dictFuriganaHTML = wordData.dictForm;

      wordData.english = currentEnglishText;
      btn.classList.add('disabled');
      __anki__addNote(wordData)
        .then(() => {
          btn.classList.remove('disabled');
          btn.textContent = "Preview the card";
          btn.classList.add('preview');
        })
        .catch(() => {
          btn.textContent = "Could not add the card";
          btn.title = "Check if: (1) the Anki fields are set correctly in the options menu; (2) AnkiConnect is running;"
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
        document.querySelector('#audio.btn').textContent =
          'No audio available';
        document.querySelector('#audio.btn').classList.add('disabled');
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


    var qry_anki = document.querySelector('#anki.btn');
    var anki_innerhtml = qry_anki.innerHTML;
    qry_anki.innerHTML = "Linking AnkiConnect...";
    qry_anki.classList.add('disabled');
  __anki__canAddNotes(wordData)
    .then(res => {
      var canClick = res[0];
      checkIfDisableButton(qry_anki, canClick, anki_innerhtml, "Preview the card");
      if (!canClick){
        qry_anki.classList.remove('disabled');
        qry_anki.classList.add('preview');
      }
    })
    .catch(err => {
      qry_anki.innerHTML = "AnkiConnect not found";
    });

  var qry_audio = document.querySelector('#audio.btn');
  var audio_innerhtml = qry_audio.innerHTML;
  qry_audio.innerHTML = "Searching audio...";
  qry_audio.classList.add('disabled');
  __canPlayAudio(wordData)
    .then(res => {
      var canClick = res;
      checkIfDisableButton(qry_audio, canClick, audio_innerhtml, "Audio not available");
    })
    .catch(err => {
      qry_audio.innerHTML = "Audio not found";
    });
};

const setUpStreak = () => {
  const goalData = GOAL_DATA.get('goal_data')

  const { dailyGoal } = OPTIONS.get('options')

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

  GOAL_DATA.set('goal_data', goalData);
};

const changeStatus = (wordData, newStatus) => {
  dictForm = wordData.dictForm
  prevStatus = wordData.status
  if (prevStatus === 'new' && newStatus === 'seen') {
    setUpStreak();

    const goalData = GOAL_DATA.get('goal_data')

    const { dailyGoal } = OPTIONS.get('options')

    goalData.goalCount += 1;

    if (goalData.goalCount === dailyGoal) {
      goalData.streakCount += 1;
    }

    document.querySelector('#goal-count').textContent = goalData.goalCount;

    GOAL_DATA.set('goal_data', goalData);
  }

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

  wordData.status = newStatus;
  STATUS_DATA.set('status_data', statusData);
  handleWordData(wordData);
  ipcRenderer.send('refreshReader');
};

const displayGoalData = () => {
  const { goalCount, streakCount } = GOAL_DATA.get('goal_data')

  const { dailyGoal } = OPTIONS.get('options')

  $('#info').append(
    `<div id="goal-area">Goal (doesn't work for now): <span id='goal-count'>${goalCount}</span>/${dailyGoal}</div>`
    );

    $('#info').append(
      `<div id="streak-area">Streak days (doesn't work for now): <span id='streak-count'>${streakCount}</span></div>`
    );

    if (!showGoal) {
      document.querySelector('#goal-area').style.display = 'none';
      document.querySelector('#streak-area').style.display = 'none';
    }
  };

  const handleWordData = (wordData) => {
    currentWordData = wordData;

    const { known, seen } = STATUS_DATA.get('status_data')

    $('#info').html(``)
    $('#info').append(`<div id="known-area">Known: ${known.length}</div>`);
    $('#info').append(`<div id="seen-area">Seen: ${seen.length}</div>`);

    setUpStreak();
    displayGoalData();

    $('#controls').html(``);
    $('#controls').append(`
      <div id='other-buttons'>
        <div id='search-engines'>
          <fieldset>
            <legend>
              <img class="symbol" src="./img/symbols/image.png"/>
            </legend>
            <span id="google" class="search">
              <img class="icon" title="Google Images" src="./img/favicons/google.ico"/>
            </span>
            <span id="duckduckgo" class="search">
              <img class="icon" title="DuckDuckGo Images" src="./img/favicons/duckduckgo.ico"/>
            </span>
          </fieldset>
          <fieldset>
            <legend>
              <img class="symbol" src="./img/symbols/britain.png"/>
            </legend>
            <span id="jisho" class="search">
              <img class="icon" title="Jisho.org (Japanese-English dictionary)" src="./img/favicons/jisho.ico"/>
            </span>
            <span id="weblio-en" class="search">
              <img class="icon" title="Weblio (Japanese-English thesaurus)" src="./img/favicons/weblio-en.png"/>
            </span>
            <span id="wiktionary-en" class="search">
              <img class="icon" title="Wiktionary (English)" src="./img/favicons/wiktionary-en.ico"/>
            </span>
          </fieldset>
          <fieldset>
            <legend>
              <img class="symbol" src="./img/symbols/japan.png"/>
            </legend>
            <span id="weblio-jp" class="search">
              <img class="icon" title="Weblio (Japanese dictionary)" src="./img/favicons/weblio-jp.png"/>
            </span>
            <span id="wiktionary-jp" class="search">
              <img class="icon" title="Wiktionary (Japanese)" src="./img/favicons/wiktionary-jp.ico"/>
            </span>
            <span id="wikipedia" class="search">
              <img class="icon" title="Wikipedia (Japanese)" src="./img/favicons/wikipedia.ico"/>
            </span>
          </fieldset>
        </div>
        <span id="audio" class="btn">Play Audio</span>
        <span id="anki" class="btn">Add to Anki</span>
      </div>
      <div id='status-buttons'>
        <span id="seen" class="btn">Seen</span>
        <span id="known" class="btn">Known</span>
        <span id="ignored" class="btn">Ignored</span>
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

    document.querySelector('#google.search').addEventListener('click', (e) => {
      handleGoogle(currentWordData.dictForm);
    });

    document.querySelector('#duckduckgo.search').addEventListener('click', (e) => {
      handleDuckduckgo(currentWordData.dictForm)
    });
    
    document.querySelector('#jisho.search').addEventListener('click', (e) => {
      handleJisho(currentWordData.dictForm);
    });

    document.querySelector('#weblio-en.search').addEventListener('click', (e) => {
      handleWeblioEn(currentWordData.dictForm);
    });

    document.querySelector('#weblio-jp.search').addEventListener('click', (e) => {
      handleWeblioJp(currentWordData.dictForm);
    });

    document.querySelector('#wiktionary-en.search').addEventListener('click', (e) => {
      handleWiktionaryEn(currentWordData.dictForm);
    });

    document.querySelector('#wiktionary-jp.search').addEventListener('click', (e) => {
      handleWiktionaryJp(currentWordData.dictForm);
    });

    document.querySelector('#wikipedia.search').addEventListener('click', (e) => {
      handleWikipedia(currentWordData.dictForm);
    });


    

    document.querySelector('#audio.btn').addEventListener('click', (e) => {
      var btn = document.querySelector('#audio.btn');
      playAudio(currentWordData, btn);
    });
    
    document.querySelector('#anki.btn').addEventListener('click', (e) => {
      var btn = document.querySelector('#anki.btn');
      if (btn.classList.contains('preview')){
        previewNote(currentWordData, btn)
      } else {
        addNote(currentWordData, btn);
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
