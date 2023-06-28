import { WorkerInfo } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-table/worker-info";

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
}

export enum SaveWorkersDaysOfWorkStatus {
  OK,
  ARRAY_LENGTH_ERROR,
  UNKNOWN_ERROR,
};

export interface AppChannels {
  generate: Channel<[filePath: string, sheetName: string, month: number], Uint8Array>;
  getSheetNames: Channel<[filePath: string], string[]>;
  changeWorkerInfo: Channel<[index: number, newState: WorkerInfo], void>;
  loadData: Channel<[filePath: string, sheetName: string, month: number], Error | undefined>;
  changeWorkerDayOfWork: Channel<[workerIndex: number, day: number, value: boolean], void>;
  saveWorkersDaysOfWork: Channel<[workers: readonly WorkerInfo[]], SaveWorkersDaysOfWorkStatus>
  getWorkerInfo: Channel<[], WorkerInfo[] | undefined>;
  getLoadedData: Channel<[], LoadedData | undefined>;
}

export type AppAPI = {
  [Channel in keyof AppChannels]: (...args: AppChannelParams<Channel>) => Promise<AppChannelReturn<Channel>>;
}