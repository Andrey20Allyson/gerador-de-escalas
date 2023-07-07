/// <reference path="./api/globals.d.ts"/>
import { contextBridge, ipcRenderer } from 'electron';
import type { AppAPI, AppChannelParams, AppChannelReturn, AppChannels } from './api/channels';

async function invokeIPC<C extends keyof AppChannels>(channel: C, ...args: AppChannelParams<C>): Promise<AppChannelReturn<C>> {
  return ipcRenderer.invoke(channel, ...args);
}

function createRendererAPI(): AppAPI {
  return {
    clearData() {
      return invokeIPC('clearData');
    },

    changeWorkerDayOfWork(workerIndex, day, value) {
      return invokeIPC('changeWorkerDayOfWork', workerIndex, day, value);
    },

    getEditableMap() {
      return invokeIPC('getEditableMap');
    },

    serializeEditedTable() {
      return invokeIPC('serializeEditedTable');
    },

    loadEditor(payload) {
      return invokeIPC('loadEditor', payload);
    },

    saveEditorChanges(changes) {
      return invokeIPC('saveEditorChanges', changes);
    },

    changeWorkerInfo(index, newState) {
      return invokeIPC('changeWorkerInfo', index, newState);
    },

    getSheetNames(filePath) {
      return invokeIPC('getSheetNames', filePath);
    },

    getWorkerInfo() {
      return invokeIPC('getWorkerInfo');
    },

    saveWorkersDaysOfWork(workers) {
      return invokeIPC('saveWorkersDaysOfWork', workers);
    },

    getLoadedData() {
      return invokeIPC('getLoadedData');
    },

    loadData(data) {
      return invokeIPC('loadData', data);
    },

    generateWithLoaded() {
      return invokeIPC('generateWithLoaded');
    },

    getGeneratedArrayBuffer() {
      return invokeIPC('getGeneratedArrayBuffer');
    },
  }
}

contextBridge.exposeInMainWorld('api', createRendererAPI());