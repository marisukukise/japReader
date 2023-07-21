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
import { IPC_CHANNELS, STATUS } from '@root/src/globals/ts/other/objects';

import { getSettingsStore, getStatusDataStore } from '@root/src/globals/ts/initializers/initializeStore';
const statusDataStore = getStatusDataStore();
const settingsStore = getSettingsStore();

import { FuriganaJSX, setIgnoreMouseEvents, setupEffect, toastLayout, updateWordStatusStore } from '@root/src/globals/ts/helpers/rendererHelpers';
import { DraggableBar } from '@globals/components/DraggableBar/DraggableBar';
import ConfigurationDrawer from '@globals/components/ConfigurationDrawer/ConfigurationDrawer';
import { ConfigurationDrawerCommonSettings } from '@globals/components/ConfigurationDrawer/ConfigurationDrawerCommonSettings';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';

import { Grid, Button, ButtonGroup, useToasts } from '@geist-ui/core';
import { AnkiButton } from './AnkiButton';
import { AudioButton } from './AudioButton';
import { OpenSettingsButton } from '@globals/components/ConfigurationDrawer/ConfigurationDrawerComponents/OpenSettingsButton';

const { ankiIntegration } = settingsStore.get('global_settings');


export const wordAtom = atom<string>('');
export const wordKanaAtom = atom<string>('');
export const infinitiveAtom = atom<string>('');
export const infinitiveKanaAtom = atom<string>('');
export const definitionsAtom = atom<string>('');
export const japaneseSentenceAtom = atom<string>('');
export const translatedSentenceAtom = atom<string>('');

const isUIShownAtom = atom<boolean>(true);


type UrlImageProps = {
    icon: any,
    title: string,
    url: string,
    id: string
}
const UrlImage = ({ icon, title, url, id }: UrlImageProps) => {
    const isUIShown = useAtomValue(isUIShownAtom);

    const openUrl = () => {
        console.log('in dictionary');
        ipcRenderer.send(IPC_CHANNELS.MAIN.HANDLE.OPEN_EXTERNAL, url);
    };

    return <span id={id} title={title} onClick={openUrl} className="search"
        onMouseEnter={() => setIgnoreMouseEvents(false, isUIShown)}
        onMouseLeave={() => setIgnoreMouseEvents(true, isUIShown)}
    ><img className="icon" src={icon} /></span>;
};

export const Dictionary = () => {
    const [isUIShown, setUIShown] = useAtom(isUIShownAtom);
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
        <OpenSettingsButton/>
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
            console.log(SelectedWord.translatedSentence, SelectedWord.japaneseSentence);
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
        {isUIShown && <DraggableBar title='japReader - Dictionary' />}
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
                        <UrlImage id="google" icon={GoogleIcon} title="Google Images" url={`https://www.google.co.jp/search?q=${infinitive}&tbm=isch`} />
                        <UrlImage id="duckduckgo" icon={DuckDuckGoIcon} title="DuckDuckGo Images" url={`https://duckduckgo.com/?q=${infinitive}&kp=-1&kl=jp-jp&iax=images&ia=images`} />
                    </fieldset>
                    <fieldset className="search-english">
                        <legend>
                            <img className="symbol" src={BritainFlag} />
                        </legend>
                        <UrlImage id="jisho" icon={JishoIcon} title='Jisho.org' url={`https://jisho.org/search/${infinitive}`} />
                        <UrlImage id="weblio-en" icon={WeblioENIcon} title="Weblio EN" url={`https://ejje.weblio.jp/english-thesaurus/content/${infinitive}`} />
                        <UrlImage id="wiktionary-en" icon={WiktionaryENIcon} title="Wiktionary EN" url={`https://en.wiktionary.org/wiki/${infinitive}#Japanese`} />
                    </fieldset>
                    <fieldset className="search-japanese">
                        <legend>
                            <img className="symbol" src={JapanFlag} />
                        </legend>
                        <UrlImage id="weblio-jp" icon={WeblioJPIcon} title='Weblio JP' url={`https://www.weblio.jp/content/${infinitive}`} />
                        <UrlImage id="wiktionary-jp" icon={WiktionaryJPIcon} title='Wiktionary JP' url={`https://ja.wiktionary.org/wiki/${infinitive}#日本語`} />
                        <UrlImage id="wikipedia" icon={WikipediaIcon} title='Wiipedia JP' url={`https://ja.wikipedia.org/wiki/${infinitive}`} />
                    </fieldset>
                </div>

                <div id="main-buttons"
                    onMouseEnter={() => setIgnoreMouseEvents(false, isUIShown)}
                    onMouseLeave={() => setIgnoreMouseEvents(true, isUIShown)}
                >
                    <AudioButton />
                    {ankiIntegration && <AnkiButton />}
                    <ButtonGroup>
                        <Button onClick={setSeenStatus}>Seen</Button>
                        <Button onClick={setKnownStatus}>Known</Button>
                        <Button onClick={setIgnoredStatus}>Ignored</Button>
                    </ButtonGroup>
                </div>
                <div className={status + ' infinitive-display'}
                    onMouseEnter={() => setIgnoreMouseEvents(false, isUIShown)}
                    onMouseLeave={() => setIgnoreMouseEvents(true, isUIShown)}
                >
                    <div className='word'>
                        <FuriganaJSX kanaOrKanji={infinitive} kana={infinitiveKana} />
                    </div>
                </div>
                <p className="definitions" dangerouslySetInnerHTML={getHTMLObject(definitions)}></p>
            </div>
            : <div>
                <h1>Dictionary</h1>
                Copy some Japanese text and press on a word in the reader window to browse the dictionary.
            </div>}
        {isUIShown && <ConfigurationDrawer
            settings={settings}
        />
        }
    </>);
};