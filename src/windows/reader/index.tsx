// This is the React file of the reader window.
// It is responsible for inserting DOM structure into the main element in the index.html file.

import { fontSizeEventListener, initializeWindowSettingsFromStore } from '@globals/ts/renderer/helpers';
fontSizeEventListener('reader');
initializeWindowSettingsFromStore('reader');

import './local.scss';

import { Reader } from './front/Reader';
import { GeistProvider, CssBaseline } from '@geist-ui/core';

import { createRoot } from 'react-dom/client';
const container = document.getElementById('reader');
const root = createRoot(container!);
root.render(<GeistProvider>
    <CssBaseline />
    <Reader />
</GeistProvider>);