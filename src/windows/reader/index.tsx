// This is the React file of the reader window.
// It is responsible for inserting DOM structure into the main element in the index.html file.

import './local.scss';
import '@globals/scss/global.scss';
import { Reader } from './front/Reader';
import log from 'electron-log/renderer';

import ConfigurationDrawer from '@globals/components/ConfigurationDrawer/ConfigurationDrawer';
import { ConfigurationDrawerSettings } from '@globals/components/ConfigurationDrawer/ConfigurationDrawerSettings';

const settings = [
    ConfigurationDrawerSettings.open_settings,
    ConfigurationDrawerSettings.dark_mode,
]

import { createRoot } from 'react-dom/client';
const container = document.getElementById('reader');
const root = createRoot(container!);
root.render(<>
    <Reader />
    <ConfigurationDrawer settings={settings} />
</>);