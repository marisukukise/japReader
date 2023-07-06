import { ipcRenderer } from "electron";
import React, { useState } from "react"
import { ChromePicker, SketchPicker } from "react-color"

export const WindowColorPicker = ({ipcChannel}: {ipcChannel: string}) => {
    const [color, setColor] = useState({ r: 255, g: 255, b: 255, a: 1 });
    const onChange = (color: any) => {
        setColor(color.rgb);
    }
    const onChangeComplete = (color: any) => {
        const r = color.rgb.r;
        const g = color.rgb.g;
        const b = color.rgb.b;
        const a = color.rgb.a;

        const COLOR = `rgba(${r}, ${g}, ${b}, ${a == 1 ? 0.999 : a})`;
        ipcRenderer.send(ipcChannel, COLOR);
    }


    return (<>
        <ChromePicker color={color} onChange={onChange} onChangeComplete={onChangeComplete}/>
    </>)
}