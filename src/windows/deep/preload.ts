
const { ipcRenderer } = require('electron');
const deepl = require('deepl-node');
import { IPC_CHANNELS } from '@root/src/globals/ts/other/objects';



import { getSettingsStore } from '@root/src/globals/ts/initializers/initializeStore';
const settingsStore = getSettingsStore();
const { useDeepLApi, deepLApiKey } = settingsStore.get('global_settings');

import log_renderer from 'electron-log/renderer';
const log = log_renderer.scope('deep');
import { mountLog } from '@root/src/globals/ts/helpers/rendererHelpers';

if (useDeepLApi) {
    try {
        new deepl.Translator(deepLApiKey);
    } catch (err) {
        ipcRenderer.send(IPC_CHANNELS.DEEP.ANNOUNCE.CONNECTION_ERROR);
        log.error(err);
    }
}

let originalText = ""

window.addEventListener('DOMContentLoaded', () => {
    mountLog(log, '🔺 Mounted');
    ipcRenderer.on(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.CHANGE_DETECTED, (_event, text) => {
        const currentText = text.replace(/…+/, '…').replace(/・+/g, '…');
        originalText = text

        if (useDeepLApi) {
            const translator = new deepl.Translator(deepLApiKey);
            translator
                .translateText(currentText, 'ja', 'en-US')
                .then(
                    (result: any) => {
                        ipcRenderer.send(IPC_CHANNELS.DEEP.ANNOUNCE.TRANSLATED_TEXT, result.text, originalText);
                        ipcRenderer.send(IPC_CHANNELS.STORES.HISTORY.APPEND, result.text, originalText)
                    },
                    (err: any) => {
                        ipcRenderer.send(IPC_CHANNELS.DEEP.ANNOUNCE.CONNECTION_ERROR);
                        log.error(err);
                    })
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
        const DOM_ERROR_MESSAGE = 'Looks like the deepl.com changed the structure of their website.\
            You can alternatively use DeepL API (select the option in global settings) until the japReader hotfix is released.';

        // Change the querySelector tags below to the new ones, if something broke on deepl.com website
        const targetNode = document.querySelector('div[aria-labelledby="translation-results-heading"]');
        if (targetNode === null) {
            throw new Error('DeepL translated text node was not found.\n' + DOM_ERROR_MESSAGE);
        }
        const config = { childList: true };
        const callback = () => {
            if (targetNode.textContent) {
                const deeplText = [...targetNode.children].map(x => x.textContent).join(' ');
                ipcRenderer.send(IPC_CHANNELS.DEEP.ANNOUNCE.TRANSLATED_TEXT, deeplText, originalText);
                ipcRenderer.send(IPC_CHANNELS.STORES.HISTORY.APPEND, deeplText, originalText);
            }
        };

        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);

        const connectionCheck = setTimeout(() => {
            const dl_body = document.querySelector('.dl_body');
            if (dl_body === null) {
                throw new Error('DeepL body element was not found.\n' + DOM_ERROR_MESSAGE);
            }
            if (dl_body.children.length !== 0) {
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
