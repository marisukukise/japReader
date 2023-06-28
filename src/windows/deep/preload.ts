import log from 'electron-log/renderer';
log.silly('Initialized the deep process');

const { ipcRenderer } = require('electron');
const deepl = require('deepl-node');
const { useDeepLApi, deepLApiKey } = {"useDeepLApi": false, "deepLApiKey": ""};

if (useDeepLApi) {
  try {
    const translator = new deepl.Translator(deepLApiKey);
  } catch (error) {
    ipcRenderer.send('deepLConnectionError');
    console.error(error);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.on('translateWithDeepL', (event, text) => {
    ipcRenderer.send('translateNotification');
    const currentText = text.replace(/…+/, '…').replace(/・+/g, '…');
    if (useDeepLApi) {
      const translator = new deepl.Translator(deepLApiKey);
      translator
        .translateText(currentText, 'ja', 'en-US')
        .then(
          (result: any) => {
            ipcRenderer.send('showTranslation', result.text, currentText);
            return result.text
          },
          (error: any) => {
            ipcRenderer.send('deepLConnectionError');
            console.error(error);
          })
        .then(
          (result: any) => ipcRenderer.send('appendToHistory', currentText, result),
          (error: any) => console.error(error)
        );
    }
    else {
      document.location.href = `https://www.deepl.com/translator#ja/en/${currentText}`;
    }
  });

  if (useDeepLApi) {
    const translator = new deepl.Translator(deepLApiKey, { maxRetries: 1, minTimeout: 2000 });
    const connectionCheck = setTimeout(() => {
      translator
        .getUsage()
        .then((e: any) => {
          ipcRenderer.send('deepLConnected');
          clearInterval(connectionCheck);
        })
    }, 500);

    setTimeout(() => {
      if (deepLApiKey == "") {
        ipcRenderer.send('deepLConnectionError');
      } else {
        translator
          .getUsage()
          .catch((err: any) => {
            ipcRenderer.send('deepLConnectionError');
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
        const japaneseText = [...sourceNode.children].map(x => x.textContent).join(" ");
        ipcRenderer.send('showTranslation', deeplText, japaneseText);
        ipcRenderer.send('appendToHistory', japaneseText, deeplText);
      }
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    const connectionCheck = setTimeout(() => {
      if (document.querySelector('.dl_body').children.length !== 0) {
        ipcRenderer.send('deepLConnected');
        clearInterval(connectionCheck);
      }
    }, 500);

    setTimeout(() => {
      if (document.body.children.length === 0) {
        ipcRenderer.send('deepLConnectionError');
      }
    }, 8000);
  }
});
