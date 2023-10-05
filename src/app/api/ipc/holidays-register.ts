import { IpcMapping, IpcMappingFactory } from "../mapping";

export class HolidaysRegisterHandler implements IpcMappingFactory {

  handler() {
    return IpcMapping.create({
      
    }, this);
  }
}