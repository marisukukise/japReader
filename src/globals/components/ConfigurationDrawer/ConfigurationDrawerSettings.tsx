import MailIcon from '@mui/icons-material/Mail';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import log from 'electron-log/renderer';
import { ipcRenderer } from 'electron';

export const ConfigurationDrawerSettings: japReader.ConfigurationDrawerSetting = {
    "open_settings": <MailIcon/>,
    "dark_mode": <AcUnitIcon/>
}