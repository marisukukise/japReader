import { ipcRenderer } from "electron";
import { useEffect, useState } from "react";
import log from 'electron-log/renderer';

export const Dictionary = () => {
    const [isReaderReady, setReaderReady] = useState(false);

    // Case #1: Dictionary loaded before Reader
    ipcRenderer.on("announce/reader/isReady", (event: any) => {
        setReaderReady(true);
    })

    useEffect(()=>{
        ipcRenderer.send("announce/dictionary/isReady")

        // Case #2: Raeder loaded before Dictionary
        if (!isReaderReady) {
            ipcRenderer.invoke("get/reader/isReady")
                .then((result: boolean) => { setReaderReady(result); })
                .catch((error: any) => { log.log(error) });
        }
    },[])

    return (<>
        <h1>{isReaderReady ?
            <>Reader is ready, can continue...</> :
            <>Waiting for reader...</>}</h1>
    </>)
}