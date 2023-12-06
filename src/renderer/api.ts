import { APIHandler } from '../app/api/ipc';
import { IpcInvokerProxyFactory } from "../app/api/mapping";

const factory = new IpcInvokerProxyFactory((path, ...args) => {
  return window.resource(path, ...args);
});

export const api = factory.create<APIHandler>();
export const { editor, generator } = api;

export * from '../app/base/api';
