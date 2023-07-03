// This is the React file of the reader window.
// It is responsible for inserting DOM structure into the main element in the index.html file.

import './local.scss';
import '@globals/scss/global.scss';
import { Translation } from './front/Translation';
import log from 'electron-log/renderer';

import MailIcon from '@mui/icons-material/Mail';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ConfigurationDrawer from '@globals/components/ConfigurationDrawer/ConfigurationDrawer';

const settings = [
    {
        key: "open-settings",
        label: "設定をあける",
        icon: <MailIcon />,
        fn: () => {
            log.log("opened-settings")
        }
    },
    {
        key: "dark-mode",
        label: "夜モード",
        icon: <AcUnitIcon />,
        fn: () => {
            log.log("toggled-dark-mode")
        }
    },
]


import { createRoot } from 'react-dom/client';
const container = document.getElementById('translation');
const root = createRoot(container!);
root.render(<>
    <Translation />
    <ConfigurationDrawer settings={settings} />
</>);