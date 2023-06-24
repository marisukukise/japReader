// This is the renderer process file of the reader window.
// This file will automatically be loaded by webpack and run in the "renderer" context.
// By default, Node.js integration in this file is disabled, but can be enabled in the main process.
// Learn more: https://www.electronjs.org/docs/latest/tutorial/process-model#the-renderer-process

console.log(Date.now(),"renderer.ts 1");
import './index.css';
import './app';
console.log(Date.now(),"renderer.ts 2");