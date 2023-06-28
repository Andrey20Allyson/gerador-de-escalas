/// <reference path="./api/globals.d.ts"/>
import { contextBridge, ipcRenderer } from 'electron';
import { AppAPI, AppChannelParams, AppChannelReturn, AppChannels } from './api/channels';

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

    generate(filePath, sheetName, month) {
      return invokeIPC('generate', filePath, sheetName, month);
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

    loadData(filePath, sheetName, month) {
      return invokeIPC('loadData', filePath, sheetName, month);
    },
  }
}

contextBridge.exposeInMainWorld('api', createRendererAPI());