import { IpcMappingFactory, IpcMapping } from "../mapping/utils";

export class HolidaysRegisterHandler implements IpcMappingFactory {

  handler() {
    return IpcMapping.create({
      
    }, this);
  }
}