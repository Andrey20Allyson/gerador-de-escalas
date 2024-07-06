import { io } from "../../auto-schedule";
import { IpcMapping, IpcMappingFactory } from "../mapping";
import { AppResponse } from "../../base";

export class UtilsHandler implements IpcMappingFactory {
  async getSheetNames(_: IpcMapping.IpcEvent, filePath: string) {
    return AppResponse.ok(await io.loadSheetNames(filePath));
  }

  handler() {
    return IpcMapping.create({
      getSheetNames: this.getSheetNames
    }, this);
  }
}