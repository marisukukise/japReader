
const { ipcRenderer } = require('electron');
const deepl = require('deepl-node');
import { IPC_CHANNELS } from '@globals/ts/main/objects';



import { getSettingsStore } from '@globals/ts/main/initializeStore';
const settingsStore = getSettingsStore();
const { useDeepLApi, deepLApiKey } = settingsStore.get('global_settings');

import log_renderer from 'electron-log/renderer';
const log = log_renderer.scope('deep');
import { mountLog } from '@globals/ts/renderer/helpers';

if (useDeepLApi) {
    try {
        const translator = new deepl.Translator(deepLApiKey);
    } catch (err) {
        ipcRenderer.send(IPC_CHANNELS.DEEP.ANNOUNCE.CONNECTION_ERROR);
        log.error(err);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    mountLog(log, '🔺 Mounted');
    ipcRenderer.on(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.CHANGE_DETECTED, (event, text) => {
        const currentText = text.replace(/…+/, '…').replace(/・+/g, '…');

        if (useDeepLApi) {
            const translator = new deepl.Translator(deepLApiKey);
            translator
                .translateText(currentText, 'ja', 'en-US')
                .then(
                    (result: any) => {
                        ipcRenderer.send(IPC_CHANNELS.DEEP.ANNOUNCE.TRANSLATED_TEXT, result.text, currentText);
                        return result.text;
                    },
                    (err: any) => {
                        ipcRenderer.send(IPC_CHANNELS.DEEP.ANNOUNCE.CONNECTION_ERROR);
                        log.error(err);
                    })
                .then(
                    (result: any) => ipcRenderer.send(IPC_CHANNELS.STORES.HISTORY.APPEND, currentText, result),
                    (err: any) => log.error(err)
                );
        }
        else {
            // TODO: Add support of languages other than English (ichi dictionary is English-only, 
            // some people probably only want to use the DeepL translation). 
            // Also remember about API in translator.translateText function
            document.location.href = 'https://www.deepl.com/translator#ja/en/';
            document.location.href = `https://www.deepl.com/translator#ja/en/${currentText}`;
        }
    });

    if (useDeepLApi) {
        const translator = new deepl.Translator(deepLApiKey, { maxRetries: 1, minTimeout: 2000 });
        const connectionCheck = setTimeout(() => {
            translator
                .getUsage()
                .then(() => {
                    ipcRenderer.send(IPC_CHANNELS.DEEP.ANNOUNCE.IS_READY);
                    clearInterval(connectionCheck);
                });
        }, 500);

        setTimeout(() => {
            if (deepLApiKey == '') {
                ipcRenderer.send(IPC_CHANNELS.DEEP.ANNOUNCE.CONNECTION_ERROR);
                log.error('DeepL API key is wrong');
            } else {
                translator
                    .getUsage()
                    .catch((err: any) => {
                        ipcRenderer.send(IPC_CHANNELS.DEEP.ANNOUNCE.CONNECTION_ERROR);
                        log.error(err);
                    });
            }
        }, 8000);
    }
    else {
        const targetNode = document.querySelector('div[aria-labelledby="translation-results-heading"]');
        const sourceNode = document.querySelector('div[aria-labelledby="translation-source-heading"]');
        const config = { childList: true };
        const callback = () => {
            if (targetNode.textContent) {
                const deeplText = [...targetNode.children].map(x => x.textContent).join(' ');
                const japaneseText = [...sourceNode.children].map(x => x.textContent).join(' ');
                ipcRenderer.send(IPC_CHANNELS.DEEP.ANNOUNCE.TRANSLATED_TEXT, deeplText, japaneseText);
                ipcRenderer.send(IPC_CHANNELS.STORES.HISTORY.APPEND, japaneseText, deeplText);
            }
        };

        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);

        const connectionCheck = setTimeout(() => {
            if (document.querySelector('.dl_body').children.length !== 0) {
                ipcRenderer.send(IPC_CHANNELS.DEEP.ANNOUNCE.IS_READY);
                clearInterval(connectionCheck);
            }
        }, 500);

        setTimeout(() => {
            if (document.body.children.length === 0) {
                ipcRenderer.send(IPC_CHANNELS.DEEP.ANNOUNCE.CONNECTION_ERROR);
            }
        }, 8000);
    }
});
