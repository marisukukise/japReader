import { ipcRenderer } from 'electron';
import { ReactNode, useEffect, useState } from 'react';

import log_renderer from 'electron-log/renderer';
const log = log_renderer.scope('reader');
import { IPC_CHANNELS, STATUS } from '@globals/ts/main/objects';

import { getSettingsStore, getWindowStore } from '@globals/ts/main/initializeStore';
const settingsStore = getSettingsStore();
const { useDeepL } = settingsStore.get('global_settings');

import { setupEffect, toastLayout } from '@globals/ts/renderer/helpers';
import { Sentence } from './Sentence';
import Loader from '@globals/components/Loader/Loader';
import { DraggableBar } from '@globals/components/DraggableBar/DraggableBar';
import ConfigurationDrawer from '@globals/components/ConfigurationDrawer/ConfigurationDrawer';
import { ConfigurationDrawerCommonSettings } from '@globals/components/ConfigurationDrawer/ConfigurationDrawerCommonSettings';

import { Text, useToasts } from '@geist-ui/core';
import ToggleStateSwitch from '@globals/components/ConfigurationDrawer/ConfigurationDrawerComponents/ToggleStateSwitch';
import FuriganaController from '@globals/components/ConfigurationDrawer/ConfigurationDrawerComponents/FuriganaController';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { OpenSettingsButton } from '@globals/components/ConfigurationDrawer/ConfigurationDrawerComponents/OpenSettingsButton';

export const isIchiReadyAtom = atom<boolean>(false);
export const didIchiFailAtom = atom<boolean>(false);
export const japaneseSentenceAtom = atom<string>('');
export const translatedSentenceAtom = atom<string>('');
export const wordListAtom = atom<japReader.IchiParsedWordData[]>([]);
export const isUIShownAtom = atom<boolean>(true);

const windowStore = getWindowStore();

const IchiFailedMessage = () => {
    return (<Text p className='ichi-state-msg failed'>
        Failed to connect to <span className="url">https://ichi.moe/</span>.<br />
        Check your internet connection and restart japReader.
    </Text>);
};

const ConnectingToIchiMessage = () => {
    return (<Text p className='ichi-state-msg connecting'>
        <Loader /> Connecting to <span className="url">https://ichi.moe/</span>...<br />
        Please wait patiently.
    </Text>);
};

const ConnectedToIchiMessage = () => {
    return (<Text p className='ichi-state-msg connected'>
        Successfully connected to <span className="url">https://ichi.moe/</span>!
    </Text>);
};

const TooManyCharactersCopiedMessage = () => {
    return (<Text p className='ichi-state-msg too-many-characters'>
        Too many characters copied to clipboard. <br />
        No request has been made to <span className="url">https://ichi.moe/</span>. <br />
        This has been implemented to prevent you from getting banned.
    </Text>);
};

const ParseNotificationMessage = () => {
    // Some bloated messages 4 fun
    const verbs = [
        'Dissecting', 'Analyzing', 'Loading', 'Inspecting',
        'Scrutinizing', 'Parsing', 'Breaking down', 'Resolving',
        'Decomposing', 'Surveying', 'Probing', 'Scanning'
    ];
    return (<Text p className='parse-notification-msg'>
        <Loader /> {verbs[Math.floor(Math.random() * verbs.length)]}...
    </Text>);
};

const Message = () => {
    const isIchiReady = useAtomValue(isIchiReadyAtom);
    const didIchiFail = useAtomValue(didIchiFailAtom);
    const japaneseSentence = useAtomValue(japaneseSentenceAtom);

    if (didIchiFail) return (<IchiFailedMessage />);
    if (!isIchiReady) return (<ConnectingToIchiMessage />);
    if (japaneseSentence == '') return (<ConnectedToIchiMessage />);
    if (japaneseSentence == '/tooManyCharacters/') return (<TooManyCharactersCopiedMessage />);
    if (japaneseSentence == '/parsing/') return (<ParseNotificationMessage />);
    return (<Sentence />);
};

const getFuriganaSetting = (status: string): boolean => {
    const furiganaSettings = windowStore.get('reader.additional.furigana', false);
    if (!furiganaSettings) return false;
    return furiganaSettings.includes(status);
};

export const Reader = () => {
    const [isUIShown, setUIShown] = useAtom(isUIShownAtom);
    const { setToast, removeAll } = useToasts(toastLayout);

    const [isIchiReady, setIchiReady] = useAtom(isIchiReadyAtom);
    const setIchiFailed = useSetAtom(didIchiFailAtom);
    const [didDeepFail, setDeepFailed] = useState(false);
    const [japaneseSentence, setJapaneseSentence] = useAtom(japaneseSentenceAtom);
    const setTranslatedSentence = useSetAtom(translatedSentenceAtom);
    const setCurrentWords = useSetAtom(wordListAtom);

    const [isCenteredText, setCenteredText] = useState(windowStore.get('reader.additional.centeredText', false));
    const [hasNewStatusFurigana, setNewStatusFurigana] = useState(getFuriganaSetting(STATUS.NEW));
    const [hasSeenStatusFurigana, setSeenStatusFurigana] = useState(getFuriganaSetting(STATUS.SEEN));
    const [hasKnownStatusFurigana, setKnownStatusFurigana] = useState(getFuriganaSetting(STATUS.KNOWN));
    const [hasIgnoredStatusFurigana, setIgnoredStatusFurigana] = useState(getFuriganaSetting(STATUS.IGNORED));

    const showToast = (text: string | ReactNode, delay: number) => setToast({
        text: text, delay: delay
    });

    const toggleCenteredText = () => {
        setCenteredText(!isCenteredText);
        windowStore.set('reader.additional.centeredText', !isCenteredText);
    };

    const updateFuriganaRules = (furiganaStatuses: string[]) => {
        setNewStatusFurigana(furiganaStatuses.includes(STATUS.NEW));
        setSeenStatusFurigana(furiganaStatuses.includes(STATUS.SEEN));
        setKnownStatusFurigana(furiganaStatuses.includes(STATUS.KNOWN));
        setIgnoredStatusFurigana(furiganaStatuses.includes(STATUS.IGNORED));
        windowStore.set('reader.additional.furigana', furiganaStatuses);
    };

    const initialCheckedFurigana = [
        hasNewStatusFurigana ? STATUS.NEW : null,
        hasSeenStatusFurigana ? STATUS.SEEN : null,
        hasKnownStatusFurigana ? STATUS.KNOWN : null,
        hasIgnoredStatusFurigana ? STATUS.IGNORED : null,
    ].filter(e => e !== null);

    const settings = <>
        <OpenSettingsButton/>
        <ConfigurationDrawerCommonSettings
            windowName="reader"
            ipcBase={IPC_CHANNELS.READER}
        />
        <ToggleStateSwitch
            fn={toggleCenteredText}
            initialChecked={isCenteredText}
            text="Center text"
        />
        <FuriganaController
            fn={updateFuriganaRules}
            initialChecked={initialCheckedFurigana}
        />
    </>;

    setupEffect(
        IPC_CHANNELS.READER,
        setUIShown,
        removeAll,
        showToast,
        log,
        IPC_CHANNELS.ICHI,
        isIchiReady,
        setIchiReady,
    );

    useEffect(() => {
        ipcRenderer.on(IPC_CHANNELS.ICHI.ANNOUNCE.PARSED_WORDS_DATA, (event, words: japReader.IchiParsedWordData[], japaneseSentence: string) => {
            // TODO: Somehow add memoization to Japanese sentences, so that common ones don't have to wait for ichi
            setCurrentWords(words);
            setJapaneseSentence(japaneseSentence);
            if (!useDeepL) ipcRenderer.send(IPC_CHANNELS.STORES.HISTORY.APPEND, japaneseSentence, null);
        });

        ipcRenderer.on(IPC_CHANNELS.ICHI.ANNOUNCE.CONNECTION_ERROR, () => {
            setIchiFailed(true);
        });

        ipcRenderer.on(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.CHANGE_DETECTED, () => {
            setJapaneseSentence('/parsing/');
        });

        ipcRenderer.on(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.TOO_MANY_CHARACTERS, () => {
            setJapaneseSentence('/tooManyCharacters/');
        });

        if (useDeepL) {
            ipcRenderer.on(IPC_CHANNELS.DEEP.ANNOUNCE.TRANSLATED_TEXT, (event, translatedSentence: string) => {
                setTranslatedSentence(translatedSentence);
            });

            ipcRenderer.on(IPC_CHANNELS.DEEP.ANNOUNCE.CONNECTION_ERROR, () => {
                setDeepFailed(true);
            });
        }

        return () => {
            if (useDeepL) {
                ipcRenderer.removeAllListeners(IPC_CHANNELS.DEEP.ANNOUNCE.TRANSLATED_TEXT);
                ipcRenderer.removeAllListeners(IPC_CHANNELS.DEEP.ANNOUNCE.CONNECTION_ERROR);
            }
            ipcRenderer.removeAllListeners(IPC_CHANNELS.ICHI.ANNOUNCE.PARSED_WORDS_DATA);
            ipcRenderer.removeAllListeners(IPC_CHANNELS.ICHI.ANNOUNCE.CONNECTION_ERROR);
            ipcRenderer.removeAllListeners(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.CHANGE_DETECTED);
            ipcRenderer.removeAllListeners(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.TOO_MANY_CHARACTERS);
        };
    }, []);

    useEffect(() => {
        ipcRenderer.send(IPC_CHANNELS.READER.SET.SHOW);
    }, [japaneseSentence]);


    const classes = ['reader-wrapper']
        .concat(!hasNewStatusFurigana ? 'hide-furigana-new' : [])
        .concat(!hasSeenStatusFurigana ? 'hide-furigana-seen' : [])
        .concat(!hasKnownStatusFurigana ? 'hide-furigana-known' : [])
        .concat(!hasIgnoredStatusFurigana ? 'hide-furigana-ignored' : []);

    return (<>
        {isUIShown && <DraggableBar title='japReader' />}
        <div style={{ textAlign: isCenteredText ? 'center' : 'left' }}
            className={classes.join(' ')}
        >
            <Message />
        </div>
        {isUIShown && <ConfigurationDrawer
            settings={settings}
        />}
    </>);
};