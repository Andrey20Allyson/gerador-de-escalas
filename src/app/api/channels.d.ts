import { WorkerInfo } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-table/worker-info";
import type { IpcMainInvokeEvent } from "electron";
import { GeneratorStatus, SaveWorkersDaysOfWorkStatus } from "./status";

export type AppChannelParams<C extends keyof AppChannels> = Parameters<AppChannels[C]>;
export type AppChannelReturn<C extends keyof AppChannels> = ReturnType<AppChannels[C]>;

export interface LoadedData {
  readonly workers: readonly WorkerInfo[];
  readonly sheetName: string;
  readonly month: number;
  readonly year: number;
}

interface GeneratorData {
  sheetName: string;
  filePath: string;
  month: number;
  year: number;
}

export interface AppChannels {
  getSheetNames(filePath: string): string[];
  changeWorkerInfo(index: number, newState: WorkerInfo): void;
  loadData(data: GeneratorData): Error | undefined;
  clearData(): void;
  changeWorkerDayOfWork(workerIndex: number, day: number, value: boolean): void;
  saveWorkersDaysOfWork(workers: readonly WorkerInfo[]): SaveWorkersDaysOfWorkStatus;
  getWorkerInfo(): WorkerInfo[] | undefined;
  getLoadedData(): LoadedData | undefined;
  generateWithLoaded(): GeneratorStatus;
  getGeneratedArrayBuffer(): ArrayBuffer | undefined;
}

export type AppAPI = {
  [Channel in keyof AppChannels]: (...args: AppChannelParams<Channel>) => Promise<AppChannelReturn<Channel>>;
};

export type AppHandlerObject = {
  [Channel in keyof AppChannels]: (ev: IpcMainInvokeEvent, ...args: AppChannelParams<Channel>) => Promise<AppChannelReturn<Channel>>;
};