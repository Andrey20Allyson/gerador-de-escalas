import { loadWorkers } from "@andrey-allyson/escalas-automaticas/dist/auto-schedule/io";
import { AppResponse } from "../app.base";
import { AppAssets } from "../assets";
import { AppHandler } from "../channels";
import { TableGenerator } from "../table-generation/table-generator";
import { parseOrdinary } from "../utils/table";
import fs from 'fs/promises';

export type GeneratorHandler = AppHandler['generator'];
export type PreGenerateEditorHandler = GeneratorHandler['preGenerateEditor'];

export function createPreGenerateEditorHandler(generator: TableGenerator): PreGenerateEditorHandler {
  return {
    async getEditor(_) {
      return generator.createPreGenerateEditor();
    },

    async save(_, data) {
      return generator.save(data);
    },
  };
}

export function createGeneratorHandler(assets: AppAssets): GeneratorHandler {
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