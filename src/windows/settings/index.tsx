// This is the React file of the reader window.
// It is responsible for inserting DOM structure into the main element in the index.html file.

import { IPC_CHANNELS } from '@root/src/globals/ts/other/objects';
import { initializeWindowSettings } from '@root/src/globals/ts/helpers/rendererHelpers';
initializeWindowSettings('settings', IPC_CHANNELS.SETTINGS);

import './local.scss';

import { Settings } from './front/Settings';
import { GeistProvider, CssBaseline } from '@geist-ui/core';

import { createRoot } from 'react-dom/client';
const container = document.getElementById('settings');
const root = createRoot(container!);
root.render(<GeistProvider>
    <CssBaseline />
    <Settings />
</GeistProvider>);