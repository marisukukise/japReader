import { ipcRenderer } from 'electron';
import { ReactNode, useEffect, useState } from 'react';
import BritainFlag from '@img/symbols/britain.png';
import JapanFlag from '@img/symbols/japan.png';
import PictureSymbol from '@img/symbols/image.png';
import DuckDuckGoIcon from '@img/favicons/duckduckgo.ico';
import GoogleIcon from '@img/favicons/google.ico';
import JishoIcon from '@img/favicons/jisho.ico';
import WeblioENIcon from '@img/favicons/weblio-en.png';
import WeblioJPIcon from '@img/favicons/weblio-jp.png';
import WikipediaIcon from '@img/favicons/wikipedia.ico';
import WiktionaryENIcon from '@img/favicons/wiktionary-en.ico';
import WiktionaryJPIcon from '@img/favicons/wiktionary-jp.ico';

import log_renderer from 'electron-log/renderer';
import { createScopedLog } from '@globals/ts/main/setupLogging';
const log = createScopedLog(log_renderer, 'dictionary');
import { IPC_CHANNELS, WORD_DATA_STATUSES } from '@globals/ts/main/objects';

import { getStatusDataStore } from '@globals/ts/main/initializeStore';
const statusDataStore = getStatusDataStore();

import { FuriganaJSX, addHideUIListener, listenForAnotherWindowIsReady, toastLayout, updateWordStatusStore } from '@globals/ts/renderer/helpers';
import { DraggableBar } from '@globals/components/DraggableBar/DraggableBar';
import ConfigurationDrawer from '@globals/components/ConfigurationDrawer/ConfigurationDrawer';
import { ConfigurationDrawerCommonSettings } from '@globals/components/ConfigurationDrawer/ConfigurationDrawerCommonSettings';

import { Grid, Button, ButtonGroup, useToasts } from '@geist-ui/core';



export const Dictionary = () => {
    const [isUIShown, setUIShown] = useState(true);
    const { setToast, removeAll } = useToasts(toastLayout);
    const [isReaderReady, setReaderReady] = useState(false);
    const [status, setStatus] = useState('');
    const [dictForm, setDictForm] = useState('');
    const [dictFormReading, setDictFormReading] = useState('');
    const [definitions, setDefinitions] = useState('');
    const [known, setKnown] = useState(
        statusDataStore.has(`status_data.${WORD_DATA_STATUSES.KNOWN}`) ?
            statusDataStore.get(`status_data.${WORD_DATA_STATUSES.KNOWN}`).length : 0
    );
    const [seen, setSeen] = useState(
        statusDataStore.has(`status_data.${WORD_DATA_STATUSES.SEEN}`) ?
            statusDataStore.get(`status_data.${WORD_DATA_STATUSES.SEEN}`).length : 0
    );

    const showToast = (text: string | ReactNode, delay: number) => setToast({
        text: text, delay: delay
    });

    const settings = <>
        <ConfigurationDrawerCommonSettings
            windowName="dictionary"
            ipcBase={IPC_CHANNELS.DICTIONARY}
        />
    </>;

    useEffect(() => {
        log.log('mounted dictionary');

        ipcRenderer.send(IPC_CHANNELS.DICTIONARY.ANNOUNCE.IS_READY);

        ipcRenderer.on(IPC_CHANNELS.READER.ANNOUNCE.EXTENDED_WORDS_DATA, (event, extendedWordData: japReader.ExtendedWordData) => {
            setStatus(extendedWordData.status);
            setDictForm(extendedWordData.dictForm);
            setDictFormReading(extendedWordData.dictFormReading);
            setDefinitions(extendedWordData.definitions);
        });


        ipcRenderer.on(IPC_CHANNELS.READER.ANNOUNCE.WORD_STATUS_CHANGE_DETECTED, (event, dictionaryForm, newStatus, prevStatus) => {
            if (newStatus == WORD_DATA_STATUSES.SEEN)
                setSeen((seen: number) => seen + 1);
            if (newStatus == WORD_DATA_STATUSES.KNOWN)
                setKnown((known: number) => known + 1);
            if (prevStatus == WORD_DATA_STATUSES.SEEN)
                setSeen((seen: number) => seen - 1);
            if (prevStatus == WORD_DATA_STATUSES.KNOWN)
                setKnown((known: number) => known - 1);
        });

        listenForAnotherWindowIsReady(IPC_CHANNELS.READER,
            isReaderReady, setReaderReady);

        addHideUIListener(IPC_CHANNELS.DICTIONARY, setUIShown, removeAll, showToast);

        return () => {
            log.log('unmounted dictionary');
            ipcRenderer.removeAllListeners(IPC_CHANNELS.DICTIONARY.SET.HIDE_UI);
            ipcRenderer.removeAllListeners(IPC_CHANNELS.READER.ANNOUNCE.IS_READY);
            ipcRenderer.removeAllListeners(IPC_CHANNELS.READER.ANNOUNCE.EXTENDED_WORDS_DATA);
            ipcRenderer.removeAllListeners(IPC_CHANNELS.READER.ANNOUNCE.WORD_STATUS_CHANGE_DETECTED);
        };
    }, []);

    const getHTMLObject = (html_code: string) => {
        return { __html: html_code };
    };

    const setSeenStatus = () => {
        if (dictForm) {
            updateWordStatusStore(dictForm, WORD_DATA_STATUSES.SEEN);
            setStatus(WORD_DATA_STATUSES.SEEN);
        }
    };
    const setKnownStatus = () => {
        if (dictForm) {
            updateWordStatusStore(dictForm, WORD_DATA_STATUSES.KNOWN);
            setStatus(WORD_DATA_STATUSES.KNOWN);
        }
    };
    const setIgnoredStatus = () => {
        if (dictForm) {
            updateWordStatusStore(dictForm, WORD_DATA_STATUSES.IGNORED);
            setStatus(WORD_DATA_STATUSES.IGNORED);
        }
    };

    const classes = ['dictionary-wrapper'];

    return (<>
        {isUIShown && <DraggableBar />}
        <div
            className={classes.join(' ')}
        >
            <Grid.Container gap={2} justify="space-between" className="status-data-stats">
                <Grid xs={12} justify="flex-start">Seen: {seen}</Grid>
                <Grid xs={12} justify="flex-end">Known: {known}</Grid>
            </Grid.Container>
            <Grid.Container gap={2} justify="center" className="search-engines">
                <Grid xs={8} justify="flex-end">
                    <fieldset className="search-images">
                        <legend>
                            <img className="symbol" src={PictureSymbol} />
                        </legend>
                        <span id="google" className="search">
                            <img className="icon" title="Google Images" src={GoogleIcon} />
                        </span>
                        <span id="duckduckgo" className="search">
                            <img className="icon" title="DuckDuckGo Images" src={DuckDuckGoIcon} />
                        </span>
                    </fieldset>
                </Grid>
                <Grid xs={8} justify="center">
                    <fieldset className="search-english">
                        <legend>
                            <img className="symbol" src={BritainFlag} />
                        </legend>
                        <span id="jisho" className="search">
                            <img className="icon" title="Jisho.org (Japanese-English dictionary)" src={JishoIcon} />
                        </span>
                        <span id="weblio-en" className="search">
                            <img className="icon" title="Weblio (Japanese-English thesaurus)" src={WeblioENIcon} />
                        </span>
                        <span id="wiktionary-en" className="search">
                            <img className="icon" title="Wiktionary (English)" src={WiktionaryENIcon} />
                        </span>
                    </fieldset>
                </Grid>
                <Grid xs={8} justify="flex-start">
                    <fieldset className="search-japanese">
                        <legend>
                            <img className="symbol" src={JapanFlag} />
                        </legend>
                        <span id="weblio-jp" className="search">
                            <img className="icon" title="Weblio (Japanese dictionary)" src={WeblioJPIcon} />
                        </span>
                        <span id="wiktionary-jp" className="search">
                            <img className="icon" title="Wiktionary (Japanese)" src={WiktionaryJPIcon} />
                        </span>
                        <span id="wikipedia" className="search">
                            <img className="icon" title="Wikipedia (Japanese)" src={WikipediaIcon} />
                        </span>
                    </fieldset>
                </Grid>
            </Grid.Container>

            <div>
                <Button>Play audio</Button>
            </div>
            <div>
                <Button>Add to Anki</Button>
            </div>

            <ButtonGroup>
                <Button onClick={setSeenStatus}>Seen</Button>
                <Button onClick={setKnownStatus}>Known</Button>
                <Button onClick={setIgnoredStatus}>Ignored</Button>
            </ButtonGroup>
            <h1 className={status}><FuriganaJSX kanaOrKanji={dictForm} kana={dictFormReading} /></h1>
            <p dangerouslySetInnerHTML={getHTMLObject(definitions)}></p>
        </div>
        {isUIShown && <ConfigurationDrawer
            settings={settings}
        />}
    </>);
};