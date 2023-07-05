import { ipcRenderer } from "electron";
import { useEffect, useState } from "react";
import log from 'electron-log/renderer';
import { listenForAnotherWindowIsReady, removeListenerForAnotherWindow } from "@globals/ts/renderer/helpers";
import { TranslatedSentence } from './TranslatedSentence';
import Loader from "@globals/components/Loader/Loader";

const DeepFailedMessage = () => {
    return (<div className='deep-state-msg failed'>
        Failed to connect to <span className="url">https://deepl.com/</span>.<br/>
        Check your internet connection and restart japReader.
    </div>)
}

const ConnectingToDeepMessage = () => {
    return (<div className='deep-state-msg connecting'>
        <Loader /> Connecting to <span className="url">https://deepl.com/</span>...<br/>
        Please wait patiently.
    </div>)
}

const ConnectedToDeepMessage = () => {
    return (<div className='deep-state-msg connected'>
        Successfully connected to <span className="url">https://deepl.com/</span>!
    </div>)
}

const TooManyCharactersCopiedMessage = () => {
    return (<div className='deep-state-msg too-many-characters'>
        Too many characters copied to clipboard. <br/>
        No request has been made to <span className="url">https://deepl.com/</span>. <br/>
        This has been implemented to prevent you from getting banned.
    </div>)
}

const ParseNotificationMessage = () => {
    // Some bloated messages 4 fun
    const verbs = [
        'Translating', 'Transcribing', 'Deciphering', 'Decoding',
        'Transliterating', 'Rendering', 'Transposing', 'Transmutating'
    ];
    return (<div className='parse-notification-msg'>
        <Loader /> {verbs[Math.floor(Math.random() * verbs.length)]}...
    </div>)
}


const Message = (props: any) => {
    const isDeepReady = props.isDeepReady;
    const didDeepFail = props.didDeepFail;
    const translatedSentence = props.translatedSentence;
    const japaneseSentence = props.japaneseSentence;

    if (didDeepFail) return (<DeepFailedMessage />)
    if (!isDeepReady) return (<ConnectingToDeepMessage />)
    if (translatedSentence == '') return (<ConnectedToDeepMessage />)
    if (translatedSentence == '/tooManyCharacters/') return (<TooManyCharactersCopiedMessage />)
    if (translatedSentence == '/parsing/') return (<ParseNotificationMessage />)
    return (<TranslatedSentence japaneseSentence={japaneseSentence} translatedSentence={translatedSentence} />)
}



export const Translation = () => {
    const [isDeepReady, setDeepReady] = useState(false);
    const [didDeepFail, setDeepFailed] = useState(false);
    const [translatedSentence, setTranslatedSentence] = useState('')
    const [japaneseSentence, setJapaneseSentence] = useState('')



    useEffect(() => {
        ipcRenderer.send("announce/translation/isReady")

        listenForAnotherWindowIsReady('deep', isDeepReady, setDeepReady)

        ipcRenderer.on("set/deep/translationText", (event, translatedSentence: string, japaneseSentence: string) => {
            setTranslatedSentence(translatedSentence);
            setJapaneseSentence(japaneseSentence);
        });

        ipcRenderer.on("announce/deep/connectionError", () => {
            log.log("deep failed");
            setDeepFailed(true);
        })


        ipcRenderer.on("announce/clipboard/changeDetected", () => {
            log.log("parsing")
            setTranslatedSentence("/parsing/");
        })

        ipcRenderer.on("announce/clipboard/tooManyCharacters", () => {
            log.log("tooManyCharacters")
            setTranslatedSentence("/tooManyCharacters/");
        })

        return () => {
            removeListenerForAnotherWindow('deep')
            ipcRenderer.removeAllListeners("announce/deep/connectionError");
            ipcRenderer.removeAllListeners("set/deep/translationText");
            ipcRenderer.removeAllListeners("announce/clipboard/changeDetected");
            ipcRenderer.removeAllListeners("announce/clipboard/tooManyCharacters");
        }
    }, [])

    return (<Message
        isDeepReady={isDeepReady}
        didDeepFail={didDeepFail}
        translatedSentence={translatedSentence}
        japaneseSentence={japaneseSentence}
    />
    )
}