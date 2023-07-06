import MailIcon from '@mui/icons-material/Mail';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import { WindowColorPicker } from './WindowColorPicker';
import log from 'electron-log/renderer';
import { ipcRenderer } from 'electron';
import OnTopToggleButton from './OnTopToggleButton';

export const ConfigurationDrawerSettings: japReader.ConfigurationDrawerSetting = {
    "open_settings": <MailIcon/>,
    "dark_mode": <AcUnitIcon/>,
    "reader_background_color_picker": <WindowColorPicker ipcChannel="set/reader/windowBackgroundColor"/>,
    "translation_background_color_picker": <WindowColorPicker ipcChannel="set/translation/windowBackgroundColor"/>,
    "dictionary_background_color_picker": <WindowColorPicker ipcChannel="set/dictionary/windowBackgroundColor"/>,
    "reader_on_top_button": <OnTopToggleButton ipcChannel="set/reader/onTop"/>,
    "translation_on_top_button": <OnTopToggleButton ipcChannel="set/translation/onTop"/>,
    "dictionary_on_top_button": <OnTopToggleButton ipcChannel="set/dictionary/onTop"/>,
}