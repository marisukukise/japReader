// This is the preload script file of the reader window.
// Learn more: https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts


const { contextBridge } = require('electron');

console.log(Date.now(), "preload.ts")