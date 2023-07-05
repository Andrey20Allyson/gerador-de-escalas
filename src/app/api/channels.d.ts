import { WorkerInfo } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-table/worker-info";
import type { IpcMainInvokeEvent } from "electron";
import { GeneratorStatus, SaveWorkersDaysOfWorkStatus } from "./status";

export type Channel<Params extends unknown[], Return> = {
  params: Params,
  returnType: Return,
}

export type AppChannelParams<C extends keyof AppChannels> = AppChannels[C]['params'];
export type AppChannelReturn<C extends keyof AppChannels> = AppChannels[C]['returnType'];

export interface LoadedData {
  readonly workers: readonly WorkerInfo[];
  readonly sheetName: string;
  readonly month: number;
  readonly year: number;
}

export interface AppChannels {
  getSheetNames: Channel<[filePath: string], string[]>;
  changeWorkerInfo: Channel<[index: number, newState: WorkerInfo], void>;
  loadData: Channel<[filePath: string, sheetName: string, year: number, month: number], Error | undefined>;
  changeWorkerDayOfWork: Channel<[workerIndex: number, day: number, value: boolean], void>;
  saveWorkersDaysOfWork: Channel<[workers: readonly WorkerInfo[]], SaveWorkersDaysOfWorkStatus>
  getWorkerInfo: Channel<[], WorkerInfo[] | undefined>;
  getLoadedData: Channel<[], LoadedData | undefined>;
  generateWithLoaded: Channel<[], GeneratorStatus>;
  getGeneratedArrayBuffer: Channel<[], ArrayBuffer | undefined>;
}

export type AppAPI = {
  [Channel in keyof AppChannels]: (...args: AppChannelParams<Channel>) => Promise<AppChannelReturn<Channel>>;
}

export type AppHandlerObject = {
  [Channel in keyof AppChannels]: (ev: IpcMainInvokeEvent, ...args: AppChannelParams<Channel>) => Promise<AppChannelReturn<Channel>>
}