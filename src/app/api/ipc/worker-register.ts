import { AppResponse, WorkerRegistry, workerRegistrySchema } from "../../base";
import { Collection } from "../../firebase";
import { TypedLoader } from "../../loaders/typed-loader";
import { TypedRepository } from "../../repositories/typed-repository";
import { AppAssets } from "../assets";
import { IpcMapping, IpcMappingFactory } from "../mapping";

export interface ListOptions {
  limit?: number;
  offset?: number;
  queryString?: string;
}

export class WorkerRegisterHandler implements IpcMappingFactory {
  constructor(readonly assets: AppAssets) { }

  get loader(): TypedLoader<WorkerRegistry> {
    return this.assets.services.workerRegistry.loader;
  }

  get repository(): TypedRepository<WorkerRegistry> {
    return this.assets.services.workerRegistry.repository;
  }

  async create(_: IpcMapping.IpcEvent, worker: WorkerRegistry) {
    const entry = await this.repository.create({ data: worker });

    return AppResponse.ok(entry);
  }

  async get(_: IpcMapping.IpcEvent, id: string) {
    const entries = await this.loader.load();

    const entry = entries.find(entry => entry.id === id);

    return AppResponse.ok(entry)
  }

  async list(_: IpcMapping.IpcEvent, options: ListOptions = {}) {
    const entries = await this.loader.load();

    return AppResponse.ok(entries.slice(options.offset, options.limit));
  }

  async update(_: IpcMapping.IpcEvent, id: string, changes: Partial<WorkerRegistry>) {
    const result = await this.repository.update({ id, data: changes });

    return AppResponse.ok(result);
  }

  async delete(_: IpcMapping.IpcEvent, id: string) {
    const result = await this.repository.delete(id);

    return AppResponse.ok(result);
  }

  handler() {
    return IpcMapping.create({
      create: this.create,
      list: this.list,
      get: this.get,
      update: this.update,
      delete: this.delete,
    }, this);
  }
}