// This is the React file of the reader window.
// It is responsible for inserting DOM structure into the main element in the index.html file.

import { dialog } from 'electron';

import log from 'electron-log/renderer';
log.silly('Log from the reader process');
log.silly("reader sandboxed?",process.sandboxed)




import './local.scss';
import '../../globals/scss/global.scss';
import { Reader } from './front/Reader';

import { createRoot } from 'react-dom/client';
const container = document.getElementById('reader');
const root = createRoot(container!);
root.render(<Reader />);