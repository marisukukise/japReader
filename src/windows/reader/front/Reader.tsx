import { ipcRenderer } from "electron";
import { useEffect, useRef, useState } from "react";
import log from 'electron-log/renderer';
import Loader from "@globals/components/Loader/Loader";
import { getSentenceJSX } from "./getSentenceJSX";


const ConnectingToIchiMessage = () => {
    return (<div className='ichi-state-msg connecting'>
        Connecting to <span className="url">https://ichi.moe/</span>...
    </div>)
}

const ConnectedToIchiMessage = () => {
    return (<div className='ichi-state-msg connected'>
        Successfully connected to <span className="url">https://ichi.moe/</span>!
    </div>)
}

const ParseNotificationMessage = () => {
    // Some bloat 4 fun
    var verbs = ['Dissecting', 'Analyzing', 'Loading', 'Inspecting', 'Scrutinizing'];
    return (<div className='parse-notification-msg'>
        <Loader /> {verbs[Math.floor(Math.random() * verbs.length)]}...
    </div>)
}

const ParsedJapaneseSentence = (props: any) => {
    const words = props.words;

    return (<div className='parsed-sentence'>
        {getSentenceJSX(words)}
    </div>)
}


const Outcome = (props: any) => {
    const isIchiReady = props.isIchiReady;
    const japaneseSentence = props.japaneseSentence;
    const words = props.words;

    if (!isIchiReady) return (<ConnectingToIchiMessage />)
    if (japaneseSentence == '') return (<ConnectedToIchiMessage />)
    if (japaneseSentence == '/parsing/') return (<ParseNotificationMessage />)
    return (<ParsedJapaneseSentence words={words} />)
}


export const Reader = () => {
    const [isIchiReady, setIchiReady] = useState(false);
    const [japaneseSentence, setJapaneseSentence] = useState('');
    const currentWords = useRef({})


    useEffect(() => {
        log.log("mounted reader")

        ipcRenderer.send("set/reader/isReady")

        ipcRenderer.on("receiveParsedData", (event, words: any[], japaneseSentence: string) => {
            log.log(words)
            log.log(japaneseSentence)
            currentWords.current = words;
            setJapaneseSentence(japaneseSentence);
        })

        ipcRenderer.on("parseNotification", () => {
            log.log("parsing")
            setJapaneseSentence("/parsing/");
        })

        // Case #1: Reader loaded before Ichi
        ipcRenderer.on("set/ichi/isReady", () => {
            setIchiReady(true);
        })

        // Case #2: Ichi loaded before Reader
        if (!isIchiReady) {
            ipcRenderer.invoke("get/ichi/isReady")
                .then((result: boolean) => { setIchiReady(result); })
                .catch((error: any) => { log.log(error) });
        }

        return () => {
            log.log("unmounted reader")
            ipcRenderer.removeAllListeners("receiveParsedData");
            ipcRenderer.removeAllListeners("parseNotification");
            ipcRenderer.removeAllListeners("set/ichi/isReady");
        }
    }, [])

    return (
        <Outcome
            isIchiReady={isIchiReady}
            japaneseSentence={japaneseSentence}
            words={currentWords.current} />
    )
}