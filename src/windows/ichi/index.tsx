// This is the React file of the reader window.
// It is responsible for inserting DOM structure into the main element in the index.html file.

import './style.scss';
import { Ichi } from './front/Ichi';

import { createRoot } from 'react-dom/client';
const container = document.getElementById('ichi');
const root = createRoot(container!);
root.render(<Ichi />);