import { ipcRenderer } from "electron";
import { useEffect, useId, useState } from "react";

export const Settings = () => {
    const [colorValue, setColorValue] = useState('#000000')
    const [rangeValue, setRangeValue] = useState(255)
    const colorId = useId();
    const rangeId = useId();


    function toHex(d: number) {
        return ("0" + (Number(d).toString(16))).slice(-2).toLowerCase()
    }

    useEffect(() => {
        const argb = '#' + toHex(rangeValue) + colorValue.slice(1)
        ipcRenderer.send('set/translation/windowBackgroundColor', argb);
    }, [colorValue, rangeValue])
    useEffect(() => {
        ipcRenderer.send("announce/settings/isReady")
    }, [])

    return (<>
        <input type="color" id={colorId} onChange={(event) => setColorValue(event.target.value)} />
        <input type="range" min="0" max="254" step="1" value={rangeValue.toString()} id={rangeId} onChange={(event) => setRangeValue(parseInt(event.target.value))} />
        <span>{colorValue}</span>
        <h1>Welcome from the Settings window</h1>
    </>)
}