import { ipcRenderer } from "electron";
import { useEffect, useRef, useState } from "react";
import { FuriganaJSX, listenForAnotherWindowIsReady, removeListenerForAnotherWindow } from "@globals/ts/renderer/helpers";
import log from 'electron-log/renderer';
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from '@mui/material/Button';
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

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

        listenForAnotherWindowIsReady('reader', isReaderReady, setReaderReady)

        return () => {
            log.log("unmounted reader")
            removeListenerForAnotherWindow('reader')
            ipcRenderer.removeAllListeners("announce/reader/isReady");
        }
    }, [])

    const getHTMLObject = (html_code: string) => {
        return { __html: html_code }
    }

    return (dictForm ? <Box sx={{height: "100%"}}>
        <div>Stats</div>
        <Stack direction="row" spacing={2}>
            <div>Item 1</div>
            <div>Item 2</div>
            <div>Item 3</div>
        </Stack>
        <div>
            <Button variant="outlined">Play audio</Button>
        </div>
        <div>
            <Button variant="outlined">Add to Anki</Button>
        </div>
        <ButtonGroup variant="outlined" aria-label="outlined primary button group">
            <Button>Seen</Button>
            <Button>Known</Button>
            <Button>Ignored</Button>
        </ButtonGroup>
        <h1 className={status}><FuriganaJSX  kanaOrKanji={dictForm} kana={dictFormReading} /></h1>
        <p dangerouslySetInnerHTML={getHTMLObject(definitions)}></p>
    </Box>
    : <Box sx={{height: "100%"}}>
        <Skeleton height="5%"/>
        <Skeleton height="25%" />
        <Skeleton height="10%" />
        <Skeleton height="60%" />
    </Box>)
}