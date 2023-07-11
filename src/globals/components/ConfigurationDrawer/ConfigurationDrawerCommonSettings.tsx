import OnTopToggleButton from './ConfigurationDrawerComponents/OnTopToggleButton';

import ColorPickerButton from './ConfigurationDrawerComponents/ColorPickerButton';
import { ipcRenderer } from 'electron';
import { changeBackgroundColorVariable, changeFontColor } from '@globals/ts/renderer/helpers';
import ZoomButtonGroup from './ConfigurationDrawerComponents/ZoomButtonGroup';
import { getWindowStore } from '@globals/ts/main/initializeStore';

const windowStore = getWindowStore();

type Props = {
    windowName: string,
    ipcBase: any
}



export const ConfigurationDrawerCommonSettings = ({ windowName, ipcBase }: Props): JSX.Element => {
    return <>
        <ColorPickerButton
            callback={(color: string) => {
                ipcRenderer.send(ipcBase.SET.BACKGROUND_COLOR, color);
                changeBackgroundColorVariable(windowName, color);
            }}
            storeProperty={`${windowName}.backgroundColor`}
            title={windowName[0].toUpperCase() + windowName.slice(1)}
            subtitle="Set background color"
            buttonText="Set background color"
        />
        <ColorPickerButton
            callback={(color: string) => {
                changeFontColor(windowName, color);
            }}
            storeProperty={`${windowName}.additional.fontColor`}
            title={windowName[0].toUpperCase() + windowName.slice(1)}
            subtitle="Set font color"
            buttonText="Set font color"
        />
        <ZoomButtonGroup
            windowName={windowName}
        />
        <OnTopToggleButton
            callback={(value: boolean) => {
                ipcRenderer.send(ipcBase.SET.ALWAYS_ON_TOP, value);
            }}
            initialChecked={windowStore.get(`${windowName}.additional.alwaysOnTop`, false)}
        />
    </>;
};