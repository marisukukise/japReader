const { ipcRenderer, clipboard } = require('electron');
const { setIntervalAsync } = require('set-interval-async/dynamic');
const clipboardListener = require('clipboard-event');
const os = require('os');

const charLimit = 90;
let clipboardText = '';

// Time complexity is pretty bad on Linux,
// so keep this under 20
const clipboardReads = 11;

let TOTAL_READS = 0;
let MISREADINGS = 0;

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

let count = 0;
let sum = 0;

const calculateRunningAverage = (newNumber) => {
  count++;
  sum += newNumber;
  return sum/count;  
}

const handleChange = (operationID) => {
  let a_operation = Date.now();
  console.info("<Operation ", operationID, ">", a_operation);

  console.info("Detected clipboard change @ ", Date.now())

  let a_read = Date.now();
  console.info("Start readings @ ", a_read);

  let clipboard_reads = [];
  // Read clipboard multiple times in a row and get majority value
  // Because sometimes at low frequency (exact reason unknown)
  // Clipboard reads return empty strings.
  for (var i = 0; i < clipboardReads; i++) {
    clipboard_reads[i] = clipboard.readText();
    TOTAL_READS += 1;
  }
  let b_read = Date.now();
  console.info("Stop readings @ ", b_read, "Took ", b_read-a_read, "ms");
  
  let a_majority = Date.now();
  console.info("Start finding majority @ ", a_majority);

  const counts = {};
  for (const e of clipboard_reads) counts[e] = counts[e] ? counts[e] + 1 : 1;

  text = '';
  
  console.debug(counts);

  if (Object.keys(counts).length != 1){
    const majority_string = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    text = majority_string;
    console.debug(majority_string);
    MISREADINGS += clipboardReads-counts[majority_string];
    console.error(`DETECTED ${clipboardReads-counts[majority_string]} MISREADINGS. ${((MISREADINGS/TOTAL_READS)*100).toFixed(3)}% OF TOTAL READS WERE MISREADINGS.`)
  }
  else {
    text = Object.keys(counts)[0];
  }

  let b_majority = Date.now();
  console.info("Stop finding majority @ ", b_majority, "Took ", b_majority-a_majority, "ms");
  console.table([TOTAL_READS, MISREADINGS])


  text = formatText(text);
  console.log("Copied text: ",text);

  let b_operation = Date.now();
  console.info("</Operation ", operationID, ">", "Took ", b_operation-a_operation, "ms");

  console.info(`Average operation time after: ${count+1} iterations: ${calculateRunningAverage(b_operation-a_operation)}`)
  

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
