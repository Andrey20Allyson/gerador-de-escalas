import { WorkerInfo } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-table/worker-info";

export type Channel<Params extends unknown[], Return> = {
  params: Params,
  returnType: Return,
}

export type AppChannelParams<C extends keyof AppChannels> = AppChannels[C]['params'];
export type AppChannelReturn<C extends keyof AppChannels> = AppChannels[C]['returnType'];

export interface AppChannels {
  generate: Channel<[filePath: string, sheetName: string, month: number], Uint8Array>;
  getSheetNames: Channel<[filePath: string], string[]>;
  getWorkerInfos: Channel<[], WorkerInfo>;
}