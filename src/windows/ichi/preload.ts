// This is the preload script file of the reader window.
// Learn more: https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts


const { ipcRenderer, contextBridge } = require('electron');

// The renderer process does NOT have access to Electron API
// So the methods that need Electron API must be exposed here

const ICHI_API = {
}

contextBridge.exposeInMainWorld("api", ICHI_API);