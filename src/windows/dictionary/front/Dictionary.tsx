import { ipcRenderer } from "electron";
import { useEffect, useRef, useState } from "react";
import { FuriganaJSX } from "@globals/ts/renderer/helpers";
import log from 'electron-log/renderer';
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from '@mui/material/Button';

export const Dictionary = () => {
    const [isReaderReady, setReaderReady] = useState(false);
    const [status, setStatus] = useState("")
    const [dictForm, setDictForm] = useState("")
    const [dictFormReading, setDictFormReading] = useState("")
    const [definitions, setDefinitions] = useState("")


    useEffect(() => {
        log.log("mounted dictionary")

        ipcRenderer.send("announce/dictionary/isReady")

        ipcRenderer.on("set/reader/extendedWordData", (event, extendedWordData: japReader.ExtendedWordData) => {
            setStatus(extendedWordData.status);
            setDictForm(extendedWordData.dictForm);
            setDictFormReading(extendedWordData.dictFormReading);
            setDefinitions(extendedWordData.definitions);
        })

        // Case #1: Dictionary loaded before Reader
        ipcRenderer.on("announce/reader/isReady", () => {
            setReaderReady(true);
        })

        // Case #2: Raeder loaded before Dictionary
        if (!isReaderReady) {
            ipcRenderer.invoke("get/reader/isReady")
                .then((result: boolean) => { setReaderReady(result); })
                .catch((error: any) => { log.log(error) });
        }

        return () => {
            log.log("unmounted reader")
            ipcRenderer.removeAllListeners("set/reader/extendedWordData");
            ipcRenderer.removeAllListeners("announce/reader/isReady");
        }
    }, [])

    const getHTMLObject = (html_code: string) => {
        return { __html: html_code }
    }

    console.log("rendered")
    return (<>
    <div>
    <Button variant="outlined">Outlined</Button>
    </div>
    <div>
    <Button variant="outlined">Outlined</Button>
    </div>
        <ButtonGroup variant="outlined" aria-label="outlined primary button group">
            <Button>One</Button>
            <Button>Two</Button>
            <Button>Three</Button>
        </ButtonGroup>
        <h1><FuriganaJSX kanaOrKanji={dictForm} kana={dictFormReading} /></h1>
        <h4>{status}</h4>
        <p dangerouslySetInnerHTML={getHTMLObject(definitions)}></p>
    </>)
}