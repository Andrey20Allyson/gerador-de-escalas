/// <reference path="./api/globals.d.ts"/>
import { contextBridge, ipcRenderer } from 'electron';
import { AppChannelParams, AppChannelReturn, AppChannels } from './api/channels';

async function invokeIPC<C extends keyof AppChannels>(channel: C, ...args: AppChannelParams<C>): Promise<AppChannelReturn<C>> {
  return ipcRenderer.invoke(channel, ...args);
}

function createRendererAPI(): AppAPI {
  return {
    getSheetNames(filePath: string): Promise<string[]> {
      return invokeIPC('getSheetNames', filePath);
    },

    generate(filePath: string, sheetName: string, month: number) {
      return invokeIPC('generate', filePath, sheetName, month);
    }
  }
}

contextBridge.exposeInMainWorld('api', createRendererAPI());