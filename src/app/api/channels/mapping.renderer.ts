import { separator } from "./utils";

export type IPCInvokerFunction = (...args: unknown[]) => unknown;

export type IPCInvokerRecord = IPCInvokerFunction & { [K in string]: IPCInvokerRecord }

export class IPCInvokerProxyFactory {
  constructor(public listener: (path: string, ...args: unknown[]) => unknown) { }

  private _create(prefix = '', path = ''): IPCInvokerRecord {
    const map = new Map<string, IPCInvokerRecord>();
    const factory = this;

    function callback(...args: unknown[]) {
      return factory.listener(path, ...args);
    }

    function get(_: typeof callback, p: string | symbol) {
      if (typeof p !== 'string') return;
      let childProxy = map.get(p);

      if (!childProxy) {
        childProxy = factory._create(prefix + p + separator, prefix + p);

        map.set(p, childProxy);
      }

      return childProxy;
    }

    return new Proxy(callback, { get }) as any;
  }

  create<T = IPCInvokerRecord>(): T {
    return this._create() as T;
  }
}