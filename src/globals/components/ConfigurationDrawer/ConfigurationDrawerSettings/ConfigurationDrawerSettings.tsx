import { WindowColorPicker } from './WindowColorPicker';
import OnTopToggleButton from './OnTopToggleButton';
import { IPC_CHANNELS } from "@globals/ts/main/objects";

import Settings from '@geist-ui/icons/settings';
import Moon from '@geist-ui/icons/moon'

export const ConfigurationDrawerSettings: japReader.ConfigurationDrawerSetting = {
    "open_settings": <Settings/>,
    "dark_mode": <Moon/>,
    "reader_background_color_picker": <WindowColorPicker ipcChannel={IPC_CHANNELS.READER.SET.BACKGROUND_COLOR}/>,
    "translation_background_color_picker": <WindowColorPicker ipcChannel={IPC_CHANNELS.TRANSLATION.SET.BACKGROUND_COLOR}/>,
    "dictionary_background_color_picker": <WindowColorPicker ipcChannel={IPC_CHANNELS.DICTIONARY.SET.BACKGROUND_COLOR}/>,
    "reader_on_top_button": <OnTopToggleButton ipcChannel={IPC_CHANNELS.READER.SET.ALWAYS_ON_TOP}/>,
    "translation_on_top_button": <OnTopToggleButton ipcChannel={IPC_CHANNELS.TRANSLATION.SET.ALWAYS_ON_TOP}/>,
    "dictionary_on_top_button": <OnTopToggleButton ipcChannel={IPC_CHANNELS.DICTIONARY.SET.ALWAYS_ON_TOP}/>,
}