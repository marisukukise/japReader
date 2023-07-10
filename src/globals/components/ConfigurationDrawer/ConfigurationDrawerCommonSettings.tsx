import OnTopToggleButton from './ConfigurationDrawerComponents/OnTopToggleButton';


import ColorPickerButton from './ConfigurationDrawerComponents/ColorPickerButton';
import { ipcRenderer } from 'electron';
import { changeBackgroundColorVariable, changeFontColor } from '@globals/ts/renderer/helpers';
import ZoomButtonGroup from './ConfigurationDrawerComponents/ZoomButtonGroup';

// TODO: Add font zoom options to each window
// TODO: Add center text option to reader
// TODO: Add furigana option to reader
// TODO: Add Japanese text option to translation window

type Props = {
    windowName: string,
    ipcBase: any
}
export const ConfigurationDrawerCommonSettings = ({windowName, ipcBase}: Props): JSX.Element => {
    return <>
        <ColorPickerButton
            callback={(color: string) => {
                ipcRenderer.send(ipcBase.SET.BACKGROUND_COLOR, color);
                changeBackgroundColorVariable(windowName, color);
            }}
            title={windowName[0].toUpperCase() + windowName.slice(1)}
            subtitle="Set background color"
            buttonText="Set background color"
        />
        <ColorPickerButton
            callback={(color: string) => {
                changeFontColor(windowName, color);
            }}
            title={windowName[0].toUpperCase() + windowName.slice(1)}
            subtitle="Set font color"
            buttonText="Set font color"
        />
        <ZoomButtonGroup
            windowName={windowName}
        />
        <OnTopToggleButton
            ipcChannel={ipcBase.SET.ALWAYS_ON_TOP}
        />
    </>;
};