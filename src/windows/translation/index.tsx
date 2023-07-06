// This is the React file of the reader window.
// It is responsible for inserting DOM structure into the main element in the index.html file.

import './local.scss';
import '@globals/scss/global.scss';
import { Translation } from './front/Translation';

import ConfigurationDrawer from '@globals/components/ConfigurationDrawer/ConfigurationDrawer';

import { ConfigurationDrawerSettings } from '@globals/components/ConfigurationDrawer/ConfigurationDrawerSettings/ConfigurationDrawerSettings';

const settings = [
    ConfigurationDrawerSettings.open_settings,
    ConfigurationDrawerSettings.dark_mode,
    ConfigurationDrawerSettings.window_background_color,
]




import { createRoot } from 'react-dom/client';
const container = document.getElementById('translation');
const root = createRoot(container!);
root.render(<>
    <Translation />
    <ConfigurationDrawer settings={settings} />
</>);