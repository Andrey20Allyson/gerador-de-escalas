import { AppResponse, WorkerRegistry, workerRegistrySchema } from "../../base";
import { Collection } from "../../firebase";
import { TypedLoader } from "../../loaders/typed-loader";
import { TypedRepository } from "../../repositories/typed-repository";
import { IpcMapping, IpcMappingFactory } from "../mapping";

export interface ListOptions {
  limit?: number;
  offset?: number;
  queryString?: string;
}

export class WorkerRegisterHandler implements IpcMappingFactory {
  loader: TypedLoader<WorkerRegistry>;
  repository: TypedRepository<WorkerRegistry>;

  constructor() {
    this.repository = new TypedRepository({
      collection: Collection.workerRegistries,
      schema: workerRegistrySchema,
    });

    this.loader = new TypedLoader({
      cache: {
        contains: 'config',
        content: {
          prefix: 'worker-registries',
        },
      },
      repository: {
        contains: 'instance',
        content: this.repository,
      },
      schema: workerRegistrySchema,
    });
  }

  async create(_: IpcMapping.IpcEvent, worker: WorkerRegistry) {
    const entry = await this.repository.create({ data: worker });

    return AppResponse.ok(entry);
  }

  async list(_: IpcMapping.IpcEvent, options: ListOptions) {
    const entries = await this.loader.load();

    return AppResponse.ok(entries.slice(options.offset, options.limit));
  }

  async update(_: IpcMapping.IpcEvent, id: string, changes: Partial<WorkerRegistry>) {
    const result = await this.repository.update({ id, data: changes });
  
    return AppResponse.ok(result);
  }

  async delete(_: IpcMapping.IpcEvent, id: string) {
    const result = this.repository.delete(id);

    return AppResponse.ok(result);
  }

  handler() {
    return IpcMapping.create({
      create: this.create,
      list: this.list,
      update: this.update,
      delete: this.delete,
    }, this);
  }
}