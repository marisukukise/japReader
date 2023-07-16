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
const log = log_renderer.scope('dictionary');
import { IPC_CHANNELS, STATUS } from '@globals/ts/main/objects';

import { getSettingsStore, getStatusDataStore } from '@globals/ts/main/initializeStore';
const statusDataStore = getStatusDataStore();
const settingsStore = getSettingsStore();

import { FuriganaJSX, setupEffect, toastLayout, updateWordStatusStore } from '@globals/ts/renderer/helpers';
import { DraggableBar } from '@globals/components/DraggableBar/DraggableBar';
import ConfigurationDrawer from '@globals/components/ConfigurationDrawer/ConfigurationDrawer';
import { ConfigurationDrawerCommonSettings } from '@globals/components/ConfigurationDrawer/ConfigurationDrawerCommonSettings';
import { atom, useAtom, useSetAtom } from 'jotai';

import { Grid, Button, ButtonGroup, useToasts } from '@geist-ui/core';
import { AnkiButton } from './AnkiButton';
import { AudioButton } from './AudioButton';

const {
    useDeep, ankiIntegration, ankiDeckName, ankiModelName,
    ankiInfinitive, ankiInfinitiveKana, ankiInfinitiveFurigana,
    ankiWord, ankiWordKana, ankiWordFurigana, ankiJapaneseSentence,
    ankiEnglishSentence } = settingsStore.get('global_settings');


export const wordAtom = atom<string>('');
export const wordKanaAtom = atom<string>('');
export const infinitiveAtom = atom<string>('');
export const infinitiveKanaAtom = atom<string>('');
export const definitionsAtom = atom<string>('');
export const japaneseSentenceAtom = atom<string>('');
export const translatedSentenceAtom = atom<string>('');

export const Dictionary = () => {
    const [isUIShown, setUIShown] = useState(true);
    const { setToast, removeAll } = useToasts(toastLayout);
    const [isReaderReady, setReaderReady] = useState(false);
    const [status, setStatus] = useState('');
    const [knownCount, setKnownCount] = useState(statusDataStore.get(`status_data.${STATUS.KNOWN}.length`, 0));
    const [seenCount, setSeenCount] = useState(statusDataStore.get(`status_data.${STATUS.SEEN}.length`, 0));

    const setWord = useSetAtom(wordAtom);
    const setWordKana = useSetAtom(wordKanaAtom);
    const setJapaneseSentence = useSetAtom(japaneseSentenceAtom);
    const setTranslatedSentence = useSetAtom(translatedSentenceAtom);
    const [infinitive, setInfinitive] = useAtom(infinitiveAtom);
    const [infinitiveKana, setInfinitiveKana] = useAtom(infinitiveKanaAtom);
    const [definitions, setDefinitions] = useAtom(definitionsAtom);


    const showToast = (text: string | ReactNode, delay: number) => setToast({
        text: text, delay: delay
    });

    const settings = <>
        <ConfigurationDrawerCommonSettings
            windowName="dictionary"
            ipcBase={IPC_CHANNELS.DICTIONARY}
        />
    </>;

    setupEffect(
        IPC_CHANNELS.DICTIONARY,
        setUIShown,
        removeAll,
        showToast,
        log,
        IPC_CHANNELS.READER,
        isReaderReady,
        setReaderReady,
    );

    useEffect(() => {
        ipcRenderer.on(IPC_CHANNELS.READER.ANNOUNCE.PARSED_WORDS_DATA, (
            event,
            SelectedWord: japReader.IchiParsedWordData & { japaneseSentence: string, translatedSentence: string }
        ) => {
            setStatus(SelectedWord.status);
            setWord(SelectedWord.word);
            setWordKana(SelectedWord.wordKana);
            setInfinitive(SelectedWord.infinitive);
            setInfinitiveKana(SelectedWord.infinitiveKana);
            setDefinitions(SelectedWord.definitions);
            setJapaneseSentence(SelectedWord.japaneseSentence);
            setTranslatedSentence(SelectedWord.translatedSentence);
        });

        ipcRenderer.on(IPC_CHANNELS.READER.ANNOUNCE.WORD_STATUS_CHANGE_DETECTED, (event, dictionaryForm, newStatus, prevStatus) => {
            setStatus(newStatus);
            if (newStatus == STATUS.SEEN)
                setSeenCount((seen: number) => seen + 1);
            if (newStatus == STATUS.KNOWN)
                setKnownCount((known: number) => known + 1);
            if (prevStatus == STATUS.SEEN)
                setSeenCount((seen: number) => seen - 1);
            if (prevStatus == STATUS.KNOWN)
                setKnownCount((known: number) => known - 1);
        });

        return () => {
            ipcRenderer.removeAllListeners(IPC_CHANNELS.READER.ANNOUNCE.PARSED_WORDS_DATA);
            ipcRenderer.removeAllListeners(IPC_CHANNELS.READER.ANNOUNCE.WORD_STATUS_CHANGE_DETECTED);
        };
    }, []);



    const getHTMLObject = (html_code: string) => {
        return { __html: html_code };
    };

    const setSeenStatus = () => {
        if (infinitive) {
            updateWordStatusStore(infinitive, STATUS.SEEN);
            setStatus(STATUS.SEEN);
        }
    };
    const setKnownStatus = () => {
        if (infinitive) {
            updateWordStatusStore(infinitive, STATUS.KNOWN);
            setStatus(STATUS.KNOWN);
        }
    };
    const setIgnoredStatus = () => {
        if (infinitive) {
            updateWordStatusStore(infinitive, STATUS.IGNORED);
            setStatus(STATUS.IGNORED);
        }
    };

    const classes = ['dictionary-wrapper'];

    return (<>
        {isUIShown && <DraggableBar />}
        {infinitive ?
            <div
                className={classes.join(' ')}
            >
                <Grid.Container gap={2} justify="space-between" className="status-data-stats">
                    <Grid xs={12} justify="flex-start">Seen: {seenCount}</Grid>
                    <Grid xs={12} justify="flex-end">Known: {knownCount}</Grid>
                </Grid.Container>
                <div className="search-engines">
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
                </div>

                <div id="main-buttons">
                    <AudioButton />
                    {ankiIntegration && <AnkiButton />}
                    <ButtonGroup>
                        <Button onClick={setSeenStatus}>Seen</Button>
                        <Button onClick={setKnownStatus}>Known</Button>
                        <Button onClick={setIgnoredStatus}>Ignored</Button>
                    </ButtonGroup>
                </div>
                <div className={status + " infinitive-display"}>
                    <div className='word'>
                        <FuriganaJSX kanaOrKanji={infinitive} kana={infinitiveKana} />
                    </div>
                </div>
                <p className="definitions" dangerouslySetInnerHTML={getHTMLObject(definitions)}></p>
            </div >
            : <></>}
        {isUIShown && <ConfigurationDrawer
            settings={settings}
        />
        }
    </>);
};