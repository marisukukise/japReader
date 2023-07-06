// This is the React file of the reader window.
// It is responsible for inserting DOM structure into the main element in the index.html file.

import './local.scss';
import '@globals/scss/global.scss';
import { Settings } from './front/Settings';


import ConfigurationDrawer from '@globals/components/ConfigurationDrawer/ConfigurationDrawer';

import { ConfigurationDrawerSettings } from '@globals/components/ConfigurationDrawer/ConfigurationDrawerSettings/ConfigurationDrawerSettings';

const settings = [
    ConfigurationDrawerSettings.open_settings,
    ConfigurationDrawerSettings.dark_mode,
]


import { createRoot } from 'react-dom/client';
const container = document.getElementById('settings');
const root = createRoot(container!);
root.render(<>
    <Settings />
    <ConfigurationDrawer settings={settings} />
</>);