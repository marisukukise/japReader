import { ipcRenderer } from "electron";
import { useEffect, useState } from "react";
import log from 'electron-log/renderer';

export const Reader = () => {
    const [isIchiReady, setIchiReady] = useState(false);

    // Case #1: Reader loaded before Ichi
    ipcRenderer.on("set/ichi/isReady", (event: any) => {
        setIchiReady(true);
    })

    useEffect(() => {
        ipcRenderer.send("set/reader/isReady")

        // Case #2: Ichi loaded before Reader
        if (!isIchiReady) {
            ipcRenderer.invoke("get/ichi/isReady")
                .then((result: boolean) => { setIchiReady(result); })
                .catch((error: any) => { log.log(error) });
        }
    }, [])

    return (<>
        <h1>{isIchiReady ?
            <>Successfully connected to ichi.moe</> :
            <>Connecting to ichi.moe...</>}</h1>
    </>)
}