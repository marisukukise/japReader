
const { ipcRenderer } = require('electron');
const deepl = require('deepl-node');
const { useDeepLApi, deepLApiKey } = {"useDeepLApi": false, "deepLApiKey": ""};
import log from 'electron-log/renderer';

if (useDeepLApi) {
  log.silly("Checking if DeepL API key is correct")
  try {
    const translator = new deepl.Translator(deepLApiKey);
    log.debug("DeepL API key is correct")
  } catch (error) {
    ipcRenderer.send('deepLConnectionError');
    log.error("DeepL API key is wrong");
    log.error(error)
  }
}

window.addEventListener('DOMContentLoaded', () => {
  log.debug("DOMContentLoaded in deep");

  ipcRenderer.on('translateWithDeepL', (event, text) => {
    log.debug("Attempting to translate with DeepL");
    ipcRenderer.send('translateNotification');
    const currentText = text.replace(/…+/, '…').replace(/・+/g, '…');

    if (useDeepLApi) {
      log.debug("Using DeepL API")
      const translator = new deepl.Translator(deepLApiKey);
      translator
        .translateText(currentText, 'ja', 'en-US')
        .then(
          (result: any) => {
            log.info("Translated text with DeepL: ", result.text);
            ipcRenderer.send('showTranslation', result.text, currentText);
            return result.text
          },
          (error: any) => {
            ipcRenderer.send('deepLConnectionError');
            log.error(error);
          })
        .then(
          (result: any) => ipcRenderer.send('appendToHistory', currentText, result),
          (error: any) => log.error(error)
        );
    }
    else {
      log.debug("Using DeepL.com href")
      document.location.href = `https://www.deepl.com/translator#ja/en/${currentText}`;
    }
  });

  if (useDeepLApi) {
    const translator = new deepl.Translator(deepLApiKey, { maxRetries: 1, minTimeout: 2000 });
    const connectionCheck = setTimeout(() => {
      log.silly("Checking if connected to DeepL...")
      translator
        .getUsage()
        .then((e: any) => {
          ipcRenderer.send('deepLConnected');
          log.debug("Connected to DeepL");
          clearInterval(connectionCheck);
        })
    }, 500);

    setTimeout(() => {
      if (deepLApiKey == "") {
        ipcRenderer.send('deepLConnectionError');
        log.error("DeepL API key is wrong");
      } else {
        translator
          .getUsage()
          .catch((err: any) => {
            ipcRenderer.send('deepLConnectionError');
            log.error(err);
          })
      }
    }, 8000);
  }
  else {
    const targetNode = document.querySelector('div[aria-labelledby="translation-results-heading"]');
    const sourceNode = document.querySelector('div[aria-labelledby="translation-source-heading"]');
    const config = { childList: true };
    const callback = () => {
      if (targetNode.textContent) {
        const deeplText = [...targetNode.children].map(x => x.textContent).join(" ");
        log.silly("Detected DeepL English on the website: ", deeplText)
        const japaneseText = [...sourceNode.children].map(x => x.textContent).join(" ");
        log.silly("Detected DeepL Japanese on the website: ", japaneseText)
        ipcRenderer.send('showTranslation', deeplText, japaneseText);
        ipcRenderer.send('appendToHistory', japaneseText, deeplText);
      }
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    const connectionCheck = setTimeout(() => {
      if (document.querySelector('.dl_body').children.length !== 0) {
        log.verbose("Connected to DeepL.com href")
        ipcRenderer.send('deepLConnected');
        clearInterval(connectionCheck);
      }
    }, 500);

    setTimeout(() => {
      if (document.body.children.length === 0) {
        ipcRenderer.send('deepLConnectionError');
        log.verbose("Couldn't connect to DeepL.com href")
      }
    }, 8000);
  }
});
