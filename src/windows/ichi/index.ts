// This is the TypeScript file of the ichi window.

import log from 'electron-log/renderer';
log.silly('Log from the ichi process');

window.addEventListener('DOMContentLoaded', () => {
  window.api.log("yo from ichi");
  console.log("yo")
});

