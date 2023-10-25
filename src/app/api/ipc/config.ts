import { AppAssets } from "../assets";
import { IpcMapping, IpcMappingFactory } from "../mapping";
import { HolidaysRegisterHandler } from "./holidays-register";
import { WorkerRegisterHandler } from "./worker-register";

export class ConfigHandler implements IpcMappingFactory {
  holidays: HolidaysRegisterHandler;
  workers: WorkerRegisterHandler;

  constructor(readonly assets: AppAssets) {
    this.holidays = new HolidaysRegisterHandler();
    this.workers = new WorkerRegisterHandler(assets);
  }

  handler() {
    return IpcMapping.create({
      holidays: this.holidays.handler(),
      workers: this.workers.handler(),
    }, this);
  }
}