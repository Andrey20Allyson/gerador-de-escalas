import { IpcMainInvokeEvent } from 'electron';
import { AppResponse } from './response';

export const separator = '.';

export type OptionalPromise<T> = Promise<T> | T;

export type IpcMapping<T extends IpcMapping.HandlerMap = IpcMapping.HandlerMap> = {
  thisArg?: unknown;
  map: T;
};

export interface IpcMappingFactory<T extends IpcMapping.HandlerMap = IpcMapping.HandlerMap> {
  handler(): IpcMapping<T>;
}

export namespace IpcMappingFactory {
  export type Result<T extends IpcMappingFactory> = ReturnType<T['handler']>;
}

export namespace IpcMapping {
  export type IpcEvent = IpcMainInvokeEvent;
  export type HandlerFunctionReturnType = OptionalPromise<void | AppResponse<any, any>>;

  export type HandlerFunction<
    P extends any[] = any[],
    R extends HandlerFunctionReturnType = HandlerFunctionReturnType,
  > = (ev: IpcEvent, ...args: P) => R;

  export type MapField = HandlerFunction | IpcMapping;
  export type HandlerMap = {
    [K in string]: IpcMapping.MapField;
  }

  export function create<M extends HandlerMap>(map: M, thisArg?: unknown): IpcMapping<M> {
    return { thisArg, map };
  }
}

export type IpcInvokerMapFromFactory<F extends IpcMappingFactory> = F extends IpcMappingFactory<infer M> ? IpcInvokerMap<M> : never;
export type IpcInvokerMap<M extends IpcMapping.HandlerMap> = {
  [K in keyof M]: M[K] extends IpcMapping<infer IM>
  ? IpcInvokerMap<IM>
  : M[K] extends IpcMapping.HandlerFunction<infer P, infer R>
  ? (...args: P) => R extends Promise<any> ? R : Promise<R>
  : never;
};