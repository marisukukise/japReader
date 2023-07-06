import { WindowColorPicker } from './WindowColorPicker';
import OnTopToggleButton from './OnTopToggleButton';

import Settings from '@geist-ui/icons/settings';
import Moon from '@geist-ui/icons/moon'

export const ConfigurationDrawerSettings: japReader.ConfigurationDrawerSetting = {
    "open_settings": <Settings/>,
    "dark_mode": <Moon/>,
    "reader_background_color_picker": <WindowColorPicker ipcChannel="set/reader/windowBackgroundColor"/>,
    "translation_background_color_picker": <WindowColorPicker ipcChannel="set/translation/windowBackgroundColor"/>,
    "dictionary_background_color_picker": <WindowColorPicker ipcChannel="set/dictionary/windowBackgroundColor"/>,
    "reader_on_top_button": <OnTopToggleButton ipcChannel="set/reader/onTop"/>,
    "translation_on_top_button": <OnTopToggleButton ipcChannel="set/translation/onTop"/>,
    "dictionary_on_top_button": <OnTopToggleButton ipcChannel="set/dictionary/onTop"/>,
}