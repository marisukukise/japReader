const { ipcRenderer } = require('electron');
const fs = require('fs');

let englishText = '';
let japaneseText = '';

window.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line global-require
  const $ = require('jquery');

  let deepLConnected = false;
  let deepLDual = false;
  let onTop = false;
  let showBorders = true;

  ipcRenderer.send('positionTranslation');

  const { translationFontSize, translationTransparent, darkMode } = JSON.parse(
    fs.readFileSync('./data/options.json', {
      encoding: 'utf8',
      flag: 'r',
    })
  );
  if(darkMode){
    document.documentElement.classList.add('dark-mode');
  }
  document.querySelector('#app').style.fontSize = `${translationFontSize}px`;

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
          $('body').prepend(
            '<div id="on-top-msg"><section>On Top: True</section></div>'
          );
          stayTimer = setTimeout(() => {
            $('#on-top-msg').remove();
          }, 1000);
        } else {
          $('#on-top-msg').remove();
          clearTimeout(stayTimer);
          $('body').prepend(
            '<div id="on-top-msg"><section>On Top: False</section></div>'
          );
          stayTimer = setTimeout(() => {
            $('#on-top-msg').remove();
          }, 1000);
        }
        ipcRenderer.send('translationOnTop');
      } else if (event.key === 'h' && translationTransparent) {
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
    },
    true
  );

  if (fs.existsSync('./data/options.json')) {
    const options = JSON.parse(
      fs.readFileSync('./data/options.json', {
        encoding: 'utf8',
        flag: 'r',
      })
    );
    deepLDual = options.deepLDual;
  }

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
