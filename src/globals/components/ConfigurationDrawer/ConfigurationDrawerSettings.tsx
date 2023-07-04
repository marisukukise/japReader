import MailIcon from '@mui/icons-material/Mail';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import log from 'electron-log/renderer';

export const ConfigurationDrawerSettings: japReader.ConfigurationDrawerSetting = {
    "open_settings": {
        label: "設定をあける",
        icon: <MailIcon />,
        fn: () => {
            log.log("opened-settings")
        }
    },
    "dark_mode": {
        label: "夜モード",
        icon: <MailIcon />,
        fn: () => {
            log.log("toggled-dark-mode")
        }
    }
}