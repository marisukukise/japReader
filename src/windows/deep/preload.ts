
const { ipcRenderer } = require('electron');
const deepl = require('deepl-node');


import { getSettingsStore } from "@globals/ts/main/initializeStore";
const settingsStore = getSettingsStore();
const { useDeepLApi, deepLApiKey } = settingsStore.get("options")

import log from 'electron-log/renderer';

if (useDeepLApi) {
  log.silly("Checking if DeepL API key is correct")
  try {
    const translator = new deepl.Translator(deepLApiKey);
    log.debug("DeepL API key is correct")
  } catch (error) {
    ipcRenderer.send('announce/deep/connectionError');
    log.error("DeepL API key is wrong");
    log.error(error)
  }
}

window.addEventListener('DOMContentLoaded', () => {
  log.debug("DOMContentLoaded in deep");

  ipcRenderer.on('announce/clipboard/changeDetected', (event, text) => {
    log.debug("Attempting to translate with DeepL");
    const currentText = text.replace(/…+/, '…').replace(/・+/g, '…');

    if (useDeepLApi) {
      log.debug("Using DeepL API")
      const translator = new deepl.Translator(deepLApiKey);
      translator
        .translateText(currentText, 'ja', 'en-US')
        .then(
          (result: any) => {
            log.info("Translated text with DeepL: ", result.text);
            ipcRenderer.send('set/deep/translationText', result.text, currentText);
            return result.text
          },
          (error: any) => {
            ipcRenderer.send('announce/deep/connectionError');
            log.error(error);
          })
        .then(
          (result: any) => ipcRenderer.send('append/historyStore/entry', currentText, result),
          (error: any) => log.error(error)
        );
    }
    else {
      log.debug("Using DeepL.com href")
      document.location.href = `https://www.deepl.com/translator#ja/en/`;
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
          ipcRenderer.send("announce/deep/isReady");
          log.debug("Connected to DeepL");
          clearInterval(connectionCheck);
        })
    }, 500);

    setTimeout(() => {
      if (deepLApiKey == "") {
        ipcRenderer.send('announce/deep/connectionError');
        log.error("DeepL API key is wrong");
      } else {
        translator
          .getUsage()
          .catch((err: any) => {
            ipcRenderer.send('announce/deep/connectionError');
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
        ipcRenderer.send('set/deep/translationText', deeplText, japaneseText);
        ipcRenderer.send('append/historyStore/entry', japaneseText, deeplText);
      }
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    const connectionCheck = setTimeout(() => {
      if (document.querySelector('.dl_body').children.length !== 0) {
        log.verbose("Connected to DeepL.com href")
        ipcRenderer.send("announce/deep/isReady");
        clearInterval(connectionCheck);
      }
    }, 500);

    setTimeout(() => {
      if (document.body.children.length === 0) {
        ipcRenderer.send('announce/deep/connectionError');
        log.verbose("Couldn't connect to DeepL.com href")
      }
    }, 8000);
  }
});
