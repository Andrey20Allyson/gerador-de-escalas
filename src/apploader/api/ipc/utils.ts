import { io } from "../../auto-schedule";
import { AppResponse } from "../mapping/response";
import { IpcMappingFactory, IpcMapping } from "../mapping/utils";

export class UtilsHandler implements IpcMappingFactory {
  async getSheetNames(_: IpcMapping.IpcEvent, filePath: string) {
    const sheetNames = await io.loadSheetNames(filePath);

    return AppResponse.ok(sheetNames);
  }

  handler() {
    return IpcMapping.create({
      getSheetNames: this.getSheetNames
    }, this);
  }
}