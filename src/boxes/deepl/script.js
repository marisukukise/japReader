require('module-alias/register')
const { ipcRenderer } = require('electron');

const tools = require('@tools');
const Store = require('electron-store')

const deepl = require('deepl-node')
const OPTIONS = new Store(tools.getOptionsStoreOptions());
const { useDeepLApi, deepLApiKey } = OPTIONS.get('options')
try {
  const translator = new deepl.Translator(deepLApiKey);
} catch (error) {
  ipcRenderer.send('deepLConnectionError');
  console.error(error);
}

window.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.on('translateWithDeepL', (event, text) => {
    ipcRenderer.send('translateNotification');
    const currentText = text.replace(/…+/, '…').replace(/・+/g, '…');
    if(useDeepLApi){
      const translator = new deepl.Translator(deepLApiKey);
      translator
        .translateText(currentText, 'ja', 'en-US')
        .then(result => {
          console.log(currentText, result)
          ipcRenderer.send('showTranslation', result.text, currentText);
        }).catch(error => {
          ipcRenderer.send('deepLConnectionError');
          console.error(error);
        })
    }
    else{
      document.location.href = `https://www.deepl.com/translator#ja/en/${currentText}`;
    }
  });

    if(useDeepLApi){
      const translator = new deepl.Translator(deepLApiKey, {maxRetries: 1, minTimeout: 2000});
      const connectionCheck = setTimeout(() => {
        translator
          .getUsage()
          .then(e => {
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
            .catch(e => {
              ipcRenderer.send('deepLConnectionError');
            })
        }
      }, 8000);
    }
    else{
      const targetNode = document.querySelector('div[aria-labelledby="translation-results-heading"]');
      const sourceNode = document.querySelector('div[aria-labelledby="translation-source-heading"]');
      const config = { childList: true };
      const callback = () => {
        if (targetNode.textContent) {
          const deeplText = [...targetNode.children].map(x => x.textContent).join(" ");
          const japaneseText = [...sourceNode.children].map(x => x.textContent).join(" ");
          ipcRenderer.send('showTranslation', deeplText, japaneseText);
        }
      };

      const observer = new MutationObserver(callback);
      observer.observe(targetNode, config);

      const connectionCheck = setTimeout(() => {
        if (document.querySelector('.dl_body').length !== 0) {
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

