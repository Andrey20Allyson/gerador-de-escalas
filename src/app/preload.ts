/// <reference path="./globals.ts"/>
import { ipcRenderer } from 'electron';

console.log(__dirname);

window.resource = (name, ...args) => ipcRenderer.invoke('resource', name, ...args);