import { BookHandler } from "src/utils/xlsx-handlers";
import { AppResponse } from "../mapping/response";
import { IpcMappingFactory, IpcMapping } from "../mapping/utils";
import fs from "node:fs/promises";

export class UtilsHandler implements IpcMappingFactory {
  async getSheetNames(_: IpcMapping.IpcEvent, filePath: string) {
    const buffer = await fs.readFile(filePath);
    const book = BookHandler.parse(buffer);
    const sheetNames = book.sheetNames;

    return AppResponse.ok(sheetNames);
  }

  handler() {
    return IpcMapping.create(
      {
        getSheetNames: this.getSheetNames,
      },
      this,
    );
  }
}
