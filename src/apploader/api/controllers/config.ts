import { AppAssets } from "../assets";
import { IpcMappingFactory, IpcMapping } from "../mapping/utils";
import { WorkerRegisterHandler } from "./worker-register";

export class ConfigController implements IpcMappingFactory {
  workers: WorkerRegisterHandler;

  constructor(readonly assets: AppAssets) {
    this.workers = new WorkerRegisterHandler(assets);
  }

  handler() {
    return IpcMapping.create(
      {
        workers: this.workers.handler(),
      },
      this,
    );
  }
}
