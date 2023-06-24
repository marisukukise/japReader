// This is the React file of the reader window.
// It's responsible for inserting DOM structure into the #app element in the index.html file.

import { createRoot } from 'react-dom/client';
const container = document.getElementById('app');
const root = createRoot(container!);
root.render(<h2>Hello from React!</h2>);