import { IpcMain } from "electron";
import { IpcMapping, IpcMappingFactory, separator } from "./utils";
import { AppError } from "./error";
import { AppResponse } from "./response";
import _ from "lodash";
import { cloneAndInscribeProto, resolveProto } from "src/utils/resolve-proto";
import "../../../lib/protos";

export type HandlerType = {
  [K in string]: IpcMapping.HandlerFunction | HandlerType;
};
export type IpcHandlerMapValue = {
  thisArg?: unknown;
  callback: IpcMapping.HandlerFunction<unknown[]>;
};
export type IpcHandlerMap = Map<string, IpcHandlerMapValue>;

export type IpcReciver = Pick<IpcMain, "handle">;

export class IpcHandlerConsumer {
  handlers: IpcHandlerMap;
  recivers: Set<IpcReciver>;

  constructor(factory: IpcMappingFactory) {
    this.recivers = new Set();
    this.handlers = IpcHandlerConsumer.map(factory);
  }

  listen(ipc: IpcReciver) {
    if (this.recivers.has(ipc)) return;

    this.recivers.add(ipc);

    ipc.handle("resource", async (ev, name, ...args) => {
      const response = await this.consume(name, ev, ...args);

      if (response != null && response.ok === false) {
        console.log(response.error.callstack);
      }

      return response;
    });
  }

  async consume(name: unknown, ev: IpcMapping.IpcEvent, ...args: unknown[]) {
    if (typeof name !== "string")
      throw new Error(`Resource name must be a string!`);
    const handler = this.handlers.get(name);
    if (!handler) throw new Error(`Unknow resource named '${name}'`);

    const { callback, thisArg } = handler;

    try {
      const result = await callback.call(thisArg, ev, ...resolveProto(args));

      return cloneAndInscribeProto(result);
    } catch (e) {
      return AppResponse.error(AppError.parse(e));
    }
  }

  private static _map(
    handler: IpcMapping,
    prefix = "",
    handlerMap: IpcHandlerMap = new Map(),
  ) {
    for (let key in handler.map) {
      const value = handler.map[key];
      if (value === undefined) continue;

      if (value instanceof Function) {
        handlerMap.set(prefix + key, {
          callback: value,
          thisArg: handler.thisArg,
        });
      } else {
        IpcHandlerConsumer._map(value, prefix + key + separator, handlerMap);
      }
    }

    return handlerMap;
  }

  static map<F extends IpcMappingFactory>(factory: F): IpcHandlerMap {
    return IpcHandlerConsumer._map(factory.handler());
  }
}
