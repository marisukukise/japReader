import { ipcRenderer } from "electron";
import { useEffect, useState } from "react";
import log from 'electron-log/renderer';

export const Translation = () => {
    const [isDeepReady, setDeepReady] = useState(false);

    // Case #1: Translation loaded before DeepL
    ipcRenderer.on("set/deep/isReady", (event: any) => {
        setDeepReady(true);
    })

    useEffect(()=>{
        ipcRenderer.send("set/translation/isReady")

        // Case #2: DeepL loaded before Translation
        if (!isDeepReady) {
            ipcRenderer.invoke("get/deep/isReady")
                .then((result: boolean) => { setDeepReady(result); })
                .catch((error: any) => { log.log(error) });
        }
    },[])

    return (<>
        <h1>{isDeepReady ?
            <>Successfully connected to deepl.com</> :
            <>Connecting to deepl.com...</>}</h1>
    </>)
}