import { Select } from '@geist-ui/core';
import { IPC_CHANNELS } from '@globals/ts/main/objects';
import { ipcRenderer } from 'electron';
import { useEffect, useState } from 'react';


type Props = {
    callback: (fontPath: string) => void,
}
export const FontFamilySelector = () => {
    const handler = (filename: string) => {
        if (filename === 'default') return;

        // TODO: Load a custom font somehow
    };

    const [fontList, setFontList] = useState<japReader.FontInfo[]>([]);
    const [disabled, setDisabled] = useState(false);

    const defaultFont = 'NotoSansJP';

    useEffect(() => {
        setDisabled(true);
        ipcRenderer.invoke(IPC_CHANNELS.MAIN.REQUEST.FONT_LIST)
            .then(data => {
                setFontList(data);
                setDisabled(false);
            });
    }, []);

    return (
        <Select disabled={disabled} placeholder="Choose one" onChange={handler} initialValue="default">
            <Select.Option value="default">{defaultFont} (Default)</Select.Option>
            <Select.Option divider />
            {fontList.map((entry: japReader.FontInfo, index: number) => {
                console.log(entry);
                return <Select.Option
                    key={index}
                    value={entry.filename}
                >
                    {entry.filename}
                </Select.Option>;
            })}
        </Select>
    );
};