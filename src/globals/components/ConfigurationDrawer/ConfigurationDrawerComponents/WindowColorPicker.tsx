import React, { useState } from 'react';
import { ChromePicker } from 'react-color';

type Props = {
    callback: (color: string) => void 
}
const WindowColorPicker = ({callback}: Props): JSX.Element => {
    const [color, setColor] = useState({ r: 255, g: 255, b: 255, a: 1 });
    const onChange = (color: any) => {
        setColor(color.rgb);
    };
    const onChangeComplete = (color: any) => {
        const r = color.rgb.r;
        const g = color.rgb.g;
        const b = color.rgb.b;
        const a = color.rgb.a;

        const COLOR = `rgba(${r}, ${g}, ${b}, ${a == 1 ? 0.999 : a})`;
        callback(COLOR);
    };

    return (<>
        <ChromePicker color={color} onChange={onChange} onChangeComplete={onChangeComplete}/>
    </>);
};

export default WindowColorPicker;