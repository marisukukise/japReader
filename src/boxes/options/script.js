require('module-alias/register')

const { ipcRenderer } = require('electron');
const tools = require('@tools');

const Store = require('electron-store')

const USER_SETTINGS = new Store(tools.getUserStoreOptions());



let optionsData = {};



window.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line global-require
  const $ = require('jquery');
  $(window).on('keyup', (e) => {
    switch (e.key) {
      case 'Escape':
        ipcRenderer.send('hideOptions');
        break;
    }
    return true;
  });

  optionsData = USER_SETTINGS.get('options')

  if (optionsData.darkMode) {
    document.documentElement.classList.add('dark-mode');
  }
  let {
    dailyGoal,
    readerFontSize,
    translationFontSize,
    dictFontSize,
  } = optionsData;

  Object.entries(optionsData).forEach(([key, value]) => {
    if (
      key !== 'dailyGoal' &&
      key !== 'readerFontSize' &&
      key !== 'translationFontSize' &&
      key !== 'dictFontSize'
    ) {
      if (value) {
        document
          .querySelector(`#${key}-selection .yes`)
          .classList.add('selected');
      } else
        document
          .querySelector(`#${key}-selection .no`)
          .classList.add('selected');
    } else if (key === 'dailyGoal')
      document.querySelector('#goal-count').textContent = dailyGoal;
    else if (key === 'readerFontSize')
      document.querySelector('#reader-font-size').textContent = readerFontSize;
    else if (key === 'translationFontSize')
      document.querySelector(
        '#translation-font-size'
      ).textContent = translationFontSize;
    else if (key === 'dictFontSize')
      document.querySelector('#dict-font-size').textContent = dictFontSize;
  });

  Array.from(document.querySelectorAll('.yes')).forEach((element) => {
    element.addEventListener('click', (event) => {
      event.target.classList.add('selected');
      event.target.nextElementSibling.classList.remove('selected');
    });
  });

  Array.from(document.querySelectorAll('.no')).forEach((element) => {
    element.addEventListener('click', (event) => {
      event.target.classList.add('selected');
      event.target.previousElementSibling.classList.remove('selected');
    });
  });

  document
    .querySelector('#dailyGoal-selection .increase')
    .addEventListener('click', () => {
      if (dailyGoal < 1000) {
        document.querySelector('#goal-count').textContent = dailyGoal + 1;
        dailyGoal += 1;
      }
    });

  document
    .querySelector('#dailyGoal-selection .decrease')
    .addEventListener('click', () => {
      if (dailyGoal > 0) {
        document.querySelector('#goal-count').textContent = dailyGoal - 1;
        dailyGoal -= 1;
      }
    });

  document
    .querySelector('#readerFontSize-selection .increase')
    .addEventListener('click', () => {
      if (readerFontSize < 100) {
        document.querySelector('#reader-font-size').textContent =
          readerFontSize + 1;
        readerFontSize += 1;
      }
    });

  document
    .querySelector('#readerFontSize-selection .decrease')
    .addEventListener('click', () => {
      if (readerFontSize > 10) {
        document.querySelector('#reader-font-size').textContent =
          readerFontSize - 1;
        readerFontSize -= 1;
      }
    });

  document
    .querySelector('#translationFontSize-selection .increase')
    .addEventListener('click', () => {
      if (translationFontSize < 100) {
        document.querySelector('#translation-font-size').textContent =
          translationFontSize + 1;
        translationFontSize += 1;
      }
    });

  document
    .querySelector('#translationFontSize-selection .decrease')
    .addEventListener('click', () => {
      if (translationFontSize > 10) {
        document.querySelector('#translation-font-size').textContent =
          translationFontSize - 1;
        translationFontSize -= 1;
      }
    });

  document
    .querySelector('#dictFontSize-selection .increase')
    .addEventListener('click', () => {
      if (dictFontSize < 100) {
        document.querySelector('#dict-font-size').textContent =
          dictFontSize + 1;
        dictFontSize += 1;
      }
    });

  document
    .querySelector('#dictFontSize-selection .decrease')
    .addEventListener('click', () => {
      if (dictFontSize > 10) {
        document.querySelector('#dict-font-size').textContent =
          dictFontSize - 1;
        dictFontSize -= 1;
      }
    });

  document.querySelector('.apply.btn').addEventListener('click', () => {
    if (document.querySelector('#useDeepL-selection .yes.selected'))
      optionsData.useDeepL = true;
    else optionsData.useDeepL = false;

    if (document.querySelector('#deepLDual-selection .yes.selected'))
      optionsData.deepLDual = true;
    else optionsData.deepLDual = false;

    if (document.querySelector('#deepLOnly-selection .yes.selected'))
      optionsData.deepLOnly = true;
    else optionsData.deepLOnly = false;

    if (document.querySelector('#fadeText-selection .yes.selected'))
      optionsData.fadeText = true;
    else optionsData.fadeText = false;

    if (document.querySelector('#addFurigana-selection .yes.selected'))
      optionsData.addFurigana = true;
    else optionsData.addFurigana = false;

    if (document.querySelector('#showGoal-selection .yes.selected'))
      optionsData.showGoal = true;
    else optionsData.showGoal = false;

    if (document.querySelector('#darkMode-selection .yes.selected'))
      optionsData.darkMode = true;
    else optionsData.darkMode = false;

    if (document.querySelector('#tvMode-selection .yes.selected'))
      optionsData.tvMode = true;
    else optionsData.tvMode = false;

    if (document.querySelector('#translationTransparent-selection .yes.selected'))
      optionsData.translationTransparent = true;
    else optionsData.translationTransparent = false;

    if (!optionsData.useDeepL && optionsData.deepLOnly)
      optionsData.useDeepL = true;

    optionsData.dailyGoal = dailyGoal;
    optionsData.readerFontSize = readerFontSize;
    optionsData.translationFontSize = translationFontSize;
    optionsData.dictFontSize = dictFontSize;

    USER_SETTINGS.set('options', optionsData);

    ipcRenderer.send('restartProgram');
  });
});
