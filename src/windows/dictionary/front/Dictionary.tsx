import { ipcRenderer } from "electron";
import { useEffect, useState } from "react";

import log_renderer from 'electron-log/renderer';
import { createScopedLog } from "@globals/ts/main/setupLogging";
const log = createScopedLog(log_renderer, 'dictionary')
import { IPC_CHANNELS, WORD_DATA_STATUSES } from "@globals/ts/main/objects";

import { FuriganaJSX, listenForAnotherWindowIsReady, updateWordStatusStore } from "@globals/ts/renderer/helpers";
import { DraggableBar } from "@globals/components/DraggableBar/DraggableBar";
import ConfigurationDrawer from '@globals/components/ConfigurationDrawer/ConfigurationDrawer';
import { ConfigurationDrawerSettings } from '@globals/components/ConfigurationDrawer/ConfigurationDrawerSettings/ConfigurationDrawerSettings';

import { Text, Grid, Button, ButtonGroup, Spacer } from '@geist-ui/core'

const settings = [
    ConfigurationDrawerSettings.open_settings,
    ConfigurationDrawerSettings.dictionary_background_color_picker,
    ConfigurationDrawerSettings.dictionary_font_color_picker,
    ConfigurationDrawerSettings.dictionary_on_top_button,
]


export const Dictionary = () => {
    const [isReaderReady, setReaderReady] = useState(false);
    const [status, setStatus] = useState("")
    const [dictForm, setDictForm] = useState("")
    const [dictFormReading, setDictFormReading] = useState("")
    const [definitions, setDefinitions] = useState("")



    useEffect(() => {
        log.log("mounted dictionary")

        ipcRenderer.send(IPC_CHANNELS.DICTIONARY.ANNOUNCE.IS_READY)

        ipcRenderer.on(IPC_CHANNELS.READER.ANNOUNCE.EXTENDED_WORDS_DATA, (event, extendedWordData: japReader.ExtendedWordData) => {
            setStatus(extendedWordData.status);
            setDictForm(extendedWordData.dictForm);
            setDictFormReading(extendedWordData.dictFormReading);
            setDefinitions(extendedWordData.definitions);
        })

        listenForAnotherWindowIsReady(IPC_CHANNELS.READER, 
            isReaderReady, setReaderReady);

        return () => {
            log.log("unmounted reader")
            ipcRenderer.removeAllListeners(IPC_CHANNELS.READER.ANNOUNCE.IS_READY);
            ipcRenderer.removeAllListeners(IPC_CHANNELS.READER.ANNOUNCE.EXTENDED_WORDS_DATA);
        }
    }, [])

    const getHTMLObject = (html_code: string) => {
        return { __html: html_code }
    }

    const setSeenStatus = () => {
        updateWordStatusStore(dictForm, WORD_DATA_STATUSES.SEEN)
        setStatus(WORD_DATA_STATUSES.SEEN)

    }
    const setKnownStatus = () => {
        updateWordStatusStore(dictForm, WORD_DATA_STATUSES.KNOWN)
        setStatus(WORD_DATA_STATUSES.KNOWN)
    }
    const setIgnoredStatus = () => {
        updateWordStatusStore(dictForm, WORD_DATA_STATUSES.IGNORED)
        setStatus(WORD_DATA_STATUSES.IGNORED)
    }

    return (<>
        <DraggableBar />
        <div>
            <Grid.Container gap={2} justify="space-between" height="100px">
                <Grid xs={6}>stat1</Grid>
                <Grid xs={6}>stat2</Grid>
            </Grid.Container>
            <Grid.Container gap={2} justify="center" height="100px">
                <Grid xs={6}>gr1</Grid>
                <Grid xs={6}>gr2</Grid>
                <Grid xs={6}>gr3</Grid>
            </Grid.Container>

            <div>
                <Button>Play audio</Button>
            </div>
            <div>
                <Button>Add to Anki</Button>
            </div>

            <ButtonGroup>
                <Button onClick={setSeenStatus}>Seen</Button>
                <Button onClick={setKnownStatus}>Known</Button>
                <Button onClick={setIgnoredStatus}>Ignored</Button>
            </ButtonGroup>
            <h1 className={status}><FuriganaJSX kanaOrKanji={dictForm} kana={dictFormReading} /></h1>
            <p dangerouslySetInnerHTML={getHTMLObject(definitions)}></p>
        </div>
        <ConfigurationDrawer settings={settings} />
    </>)
}