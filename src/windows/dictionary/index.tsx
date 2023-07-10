// This is the React file of the reader window.
// It is responsible for inserting DOM structure into the main element in the index.html file.

import { IPC_CHANNELS } from '@globals/ts/main/objects';
import { initializeWindowSettings } from '@globals/ts/renderer/helpers';
initializeWindowSettings('dictionary', IPC_CHANNELS.DICTIONARY);

import './local.scss';

import { Dictionary } from './front/Dictionary';
import { GeistProvider, CssBaseline } from '@geist-ui/core';

import { createRoot } from 'react-dom/client';
const container = document.getElementById('dictionary');
const root = createRoot(container!);
root.render(<GeistProvider>
    <CssBaseline />
    <Dictionary />
</GeistProvider>);