import { IpcMain } from "electron";
import { AppError, AppResponse } from "./app.base";
import { separator } from "./channels/utils";

export type Fn<P extends any[] = any[], R = any> = (...args: P) => R;

export type HandlerType = { [K in string]: Fn | HandlerType };
export type IPCHandlerMap = Map<string, Fn<unknown[], unknown>>;

export type IPCReciver = Pick<IpcMain, 'handle'>;

export class IPCHandlerConsumer<H extends HandlerType> {
  handlers: IPCHandlerMap;
  recivers: Set<IPCReciver>;

  constructor(handler: H) {
    this.recivers = new Set();
    this.handlers = IPCHandlerConsumer.map(handler);
  }

  listen(ipc: IPCReciver) {
    if (this.recivers.has(ipc)) return;

    this.recivers.add(ipc);

    ipc.handle('resource', (ev, name, ...args) => this.consume(name, ev, ...args));
  }

  async consume(name: unknown, ...args: unknown[]) {
    if (typeof name !== 'string') throw new Error(`Resource name must be a string!`);
    const handler = this.handlers.get(name);
    if (!handler) throw new Error(`Unknow resource named '${name}'`);

    try {
      const result = handler(...args);

      if (result instanceof Promise) {
        return await result;
      }
  
      return result;
    } catch (e) {
      const { code, message, callstack } = AppError.parse(e);

      return AppResponse.error(message, code, callstack);
    }
  }

  private static _map(handler: HandlerType, prefix = '', handlerMap: IPCHandlerMap = new Map()) {
    for (let key in handler) {
      const value = handler[key];
      if (value === undefined) continue;

      if (value instanceof Function) {
        handlerMap.set(prefix + key, value);
      } else {
        IPCHandlerConsumer._map(value, prefix + key + separator, handlerMap);
      }
    }

    return handlerMap;
  }

  static map<H extends HandlerType>(handler: H): IPCHandlerMap {
    return IPCHandlerConsumer._map(handler)
  }
}