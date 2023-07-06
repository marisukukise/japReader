// This is the React file of the reader window.
// It is responsible for inserting DOM structure into the main element in the index.html file.


import './local.scss';
import '@globals/scss/global.scss';
import { Dictionary } from './front/Dictionary';

import ConfigurationDrawer from '@globals/components/ConfigurationDrawer/ConfigurationDrawer';

import { ConfigurationDrawerSettings } from '@globals/components/ConfigurationDrawer/ConfigurationDrawerSettings/ConfigurationDrawerSettings';

const settings = [
    ConfigurationDrawerSettings.open_settings,
    ConfigurationDrawerSettings.dark_mode,
]


import { createRoot } from 'react-dom/client';
const container = document.getElementById('dictionary');
const root = createRoot(container!);
root.render(<>
    <Dictionary />
    <ConfigurationDrawer settings={settings} />
</>);