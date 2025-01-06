import { APIHandler } from '../apploader/api/ipc';
import { IpcInvokerProxyFactory } from '../apploader/api/mapping/renderer';

const factory = new IpcInvokerProxyFactory((path, ...args) => {
  return window.resource(path, ...args);
});

export const api = factory.create<APIHandler>();
export const { editor, generator } = api;

export * from '../apploader/api/mapping/response';
export * from '../apploader/api/mapping/error';
