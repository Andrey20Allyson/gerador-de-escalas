import fs from "fs/promises";
import { AppAssets } from "../assets";
import { TableGenerator } from "../table-generation/table-generator";
import { AppResponse } from "../mapping/response";
import { IpcMapping } from "../mapping/utils";

export interface LoadPayload {
  sheetName: string;
  filePath: string;
  month: number;
  year: number;
}

export class GeneratorHandler {
  generator: TableGenerator;

  constructor(readonly assets: AppAssets) {
    this.generator = new TableGenerator();
  }

  clear() {
    return this.generator.clear();
  }

  generate() {
    return this.generator.generate();
  }

  async load(_: IpcMapping.IpcEvent, payload: LoadPayload) {
    const { filePath, month, sheetName, year } = payload;
    const { workerRegistryMap, holidays } = this.assets;

    this.generator.load({
      table: {
        buffer: await fs.readFile(filePath),
        sheetName,
      },
      workerRegistryMap: workerRegistryMap,
      holidays,
      month,
      year,
    });

    return AppResponse.ok();
  }

  serialize() {
    return this.generator.serialize(this.assets.serializationStratergy);
  }

  handler() {
    return IpcMapping.create(
      {
        serialize: this.serialize,
        generate: this.generate,
        clear: this.clear,
        load: this.load,
      },
      this,
    );
  }
}
