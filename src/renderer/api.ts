import { AppInvoker } from "../app/api/channels";
import { IPCInvokerProxyFactory } from "../app/api/renderer.ipc";

const factory = new IPCInvokerProxyFactory((path, ...args) => {
  return window.resource(path, ...args);
});

export const api = factory.create<AppInvoker>();

export * from '../app/api/app.base';