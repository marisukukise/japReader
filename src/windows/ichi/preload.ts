// This is the preload script file of the ichi window.
// Learn more: https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { ipcRenderer, contextBridge } from 'electron';

// The renderer process does NOT have access to Electron API
// So the methods that need Electron API must be exposed here

const ICHI_API = {
    log: (message: string) => ipcRenderer.send("log", message)
}


declare global { interface Window { api?: any; }}
contextBridge.exposeInMainWorld("api", ICHI_API);