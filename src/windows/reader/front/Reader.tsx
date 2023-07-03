import { ipcRenderer } from "electron";
import { useEffect, useRef, useState } from "react";
import log from 'electron-log/renderer';
import Loader from "@globals/components/Loader/Loader";
import { Sentence } from "./getSentenceJSX";


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

const Message = (props: any) => {
    const isIchiReady = props.isIchiReady;
    const japaneseSentence = props.japaneseSentence;
    const words = props.words;

    if (!isIchiReady) return (<ConnectingToIchiMessage />)
    if (japaneseSentence == '') return (<ConnectedToIchiMessage />)
    if (japaneseSentence == '/parsing/') return (<ParseNotificationMessage />)
    return (<Sentence words={words} />)
}


export const Reader = () => {
    const [isIchiReady, setIchiReady] = useState(false);
    const [japaneseSentence, setJapaneseSentence] = useState('');
    const currentWords = useRef({})


    useEffect(() => {
        log.log("mounted reader")

        ipcRenderer.send("announce/reader/isReady")

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
        ipcRenderer.on("announce/ichi/isReady", () => {
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
            ipcRenderer.removeAllListeners("announce/ichi/isReady");
        }
    }, [])

    return (
        <Message
            isIchiReady={isIchiReady}
            japaneseSentence={japaneseSentence}
            words={currentWords.current} 
        />
    )
}