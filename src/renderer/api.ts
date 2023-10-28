import { APIHandler } from '@gde/app/api/ipc';
import { IpcInvokerProxyFactory } from "@gde/app/api/mapping";

const factory = new IpcInvokerProxyFactory((path, ...args) => {
  return window.resource(path, ...args);
});

export const api = factory.create<APIHandler>();
export const { editor, generator } = api;

export * from '@gde/app/base/api';
