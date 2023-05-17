const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.on('translateWithDeepL', (event, text) => {
    const currentText = text.replace(/…+/, '…').replace(/・+/g, '…');
    ipcRenderer.send('translateNotification');
    document.location.href = `https://www.deepl.com/translator#ja/en/${currentText}`;
  });

  const targetNode = document.querySelector('div[aria-labelledby="translation-results-heading"]');
  console.log(targetNode);
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
});

setTimeout(() => {
  if (document.body.children.length === 0) {
    ipcRenderer.send('deepLConnectionError');
  }
}, 10000);
