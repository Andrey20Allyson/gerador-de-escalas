import {
  IpcInvokerMapFromFactory,
  IpcMappingFactory,
  separator,
} from "./utils";

export type IpcInvokerFunction = (...args: unknown[]) => unknown;

export type IPCInvokerRecord = {
  [K in string]: IPCInvokerRecord | IpcInvokerFunction;
};

export class IpcInvokerProxyFactory {
  constructor(public listener: (path: string, ...args: unknown[]) => unknown) {}

  private _create(prefix = "", path = ""): IPCInvokerRecord {
    const map = new Map<string, IPCInvokerRecord>();
    const factory = this;

    function callback(...args: unknown[]) {
      return factory.listener(path, ...args);
    }

    function get(_: typeof callback, p: string | symbol) {
      if (typeof p !== "string") return;
      let childProxy = map.get(p);

      if (!childProxy) {
        childProxy = factory._create(prefix + p + separator, prefix + p);

        map.set(p, childProxy);
      }

      return childProxy;
    }

    return new Proxy(callback, { get }) as any;
  }

  create<
    F extends IpcMappingFactory = IpcMappingFactory,
  >(): IpcInvokerMapFromFactory<F> {
    return this._create() as IpcInvokerMapFromFactory<F>;
  }
}
