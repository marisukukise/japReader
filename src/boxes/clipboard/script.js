const { ipcRenderer, clipboard } = require('electron');
const { setIntervalAsync } = require('set-interval-async/dynamic');
const clipboardListener = require('clipboard-event');
const os = require('os');

const charLimit = 90;
let clipboardText = '';
let TOTAL_READS = 0;
let MISREADINGS = 0;

const formatText = (text) => {
  console.log(text)
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

const handleChange = (operationID) => {
 console.info("<Operation ", operationID, ">")
  console.info("Detected clipboard change @ ", Date.now())
  console.info("Start readings @ ",Date.now())
  let clipboard_reads = [];
  // Read clipboard 20 times in a row and get majority value
  // Because sometimes at low frequency (exact reason unknown)
  // Clipboard reads return empty strings.
  for (var i = 0; i < 20; i++) {
    clipboard_reads[i] = clipboard.readText();
    TOTAL_READS += 1;
  }
  console.info("Stop readings @ ",Date.now())
  console.info("Start finding majority @ ",Date.now())

  const counts = {};
  for (const e of clipboard_reads) counts[e] = counts[e] ? counts[e] + 1 : 1;

  text = '';
  
  console.debug(counts);

  if (Object.keys(counts).length != 1){
    const majority_string = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    text = majority_string;
    console.debug(majority_string);
    MISREADINGS += 20-counts[majority_string];
    console.error(`DETECTED ${20-counts[majority_string]} MISREADINGS. ${((MISREADINGS/TOTAL_READS)*100).toFixed(3)}% OF TOTAL READS WERE MISREADINGS.`)
  }
  else {
    text = Object.keys(counts)[0];
  }
  console.info("Stop finding majority @ ",Date.now())
  console.table([TOTAL_READS, MISREADINGS])

  text = formatText(text);
  console.log("Copied text: ",text);

  console.info("</Operation ", operationID, ">")

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
    handleChange(Math.random());
  });
});
