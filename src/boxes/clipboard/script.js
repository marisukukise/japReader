const { ipcRenderer, clipboard } = require('electron');
const { setIntervalAsync } = require('set-interval-async/dynamic');
const clipboardListener = require('clipboard-event');
const os = require('os');

const charLimit = 90;
let clipboardText = '';

// Time complexity is pretty bad on Linux,
// so keep this under 20
const clipboardReads = 11;

const formatText = (text) => {
  text = text.trim()
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
  let text = clipboard.readText();
  
  // Perform two additional reads to see if misreading was detected,
  // because sometimes randomly at low frequency (exact reason unknown)
  // clipboard.readText() return empty strings.
  if (text == "" || text != clipboard.readText() || text != clipboard.readText()) {
    // If detected a misreading in the sample of 3 reads (rare case),
    // read clipboard many times in a row and get majority value from the array
    
    let clipboard_reads = [];
    for (var i = 0; i < clipboardReads; i++) clipboard_reads[i] = clipboard.readText();

    const counts = {};
    for (const e of clipboard_reads) counts[e] = counts[e] ? counts[e] + 1 : 1;

    text =  Object.keys(counts).length != 1 
        ? Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b) 
        : Object.keys(counts)[0];
  }

  text = formatText(text);

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
    handleChange();
  });
});
