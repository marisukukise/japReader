import React, { useState } from 'react';
import { ChromePicker } from 'react-color';

import { getWindowStore } from '@globals/ts/main/initializeStore';
const windowStore = getWindowStore();

const getPickerColor = (property: string): { r: number, g: number, b: number, a: number } => {
    if (windowStore.has(property)) {
        const rgba_string = windowStore.get(property);
        const rgb_arr = rgba_string
            .slice(rgba_string.indexOf('(') + 1, rgba_string.indexOf(')'))
            .replaceAll(' ', '')
            .split(',').map((e: string) => parseFloat(e));
        return {
            r: rgb_arr[0],
            g: rgb_arr[1],
            b: rgb_arr[2],
            a: rgb_arr[3],
        };
    }
    return { r: 0, g: 0, b: 0, a: 1 };
};

type Props = {
    callback: (color: string) => void,
storeProperty: string,
}
const WindowColorPicker = ({callback, storeProperty}: Props): JSX.Element => {
    const [color, setColor] = useState(getPickerColor(storeProperty));
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