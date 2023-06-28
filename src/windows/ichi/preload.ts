// This is the preload script file of the ichi window.
// Learn more: https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { dialog, ipcRenderer, contextBridge } from 'electron';

// The renderer process does NOT have access to Electron API
// So the methods that need Electron API must be exposed here

import log from 'electron-log/renderer';
log.silly('Log from the ichi preload');
console.log("wtf")
ipcRenderer.send("log", "log from ichi preload wtf")



const ICHI_API = {
    log: (message: string) => ipcRenderer.send("log", message)
}


declare global { interface Window { api?: any; }}
contextBridge.exposeInMainWorld("api", ICHI_API);