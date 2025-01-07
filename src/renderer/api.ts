import { APIHandler } from "../apploader/api/controllers";
import { IpcInvokerProxyFactory } from "../apploader/api/mapping/renderer";

console.log(window.resource);

const factory = new IpcInvokerProxyFactory((path, ...args) => {
  return window.resource(path, ...args);
});

export const api = factory.create<APIHandler>();
export const { editor } = api;

export * from "../apploader/api/mapping/response";
export * from "../apploader/api/mapping/error";
