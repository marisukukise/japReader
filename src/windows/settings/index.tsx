// This is the React file of the reader window.
// It is responsible for inserting DOM structure into the main element in the index.html file.

import log from 'electron-log/renderer';
log.silly('Initialized the settings process');

import './local.scss';
import '../../globals/scss/global.scss';
import { Settings } from './front/Settings';

import { createRoot } from 'react-dom/client';
const container = document.getElementById('settings');
const root = createRoot(container!);
root.render(<Settings />);