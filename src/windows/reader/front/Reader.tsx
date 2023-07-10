import { ipcRenderer } from "electron";
import { useEffect, useRef, useState } from "react";

import log_renderer from 'electron-log/renderer';
import { createScopedLog } from "@globals/ts/main/setupLogging";
const log = createScopedLog(log_renderer, 'reader')
import { IPC_CHANNELS } from "@globals/ts/main/objects";

import { getSettingsStore } from "@globals/ts/main/initializeStore";
const settingsStore = getSettingsStore();
const { useDeepL } = settingsStore.get("options")

import { listenForAnotherWindowIsReady } from "@globals/ts/renderer/helpers";
import { Sentence } from "./Sentence";
import Loader from "@globals/components/Loader/Loader";
import { DraggableBar } from "@globals/components/DraggableBar/DraggableBar";
import ConfigurationDrawer from '@globals/components/ConfigurationDrawer/ConfigurationDrawer';
import { ConfigurationDrawerSettings } from '@globals/components/ConfigurationDrawer/ConfigurationDrawerSettings/ConfigurationDrawerSettings';

import { Text } from '@geist-ui/core'

const settings = [
    ConfigurationDrawerSettings.open_settings,
    ConfigurationDrawerSettings.reader_background_color_picker,
    ConfigurationDrawerSettings.reader_font_color_picker,
    ConfigurationDrawerSettings.reader_on_top_button,
    ConfigurationDrawerSettings.reader_zoom_button_group,
]


const IchiFailedMessage = () => {
    return (<Text p className='ichi-state-msg failed'>
        Failed to connect to <span className="url">https://ichi.moe/</span>.<br />
        Check your internet connection and restart japReader.
    </Text>)
}

const ConnectingToIchiMessage = () => {
    return (<Text p className='ichi-state-msg connecting'>
        <Loader /> Connecting to <span className="url">https://ichi.moe/</span>...<br />
        Please wait patiently.
    </Text>)
}

const ConnectedToIchiMessage = () => {
    return (<Text p className='ichi-state-msg connected'>
        Successfully connected to <span className="url">https://ichi.moe/</span>!
    </Text>)
}

const TooManyCharactersCopiedMessage = () => {
    return (<Text p className='ichi-state-msg too-many-characters'>
        Too many characters copied to clipboard. <br />
        No request has been made to <span className="url">https://ichi.moe/</span>. <br />
        This has been implemented to prevent you from getting banned.
    </Text>)
}

const ParseNotificationMessage = () => {
    // Some bloated messages 4 fun
    const verbs = [
        'Dissecting', 'Analyzing', 'Loading', 'Inspecting',
        'Scrutinizing', 'Parsing', 'Breaking down', 'Resolving',
        'Decomposing', 'Surveying', 'Probing', 'Scanning'
    ];
    return (<Text p className='parse-notification-msg'>
        <Loader /> {verbs[Math.floor(Math.random() * verbs.length)]}...
    </Text>)
}

const Message = (props: any) => {
    const isIchiReady = props.isIchiReady;
    const didIchiFail = props.didIchiFail;
    const japaneseSentence = props.japaneseSentence;
    const words = props.words;

    if (didIchiFail) return (<IchiFailedMessage />)
    if (!isIchiReady) return (<ConnectingToIchiMessage />)
    if (japaneseSentence == '') return (<ConnectedToIchiMessage />)
    if (japaneseSentence == '/tooManyCharacters/') return (<TooManyCharactersCopiedMessage />)
    if (japaneseSentence == '/parsing/') return (<ParseNotificationMessage />)
    return (<Sentence words={words} />)
}


export const Reader = () => {
    const [isIchiReady, setIchiReady] = useState(false);
    const [didIchiFail, setIchiFailed] = useState(false);
    const [japaneseSentence, setJapaneseSentence] = useState('');
    const [centerText, setCenterText] = useState(false);
    const currentWords = useRef({})

    log.log("%crendering reader", "color: red; font-size:1.5rem; font-weight: bold;")

    useEffect(() => {
        log.log("mounted reader")

        ipcRenderer.send(IPC_CHANNELS.READER.ANNOUNCE.IS_READY)

        listenForAnotherWindowIsReady(IPC_CHANNELS.ICHI,
            isIchiReady,
            setIchiReady);

        ipcRenderer.on(IPC_CHANNELS.ICHI.ANNOUNCE.PARSED_WORDS_DATA, (event, words: japReader.IchiParsedWordData[], japaneseSentence: string) => {
            // TODO: Somehow add memoization to Japanese sentences, so that common ones don't have to wait for ichi
            log.log("received from ichi:", words, japaneseSentence)
            currentWords.current = words;
            setJapaneseSentence(japaneseSentence);
            if (!useDeepL) ipcRenderer.send(IPC_CHANNELS.STORES.HISTORY.APPEND, japaneseSentence, null)
        })

        ipcRenderer.on(IPC_CHANNELS.ICHI.ANNOUNCE.CONNECTION_ERROR, () => {
            log.log("ichi failed")
            setIchiFailed(true);
        })

        ipcRenderer.on(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.CHANGE_DETECTED, () => {
            log.log("parsing")
            setJapaneseSentence("/parsing/");
        })

        ipcRenderer.on(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.TOO_MANY_CHARACTERS, () => {
            log.log("tooManyCharacters")
            setJapaneseSentence("/tooManyCharacters/");
        })


        return () => {
            log.log("unmounted reader")
            ipcRenderer.removeAllListeners(IPC_CHANNELS.ICHI.ANNOUNCE.PARSED_WORDS_DATA);
            ipcRenderer.removeAllListeners(IPC_CHANNELS.ICHI.ANNOUNCE.CONNECTION_ERROR);
            ipcRenderer.removeAllListeners(IPC_CHANNELS.ICHI.ANNOUNCE.IS_READY);
            ipcRenderer.removeAllListeners(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.CHANGE_DETECTED);
            ipcRenderer.removeAllListeners(IPC_CHANNELS.CLIPBOARD.ANNOUNCE.TOO_MANY_CHARACTERS);
        }
    }, [])

    useEffect(() => {
        ipcRenderer.send(IPC_CHANNELS.READER.SET.FOCUS);
    }, [japaneseSentence])

    const centerTextHandler = () => {
        setCenterText(!centerText);
    }

    return (<>
        <DraggableBar />
        <div style={{ textAlign: centerText ? "center" : "left" }}>
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
    </>)
}