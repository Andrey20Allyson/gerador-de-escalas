import { IpcMapping, IpcMappingFactory } from "../mapping";
import { HolidaysRegisterHandler } from "./holidays-register";
import { WorkerRegisterHandler } from "./worker-register";

export class ConfigHandler implements IpcMappingFactory {
  holidays: HolidaysRegisterHandler;
  workers: WorkerRegisterHandler;

  constructor() {
    this.holidays = new HolidaysRegisterHandler();
    this.workers = new WorkerRegisterHandler();
  }

  handler() {
    return IpcMapping.create({
      holidays: this.holidays.handler(),
      workers: this.workers.handler(),
    }, this);
  }
}