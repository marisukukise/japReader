import { ipcRenderer } from "electron";
import { useEffect, useState } from "react";

import log_renderer from 'electron-log/renderer';
import { createScopedLog } from "@globals/ts/main/setupLogging";
const log = createScopedLog(log_renderer, 'dictionary')

import { FuriganaJSX, listenForAnotherWindowIsReady, removeListenerForAnotherWindow } from "@globals/ts/renderer/helpers";
import { DraggableBar } from "@globals/components/DraggableBar/DraggableBar";
import ConfigurationDrawer from '@globals/components/ConfigurationDrawer/ConfigurationDrawer';
import { ConfigurationDrawerSettings } from '@globals/components/ConfigurationDrawer/ConfigurationDrawerSettings/ConfigurationDrawerSettings';

import { Text } from '@geist-ui/core'

const settings = [
    ConfigurationDrawerSettings.open_settings,
    ConfigurationDrawerSettings.dark_mode,
    ConfigurationDrawerSettings.dictionary_background_color_picker,
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

    return (<>
        <DraggableBar />
        <div>
            <div>Stats</div>
            <div>
                <div>Item 1</div>
                <div>Item 2</div>
                <div>Item 3</div>
            </div>
            <div>
                <button>Play audio</button>
            </div>
            <div>
                <button>Add to Anki</button>
            </div>
            <div>
                <button>Seen</button>
                <button>Known</button>
                <button>Ignored</button>
            </div>
            <h1 className={status}><FuriganaJSX kanaOrKanji={dictForm} kana={dictFormReading} /></h1>
            <p dangerouslySetInnerHTML={getHTMLObject(definitions)}></p>
            <h1>LOREM IPSUM</h1>
            <h1>LOREM IPSUM</h1>
            <h1>LOREM IPSUM</h1>
            <h1>LOREM IPSUM</h1>
            <h1>LOREM IPSUM</h1>
            <h1>LOREM IPSUM</h1>
            <h1>LOREM IPSUM</h1>
            <h1>LOREM IPSUM</h1>
            <h1>LOREM IPSUM</h1>
            <h1>LOREM IPSUM</h1>
            <h1>LOREM IPSUM</h1>
            <h1>LOREM IPSUM</h1>
            <h1>LOREM IPSUM</h1>
            <h1>LOREM IPSUM</h1>
            <h1>LOREM IPSUM</h1>
            <h1>LOREM IPSUM</h1>
            <h1>LOREM IPSUM</h1>
            <h1>LOREM IPSUM</h1>
            <h1>LOREM IPSUM</h1>
            <h1>LOREM IPSUM</h1>
            <h1>LOREM IPSUM</h1>
        </div>
        <ConfigurationDrawer settings={settings} />
    </>)
}