/// <reference path="./globals.ts"/>
import { ipcRenderer, contextBridge } from 'electron';

function createResourceAPI(): Window['resource'] {
  return (name, ...args) => ipcRenderer.invoke('resource', name, ...args);
}

contextBridge.exposeInMainWorld('resource', createResourceAPI());