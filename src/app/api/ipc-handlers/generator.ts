import fs from 'fs/promises';
import { AppGeneratorHandler, AppPreGenerateEditorHandler } from ".";
import { AppResponse } from "../app.base";
import { AppAssets } from "../assets";
import { TableGenerator } from "../table-generation/table-generator";

export function createPreGenerateEditorHandler(generator: TableGenerator): AppPreGenerateEditorHandler {
  return {
    async getEditor(_) {
      return generator.createPreGenerateEditor();
    },

    async save(_, data) {
      return generator.save(data);
    },
  };
}

export function createGeneratorHandler(assets: AppAssets): AppGeneratorHandler {
  const { holidays, serializer, workerRegistryMap } = assets;
  const generator = new TableGenerator();

  return {
    preGenerateEditor: createPreGenerateEditorHandler(generator),

    async clear(_) {
      generator.clear();
    },

    async generate(_) {
      return generator.generate();
    },

    async load(_, payload) {
      const { filePath, month, sheetName, year } = payload;

      generator.load({
        table: {
          buffer: await fs.readFile(filePath),
          sheetName,
        },
        workerRegistryMap,
        holidays,
        month,
        year,
      });

      return AppResponse.ok();
    },

    async serialize(_) {
      return generator.serialize(serializer);
    },
  }
}