const { ipcRenderer, clipboard } = require('electron');
const { setIntervalAsync } = require('set-interval-async/dynamic');
const clipboardListener = require('clipboard-event');
const os = require('os');

const charLimit = 90;
let clipboardText = '';

const formatText = (text) => {
  text = text
    // remove symbols (heart, star, etc.)
    .replace(/[\u22c0-\u266b]/g, '')
    // turn half-width digits into full-width
    .replace(
      /[0-9]/g,
      function(ch) { return String.fromCharCode(ch.charCodeAt(0) + 0xfee0); }
    );
  return text;
}

const handleChange = () => {
  console.log(clipboard.readText())
  clipboardContent = clipboard.readText()
  if (clipboardContent.includes("???")) {
    console.error("Clipboard content:", clipboardContent);
  } else {
    console.log("Clipboard content:", clipboardContent);
  }
  
  let text = clipboard.readText().trim();
  console.log("Trimmed text: ",text)

  text = formatText(text);
  console.log("Formatted text: ",text)

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
  // FALLBACK IF THE MODULE DOESN'T WORK
  /*
  if (os.platform() === 'darwin') {
    setIntervalAsync(() => {
      handleChange();
    }, 500);
  } else {
  */
  clipboardListener.startListening();
  clipboardListener.on('change', () => {
    console.log('\nCLIPBOARD CHANGE DETECTED');
    handleChange();
  });
});
