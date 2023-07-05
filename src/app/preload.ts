/// <reference path="./api/globals.d.ts"/>
import { contextBridge, ipcRenderer } from 'electron';
import type { AppAPI, AppChannelParams, AppChannelReturn, AppChannels } from './api/channels';

async function invokeIPC<C extends keyof AppChannels>(channel: C, ...args: AppChannelParams<C>): Promise<AppChannelReturn<C>> {
  return ipcRenderer.invoke(channel, ...args);
}

function createRendererAPI(): AppAPI {
  return {
    changeWorkerDayOfWork(workerIndex, day, value) {
      return invokeIPC('changeWorkerDayOfWork', workerIndex, day, value);
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

    loadData(filePath, sheetName, year, month) {
      return invokeIPC('loadData', filePath, sheetName, year, month);
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