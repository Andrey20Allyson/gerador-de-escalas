import { WorkerRegistryInit, WorkerRegistryRepository } from "../../auto-schedule/persistence/entities/worker-registry";
import { AppAssets } from "../assets";
import { AppResponse } from "../mapping/response";
import { IpcMappingFactory, IpcMapping } from "../mapping/utils";

export interface ListOptions {
  limit?: number;
  offset?: number;
  queryString?: string;
}

export class WorkerRegisterHandler implements IpcMappingFactory {
  constructor(readonly assets: AppAssets) { }

  get repository(): WorkerRegistryRepository {
    return this.assets.services.workerRegistry.repository;
  }

  async create(_: IpcMapping.IpcEvent, worker: WorkerRegistryInit) {
    const entry = await this.repository.create(worker);

    return AppResponse.ok(entry);
  }

  async get(_: IpcMapping.IpcEvent, workerId: string) {
    const entries = await this.repository.load();

    const entry = entries.get(workerId);

    return AppResponse.ok(entry)
  }

  async list(_: IpcMapping.IpcEvent, options: ListOptions = {}) {
    const entries = await this.repository.list();

    return AppResponse.ok(entries.slice(options.offset, options.limit));
  }

  async update(_: IpcMapping.IpcEvent, workerId: string, changes: Partial<WorkerRegistryInit>) {
    const result = await this.repository.update(workerId, changes);

    return AppResponse.ok(result);
  }

  async delete(_: IpcMapping.IpcEvent, workerId: string) {
    const result = await this.repository.delete(workerId);

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