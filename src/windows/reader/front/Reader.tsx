import { ipcRenderer } from "electron";
import { useEffect, useRef, useState } from "react";
import log_renderer from 'electron-log/renderer';
import { createScopedLog } from "@globals/ts/main/setupLogging";
const log = createScopedLog(log_renderer, 'reader')
import Loader from "@globals/components/Loader/Loader";
import { Sentence } from "./Sentence";
import { listenForAnotherWindowIsReady, removeListenerForAnotherWindow } from "@globals/ts/renderer/helpers";

import { getSettingsStore } from "@globals/ts/main/initializeStore";
import { DraggableBar } from "@globals/components/DraggableBar/DraggableBar";
const settingsStore = getSettingsStore();
const { useDeepL } = settingsStore.get("options")


const IchiFailedMessage = () => {
    return (<div className='ichi-state-msg failed'>
        Failed to connect to <span className="url">https://ichi.moe/</span>.<br />
        Check your internet connection and restart japReader.
    </div>)
}

const ConnectingToIchiMessage = () => {
    return (<div className='ichi-state-msg connecting'>
        <Loader /> Connecting to <span className="url">https://ichi.moe/</span>...<br />
        Please wait patiently.
    </div>)
}

const ConnectedToIchiMessage = () => {
    return (<div className='ichi-state-msg connected'>
        Successfully connected to <span className="url">https://ichi.moe/</span>!
    </div>)
}

const TooManyCharactersCopiedMessage = () => {
    return (<div className='ichi-state-msg too-many-characters'>
        Too many characters copied to clipboard. <br/>
        No request has been made to <span className="url">https://ichi.moe/</span>. <br/>
        This has been implemented to prevent you from getting banned.
    </div>)
}

const ParseNotificationMessage = () => {
    // Some bloated messages 4 fun
    const verbs = [
        'Dissecting', 'Analyzing', 'Loading', 'Inspecting',
        'Scrutinizing', 'Parsing', 'Breaking down', 'Resolving',
        'Decomposing', 'Surveying', 'Probing', 'Scanning'
    ];
    return (<div className='parse-notification-msg'>
        <Loader /> {verbs[Math.floor(Math.random() * verbs.length)]}...
    </div>)
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
    const currentWords = useRef({})

    log.log("%crendering reader", "color: red; font-size:1.5rem; font-weight: bold;")

    useEffect(() => {
        log.log("mounted reader")

        ipcRenderer.send("announce/reader/isReady")

        listenForAnotherWindowIsReady('ichi', isIchiReady, setIchiReady)

        ipcRenderer.on("set/ichi/wordData", (event, words: japReader.IchiParsedWordData[], japaneseSentence: string) => {
            // TODO: Somehow add memoization to Japanese sentences, 
            // so that common ones don't have to wait for ichi
            currentWords.current = words;
            setJapaneseSentence(japaneseSentence);
            if (!useDeepL) ipcRenderer.send('append/historyStore/entry', japaneseSentence, null)
        })

        ipcRenderer.on("announce/ichi/connectionError", () => {
            log.log("ichi failed")
            setIchiFailed(true);
        })

        ipcRenderer.on("announce/clipboard/changeDetected", () => {
            log.log("parsing")
            setJapaneseSentence("/parsing/");
        })

        ipcRenderer.on("announce/clipboard/tooManyCharacters", () => {
            log.log("tooManyCharacters")
            setJapaneseSentence("/tooManyCharacters/");
        })


        return () => {
            log.log("unmounted reader")
            ipcRenderer.removeAllListeners("set/ichi/wordData");
            ipcRenderer.removeAllListeners("announce/ichi/connectionError");
            ipcRenderer.removeAllListeners("announce/clipboard/changeDetected");
            ipcRenderer.removeAllListeners("announce/clipboard/tooManyCharacters");
            removeListenerForAnotherWindow('ichi')
        }
    }, [])

    useEffect(()=>{
        ipcRenderer.send("set/reader/open");
    }, [japaneseSentence])

    return (<>
        <DraggableBar/>
        <Message
            isIchiReady={isIchiReady}
            didIchiFail={didIchiFail}
            japaneseSentence={japaneseSentence}
            words={currentWords.current}
        />
  </>)
}