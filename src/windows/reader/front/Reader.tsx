import { ipcRenderer } from 'electron';
import { useEffect, useRef, useState } from 'react';

import log_renderer from 'electron-log/renderer';
import { createScopedLog } from '@globals/ts/main/setupLogging';
const log = createScopedLog(log_renderer, 'reader');
import { IPC_CHANNELS, WORD_DATA_STATUSES } from '@globals/ts/main/objects';

import { getSettingsStore } from '@globals/ts/main/initializeStore';
const settingsStore = getSettingsStore();
const { useDeepL } = settingsStore.get('options');

import { listenForAnotherWindowIsReady } from '@globals/ts/renderer/helpers';
import { Sentence } from './Sentence';
import Loader from '@globals/components/Loader/Loader';
import { DraggableBar } from '@globals/components/DraggableBar/DraggableBar';
import ConfigurationDrawer from '@globals/components/ConfigurationDrawer/ConfigurationDrawer';
import { ConfigurationDrawerCommonSettings } from '@globals/components/ConfigurationDrawer/ConfigurationDrawerCommonSettings';

import { Text } from '@geist-ui/core';
import ToggleStateSwitch from '@globals/components/ConfigurationDrawer/ConfigurationDrawerComponents/ToggleStateButton';
import FuriganaController from '@globals/components/ConfigurationDrawer/ConfigurationDrawerComponents/FuriganaController';



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


export const Reader = () => {
    const [isIchiReady, setIchiReady] = useState(false);
    const [didIchiFail, setIchiFailed] = useState(false);
    const [japaneseSentence, setJapaneseSentence] = useState('');
    const [isCenteredText, setCenteredText] = useState(false);
    const [hasNewStatusFurigana, setNewStatusFurigana] = useState(true);
    const [hasSeenStatusFurigana, setSeenStatusFurigana] = useState(true);
    const [hasKnownStatusFurigana, setKnownStatusFurigana] = useState(false);
    const [hasIgnoredStatusFurigana, setIgnoredStatusFurigana] = useState(false);
    const currentWords = useRef({});

    const toggleCenteredText = () => {
        setCenteredText(!isCenteredText);
    };

    const updateFuriganaRules = (furiganaStatuses: string[]) => {
        setNewStatusFurigana(furiganaStatuses.includes(WORD_DATA_STATUSES.NEW))
        setSeenStatusFurigana(furiganaStatuses.includes(WORD_DATA_STATUSES.SEEN))
        setKnownStatusFurigana(furiganaStatuses.includes(WORD_DATA_STATUSES.KNOWN))
        setIgnoredStatusFurigana(furiganaStatuses.includes(WORD_DATA_STATUSES.IGNORED))
    }

    const initialCheckedFurigana = [
        hasNewStatusFurigana ? WORD_DATA_STATUSES.NEW : null,
        hasSeenStatusFurigana ? WORD_DATA_STATUSES.SEEN : null,
        hasKnownStatusFurigana ? WORD_DATA_STATUSES.KNOWN : null,
        hasIgnoredStatusFurigana ? WORD_DATA_STATUSES.IGNORED : null,
    ].filter(e => e !== null)

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


    const classes = ["reader-wrapper"]
        .concat(!hasNewStatusFurigana ? 'hide-furigana-new' : [])
        .concat(!hasSeenStatusFurigana ? 'hide-furigana-seen' : [])
        .concat(!hasKnownStatusFurigana ? 'hide-furigana-known' : [])
        .concat(!hasIgnoredStatusFurigana ? 'hide-furigana-ignored' : [])

    return (<>
        <DraggableBar />
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
        <ConfigurationDrawer
            settings={settings}
        />
    </>);
};