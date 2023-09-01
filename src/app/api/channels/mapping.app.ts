import { IpcMain } from "electron";
import { AppError, AppResponse } from "../app.base";
import { separator } from "./utils";
import { IpcMapping, IpcMappingFactory } from "./mapping.types";

export type HandlerType = { [K in string]: IpcMapping.HandlerFunction | HandlerType };
export type IPCHandlerMapValue = {
  thisArg?: unknown;
  callback: IpcMapping.HandlerFunction<unknown[]>;
};
export type IPCHandlerMap = Map<string, IPCHandlerMapValue>;

export type IPCReciver = Pick<IpcMain, 'handle'>;

export class IPCHandlerConsumer {
  handlers: IPCHandlerMap;
  recivers: Set<IPCReciver>;

  constructor(factory: IpcMappingFactory) {
    this.recivers = new Set();
    this.handlers = IPCHandlerConsumer.map(factory);
  }

  listen(ipc: IPCReciver) {
    if (this.recivers.has(ipc)) return;

    this.recivers.add(ipc);

    ipc.handle('resource', (ev, name, ...args) => this.consume(name, ev, ...args));
  }

  async consume(name: unknown, ev: IpcMapping.IpcEvent, ...args: unknown[]) {
    if (typeof name !== 'string') throw new Error(`Resource name must be a string!`);
    const handler = this.handlers.get(name);
    if (!handler) throw new Error(`Unknow resource named '${name}'`);

    const { callback, thisArg } = handler;

    try {
      return await callback.call(thisArg, ev, ...args);
    } catch (e) {
      return AppResponse.error(AppError.parse(e));
    }
  }

  private static _map(handler: IpcMapping, prefix = '', handlerMap: IPCHandlerMap = new Map()) {
    for (let key in handler.map) {
      const value = handler.map[key];
      if (value === undefined) continue;

      if (value instanceof Function) {
        handlerMap.set(prefix + key, {
          callback: value,
          thisArg: handler.thisArg,
        });
      } else {
        IPCHandlerConsumer._map(value, prefix + key + separator, handlerMap);
      }
    }

    return handlerMap;
  }

  static map<F extends IpcMappingFactory>(factory: F): IPCHandlerMap {
    return IPCHandlerConsumer._map(factory.handler())
  }
}