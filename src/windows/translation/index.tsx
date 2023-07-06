// This is the React file of the reader window.
// It is responsible for inserting DOM structure into the main element in the index.html file.

import './local.scss';
import '@globals/scss/global.scss';
import { Translation } from './front/Translation';
import { GeistProvider, CssBaseline } from '@geist-ui/core'

import { createRoot } from 'react-dom/client';
const container = document.getElementById('translation');
const root = createRoot(container!);
root.render(<GeistProvider>
    <CssBaseline />
    <Translation />
</GeistProvider>);