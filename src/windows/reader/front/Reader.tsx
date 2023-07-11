import { ipcRenderer } from 'electron';
import { ReactNode, useEffect, useRef, useState } from 'react';

import log_renderer from 'electron-log/renderer';
import { createScopedLog } from '@globals/ts/main/setupLogging';
const log = createScopedLog(log_renderer, 'reader');
import { IPC_CHANNELS, STATUS } from '@globals/ts/main/objects';

import { getSettingsStore , getWindowStore } from '@globals/ts/main/initializeStore';
const settingsStore = getSettingsStore();
const { useDeepL } = settingsStore.get('options');

import { addHideUIListener, listenForAnotherWindowIsReady, toastLayout } from '@globals/ts/renderer/helpers';
import { Sentence } from './Sentence';
import Loader from '@globals/components/Loader/Loader';
import { DraggableBar } from '@globals/components/DraggableBar/DraggableBar';
import ConfigurationDrawer from '@globals/components/ConfigurationDrawer/ConfigurationDrawer';
import { ConfigurationDrawerCommonSettings } from '@globals/components/ConfigurationDrawer/ConfigurationDrawerCommonSettings';

import { Text, useToasts } from '@geist-ui/core';
import ToggleStateSwitch from '@globals/components/ConfigurationDrawer/ConfigurationDrawerComponents/ToggleStateSwitch';
import FuriganaController from '@globals/components/ConfigurationDrawer/ConfigurationDrawerComponents/FuriganaController';


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

const Message = (props: any) => {
    const isIchiReady = props.isIchiReady;
    const didIchiFail = props.didIchiFail;
    const japaneseSentence = props.japaneseSentence;
    const words = props.words;

    if (didIchiFail) return (<IchiFailedMessage />);
    if (!isIchiReady) return (<ConnectingToIchiMessage />);
    if (japaneseSentence == '') return (<ConnectedToIchiMessage />);
    if (japaneseSentence == '/tooManyCharacters/') return (<TooManyCharactersCopiedMessage />);
    if (japaneseSentence == '/parsing/') return (<ParseNotificationMessage />);
    return (<Sentence words={words} />);
};

const getFuriganaSetting = (status: string): boolean => {
    const furiganaSettings = windowStore.get('reader.additional.furigana', false);
    if (!furiganaSettings) return false;
    return furiganaSettings.includes(status);
};

export const Reader = () => {
    const [isUIShown, setUIShown] = useState(true);
    const { setToast, removeAll } = useToasts(toastLayout);
    const [isIchiReady, setIchiReady] = useState(false);
    const [didIchiFail, setIchiFailed] = useState(false);
    const [japaneseSentence, setJapaneseSentence] = useState('');
    const [isCenteredText, setCenteredText] = useState(windowStore.get('reader.additional.centeredText', false));
    const [hasNewStatusFurigana, setNewStatusFurigana] = useState(getFuriganaSetting(STATUS.NEW));
    const [hasSeenStatusFurigana, setSeenStatusFurigana] = useState(getFuriganaSetting(STATUS.SEEN));
    const [hasKnownStatusFurigana, setKnownStatusFurigana] = useState(getFuriganaSetting(STATUS.KNOWN));
    const [hasIgnoredStatusFurigana, setIgnoredStatusFurigana] = useState(getFuriganaSetting(STATUS.IGNORED));
    const currentWords = useRef({});

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

    useEffect(() => {
        log.log('mounted reader');


        ipcRenderer.send(IPC_CHANNELS.READER.ANNOUNCE.IS_READY);

        listenForAnotherWindowIsReady(IPC_CHANNELS.ICHI,
            isIchiReady,
            setIchiReady);

        addHideUIListener(IPC_CHANNELS.READER, setUIShown, removeAll, showToast);

        ipcRenderer.on(IPC_CHANNELS.ICHI.ANNOUNCE.PARSED_WORDS_DATA, (event, words: japReader.IchiParsedWordData[], japaneseSentence: string) => {
            // TODO: Somehow add memoization to Japanese sentences, so that common ones don't have to wait for ichi
            log.log('received from ichi:', words, japaneseSentence);
            currentWords.current = words;
            setJapaneseSentence(japaneseSentence);
            if (!useDeepL) ipcRenderer.send(IPC_CHANNELS.STORES.HISTORY.APPEND, japaneseSentence, null);
        });



        ipcRenderer.on(IPC_CHANNELS.ICHI.ANNOUNCE.CONNECTION_ERROR, () => {
            log.log('ichi failed');
            setIchiFailed(true);
        });

        ipcRenderer.on(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.CHANGE_DETECTED, () => {
            log.log('parsing');
            setJapaneseSentence('/parsing/');
        });

        ipcRenderer.on(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.TOO_MANY_CHARACTERS, () => {
            log.log('tooManyCharacters');
            setJapaneseSentence('/tooManyCharacters/');
        });


        return () => {
            log.log('unmounted reader');
            ipcRenderer.removeAllListeners(IPC_CHANNELS.READER.SET.HIDE_UI);
            ipcRenderer.removeAllListeners(IPC_CHANNELS.ICHI.ANNOUNCE.PARSED_WORDS_DATA);
            ipcRenderer.removeAllListeners(IPC_CHANNELS.ICHI.ANNOUNCE.CONNECTION_ERROR);
            ipcRenderer.removeAllListeners(IPC_CHANNELS.ICHI.ANNOUNCE.IS_READY);
            ipcRenderer.removeAllListeners(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.CHANGE_DETECTED);
            ipcRenderer.removeAllListeners(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.TOO_MANY_CHARACTERS);
        };
    }, []);

    useEffect(() => {
        ipcRenderer.send(IPC_CHANNELS.READER.SET.FOCUS);
    }, [japaneseSentence]);


    const classes = ['reader-wrapper']
        .concat(!hasNewStatusFurigana ? 'hide-furigana-new' : [])
        .concat(!hasSeenStatusFurigana ? 'hide-furigana-seen' : [])
        .concat(!hasKnownStatusFurigana ? 'hide-furigana-known' : [])
        .concat(!hasIgnoredStatusFurigana ? 'hide-furigana-ignored' : []);

    return (<>
        {isUIShown && <DraggableBar />}
        <div style={{ textAlign: isCenteredText ? 'center' : 'left' }}
            className={classes.join(' ')}
        >
            <Message
                isIchiReady={isIchiReady}
                didIchiFail={didIchiFail}
                japaneseSentence={japaneseSentence}
                words={currentWords.current}
            />
        </div>
        {isUIShown && <ConfigurationDrawer
            settings={settings}
        />}
    </>);
};