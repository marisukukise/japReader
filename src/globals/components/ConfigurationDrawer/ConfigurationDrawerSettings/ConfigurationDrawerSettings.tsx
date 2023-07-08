import OnTopToggleButton from './OnTopToggleButton';

import { IPC_CHANNELS } from "@globals/ts/main/objects";

import Settings from '@geist-ui/icons/settings';
import Moon from '@geist-ui/icons/moon'
import ColorPickerButton from './ColorPickerButton';
import { ipcRenderer } from 'electron';
import { changeBackgroundColorVariable, changeFontColor } from '@globals/ts/renderer/helpers';

const shownWindows = ['reader', 'translation', 'dictionary', 'settings']

const createSettingsForEachWindow = () => {
    const obj: japReader.ConfigurationDrawerSetting = {}
    shownWindows.forEach((windowName: string) => {
        // @ts-expect-error The window names are limited to what exists in the IPC_CHANNELS object
        const ipcBase = IPC_CHANNELS[`${windowName.toUpperCase()}`]

        obj[`${windowName}_background_color_picker`] = <ColorPickerButton
            callback={(color: string) => {
                ipcRenderer.send(ipcBase.SET.BACKGROUND_COLOR, color)
                changeBackgroundColorVariable(windowName, color)
            }}
            title={windowName[0].toUpperCase() + windowName.slice(1)}
            subtitle="Set background color"
            buttonText="Set background color"
        />

        obj[`${windowName}_font_color_picker`] = <ColorPickerButton
            callback={(color: string) => {
                changeFontColor(windowName, color);
            }}
            title={windowName[0].toUpperCase() + windowName.slice(1)}
            subtitle="Set font color"
            buttonText="Set font color"
        />

        obj[`${windowName}_on_top_button`] = <OnTopToggleButton
            ipcChannel={ipcBase.SET.ALWAYS_ON_TOP}
        />
    })
    return obj
}


export const ConfigurationDrawerSettings: japReader.ConfigurationDrawerSetting = {
    "open_settings": <Settings />,
    "dark_mode": <Moon />,
    ...createSettingsForEachWindow()
}