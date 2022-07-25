const { ipcRenderer, clipboard } = require('electron');
const { setIntervalAsync } = require('set-interval-async/dynamic');
const clipboardListener = require('clipboard-event');
const os = require('os');

const charLimit = 90;
let clipboardText = '';

const handleChange = () => {
  let text = clipboard.readText().trim();

  // remove symbols (heart, star, etc.)
  text = text.replace(/[\u22c0-\u266b]/g, '');

  if (text !== clipboardText && /[一-龯]|[ぁ-んァ-ン]|…/.test(text)) {
    clipboardText = text;

    if (clipboardText.length >= charLimit) {
      ipcRenderer.send('tooManyCharacters');
    } else {
      ipcRenderer.send('clipboardChanged', clipboardText);
      ipcRenderer.send('parseNotification');
    }
  }
};

window.addEventListener('DOMContentLoaded', () => {
  if (os.platform() === 'darwin') {
    setIntervalAsync(() => {
      handleChange();
    }, 500);
  } else {
    clipboardListener.startListening();
    clipboardListener.on('change', () => {
      handleChange();
    });
  }
});
