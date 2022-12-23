require('module-alias/register')

const { ipcRenderer } = require('electron');
const fs = require('fs');

const tools = require('@tools');

const Store = require('electron-store')
const USER_SETTINGS = new Store({
  name: "user_settings",
  defaults: tools.getDefaultUserSettings()
})

let englishText = '';
let japaneseText = '';


window.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line global-require
  const $ = require('jquery');

  let deepLConnected = false;
  let deepLDual = false;
  let onTop = false;
  let showBorders = true;

  ipcRenderer.send('readyTranslation');

  const { translationFontSize, translationTransparent, darkMode } = USER_SETTINGS.get('options')
  if (darkMode) {
    document.documentElement.classList.add('dark-mode');
  }
  document.querySelector('#app').style.fontSize = `${translationFontSize}px`;

  $(window).on('keyup', (e) => {
    switch (e.key) {
      case 'o':
        ipcRenderer.send('openOptions');
        break;
      case 's':
        onTop = tools.toggle_onTop(onTop, $('body'));
        ipcRenderer.send('translationOnTop');
        break;
      case 'h':
        if (translationTransparent) {
          if (showBorders) {
            showBorders = false;
            document.body.style.border = '1px dashed transparent';
            document.querySelector('#move-bar').style.visibility = 'hidden';
          } else {
            showBorders = true;
            document.body.style.border = '1px dashed red';
            document.querySelector('#move-bar').style.visibility = 'visible';
          }
        }
        break;
    }
    return true;
  });

  const options = USER_SETTINGS.get('options')
  deepLDual = options.deepLDual;

  $('#app').html(
    'Connecting to <span class="url">https://www.deepl.com/</span>.'
  );
  $('#app').append('<br>');
  $('#app').append('Please wait patiently...');

  ipcRenderer.on('deepLConnected', () => {
    if (!deepLConnected) {
      deepLConnected = true;
      $('#app').html(
        'Successfully connected to <span class="url">https://www.deepl.com/</span>.'
      );
      $('#app').append('<br>');
      $('#app').append('Copy Japanese text to get DeepL translations.');
    }
  });

  ipcRenderer.on('deepLConnectionError', () => {
    $('#app').html(
      'Unable to connect to <span class="url">https://www.deepl.com/</span>.'
    );
    $('#app').append('<br>');
    $('#app').append(
      'Check your internet connection, and make sure the site is up.'
    );
    $('#app').append('<br><br>');
    $('#app').append(
      'Once you are able to connect to the site, restart this program.'
    );
    $('#app').append('<br>');
    $('#app').append('All of your progress will be saved.');
  });

  ipcRenderer.on('translateNotification', () => {
    $('#app').html('Translating...');
  });

  ipcRenderer.on('fadeText', (event, shouldFade) => {
    if (shouldFade) $('#app').addClass('fade');
    else $('#app').removeClass('fade');
  });

  ipcRenderer.on('tooManyCharacters', () => {
    $('#app').html('Too many characters copied to clipboard...');
    $('#app').append('<br>');
    $('#app').append(
      'No request has been made to <span class="url">https://www.deepl.com/</span>.'
    );
    $('#app').append('<br>');
    $('#app').append(
      'This has been implemented to prevent you from being banned.'
    );
  });

  ipcRenderer.on('showTranslation', (event, sourceText, targetText) => {
    englishText = sourceText.replace(/"/g, '');
    japaneseText = targetText;

    if (!deepLDual) $('#app').html(englishText);
    else {
      $('#app').html(`<div id="jap-text">${japaneseText}</div>`);
      $('#app').append(`<div id="english-text">${englishText}</div>`);
    }
  });

  ipcRenderer.on('requestTranslation', () => {
    ipcRenderer.send('sendTranslation', englishText);
  });
});
