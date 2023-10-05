import { WorkerRegistry } from "../../base";
import { IpcMapping, IpcMappingFactory } from "../mapping";

export interface ListOptions {
  limit?: number;
  offset?: number;
  queryString?: string;
}

export class WorkerRegisterHandler implements IpcMappingFactory {

  create(_: IpcMapping.IpcEvent, worker: WorkerRegistry) {
    
  }

  list(_: IpcMapping.IpcEvent, options: ListOptions) {
    
  }

  update(_: IpcMapping.IpcEvent, id: string, changes: Partial<WorkerRegistry>) {

  }

  delete(_: IpcMapping.IpcEvent, id: string) {

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