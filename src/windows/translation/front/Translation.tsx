import { ipcRenderer } from 'electron';
import { ReactNode, useEffect, useState } from 'react';

import log_renderer from 'electron-log/renderer';
const log = log_renderer.scope('translation');
import { IPC_CHANNELS } from '@globals/ts/main/objects';

import { setupEffect, toastLayout } from '@globals/ts/renderer/helpers';
import { TranslatedSentence } from './TranslatedSentence';
import Loader from '@globals/components/Loader/Loader';
import { DraggableBar } from '@globals/components/DraggableBar/DraggableBar';
import ConfigurationDrawer from '@globals/components/ConfigurationDrawer/ConfigurationDrawer';
import { ConfigurationDrawerCommonSettings } from '@globals/components/ConfigurationDrawer/ConfigurationDrawerCommonSettings';

import { Text, useToasts } from '@geist-ui/core';
import ToggleStateSwitch from '@globals/components/ConfigurationDrawer/ConfigurationDrawerComponents/ToggleStateSwitch';
import { OpenSettingsButton } from '@globals/components/ConfigurationDrawer/ConfigurationDrawerComponents/OpenSettingsButton';



const DeepFailedMessage = () => {
    return (<Text p className='deep-state-msg failed'>
        Failed to connect to <span className="url">https://deepl.com/</span>.<br />
        Check your internet connection and restart japReader.
    </Text>);
};

const ConnectingToDeepMessage = () => {
    return (<Text p className='deep-state-msg connecting'>
        <Loader /> Connecting to <span className="url">https://deepl.com/</span>...<br />
        Please wait patiently.
    </Text>);
};

const ConnectedToDeepMessage = () => {
    return (<Text p className='deep-state-msg connected'>
        Successfully connected to <span className="url">https://deepl.com/</span>!
    </Text>);
};

const TooManyCharactersCopiedMessage = () => {
    return (<Text p className='deep-state-msg too-many-characters'>
        Too many characters copied to clipboard. <br />
        No request has been made to <span className="url">https://deepl.com/</span>. <br />
        This has been implemented to prevent you from getting banned.
    </Text>);
};

const ParseNotificationMessage = () => {
    // Some bloated messages 4 fun
    const verbs = [
        'Translating', 'Transcribing', 'Deciphering', 'Decoding',
        'Transliterating', 'Rendering', 'Transposing', 'Transmutating'
    ];
    return (<Text p className='parse-notification-msg'>
        <Loader /> {verbs[Math.floor(Math.random() * verbs.length)]}...
    </Text>);
};


const Message = (props: any) => {
    const isDeepReady = props.isDeepReady;
    const didDeepFail = props.didDeepFail;
    const translatedSentence = props.translatedSentence;
    const japaneseSentence = props.japaneseSentence;

    if (didDeepFail) return (<DeepFailedMessage />);
    if (!isDeepReady) return (<ConnectingToDeepMessage />);
    if (translatedSentence == '') return (<ConnectedToDeepMessage />);
    if (translatedSentence == '/tooManyCharacters/') return (<TooManyCharactersCopiedMessage />);
    if (translatedSentence == '/parsing/') return (<ParseNotificationMessage />);
    return (<TranslatedSentence japaneseSentence={japaneseSentence} translatedSentence={translatedSentence} />);
};



export const Translation = () => {
    const [isUIShown, setUIShown] = useState(true);
    const { setToast, removeAll } = useToasts(toastLayout);
    const [isDeepReady, setDeepReady] = useState(false);
    const [didDeepFail, setDeepFailed] = useState(false);
    const [translatedSentence, setTranslatedSentence] = useState('');
    const [showJapaneseSentence, setShowJapaneseSentence] = useState(true);
    const [centerText, setCenterText] = useState(false);
    const [japaneseSentence, setJapaneseSentence] = useState('');

    const showToast = (text: string | ReactNode, delay: number) => setToast({
        text: text, delay: delay
    });

    const toggleCenterText = () => {
        setCenterText(!centerText);
    };

    const toggleShowJapaneseSentence = () => {
        setShowJapaneseSentence(!showJapaneseSentence);
    };

    const settings = <>
        <OpenSettingsButton/>
        <ConfigurationDrawerCommonSettings
            windowName="translation"
            ipcBase={IPC_CHANNELS.TRANSLATION}
        />
        <ToggleStateSwitch
            fn={toggleCenterText}
            initialChecked={centerText}
            text="Center text" />
        <ToggleStateSwitch
            fn={toggleShowJapaneseSentence}
            initialChecked={showJapaneseSentence}
            text="Show original Japanese sentence" />
    </>;

    setupEffect(
        IPC_CHANNELS.TRANSLATION,
        setUIShown,
        removeAll,
        showToast,
        log,
        IPC_CHANNELS.DEEP,
        isDeepReady,
        setDeepReady,
    );

    useEffect(() => {
        // TODO: Only move translation window and reader window to top on
        // japaneseSentence change if their window.isAlwaysOnTop() is true
        ipcRenderer.send(IPC_CHANNELS.TRANSLATION.SET.SHOW);
    }, [japaneseSentence]);

    useEffect(() => {
        ipcRenderer.on(IPC_CHANNELS.DEEP.ANNOUNCE.TRANSLATED_TEXT, (event, translatedSentence: string, japaneseSentence: string) => {
            setTranslatedSentence(translatedSentence);
            setJapaneseSentence(japaneseSentence);
        });

        ipcRenderer.on(IPC_CHANNELS.DEEP.ANNOUNCE.CONNECTION_ERROR, () => {
            setDeepFailed(true);
        });

        ipcRenderer.on(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.CHANGE_DETECTED, () => {
            setTranslatedSentence('/parsing/');
        });

        ipcRenderer.on(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.TOO_MANY_CHARACTERS, () => {
            setTranslatedSentence('/tooManyCharacters/');
        });

        return () => {
            ipcRenderer.removeAllListeners(IPC_CHANNELS.DEEP.ANNOUNCE.CONNECTION_ERROR);
            ipcRenderer.removeAllListeners(IPC_CHANNELS.DEEP.ANNOUNCE.TRANSLATED_TEXT);
            ipcRenderer.removeAllListeners(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.CHANGE_DETECTED);
            ipcRenderer.removeAllListeners(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.TOO_MANY_CHARACTERS);
        };
    }, []);

    const classes = ['translation-wrapper']
        .concat(!showJapaneseSentence ? 'hide-japanese-sentence' : []);

    return (<>
        {isUIShown && <DraggableBar title='japReader - Translation'/>}
        <div style={{ textAlign: centerText ? 'center' : 'left' }}
            className={classes.join(' ')}
        >
            <Message
                isDeepReady={isDeepReady}
                didDeepFail={didDeepFail}
                translatedSentence={translatedSentence}
                japaneseSentence={japaneseSentence}
            />
        </div>
        {isUIShown && <ConfigurationDrawer
            settings={settings}
        />}
    </>);
};