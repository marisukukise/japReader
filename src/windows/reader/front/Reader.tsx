import { ipcRenderer } from "electron";
import { useEffect, useRef, useState } from "react";
import log from 'electron-log/renderer';
import Loader from "@globals/components/Loader/Loader";
import { Sentence } from "./Sentence";



const IchiFailedMessage = () => {
    return (<div className='ichi-state-msg connecting'>
        Failed to connect to <span className="url">https://ichi.moe/</span>.<br/>
        Check your internet connection and restart japReader.
    </div>)
}

const ConnectingToIchiMessage = () => {
    return (<div className='ichi-state-msg connecting'>
        <Loader /> Connecting to <span className="url">https://ichi.moe/</span>...<br/>
        Please wait patiently.
    </div>)
}

const ConnectedToIchiMessage = () => {
    return (<div className='ichi-state-msg connected'>
        Successfully connected to <span className="url">https://ichi.moe/</span>!
    </div>)
}

const ParseNotificationMessage = () => {
    // Some bloated messages 4 fun
    var verbs = [
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
    if (japaneseSentence == '/parsing/') return (<ParseNotificationMessage />)
    return (<Sentence words={words} />)
}


export const Reader = () => {
    const [isIchiReady, setIchiReady] = useState(false);
    const [didIchiFail, setIchiFailed] = useState(false);
    const [japaneseSentence, setJapaneseSentence] = useState('');
    const currentWords = useRef({})

    const getSentenceData = (words: japReader.IchiParsedWordData[], japaneseSentence: string) => {

    }

    useEffect(() => {
        log.log("mounted reader")

        ipcRenderer.send("announce/reader/isReady")

        ipcRenderer.on("set/ichi/wordData", (event, words: japReader.IchiParsedWordData[], japaneseSentence: string) => {
            // TODO: Somehow add memoization to Japanese sentences, 
            // so that common ones don't have to wait for ichi
            currentWords.current = words;
            setJapaneseSentence(japaneseSentence);
        })

        ipcRenderer.on("announce/ichi/connectionError", () => {
            log.log("ichi failed")
            setIchiFailed(true);
        })

        ipcRenderer.on("announce/clipboard/changeDetected", () => {
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
            ipcRenderer.removeAllListeners("set/ichi/wordData");
            ipcRenderer.removeAllListeners("announce/ichi/connectionError");
            ipcRenderer.removeAllListeners("announce/clipboard/changeDetected");
            ipcRenderer.removeAllListeners("announce/ichi/isReady");
        }
    }, [])

    return (
        <Message
            isIchiReady={isIchiReady}
            didIchiFail={didIchiFail}
            japaneseSentence={japaneseSentence}
            words={currentWords.current} 
        />
    )
}