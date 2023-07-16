import { AppAssets } from "../assets";
import { ErrorCode, AppResponse } from "../app.base";
import { AppHandler } from "../channels";
import { EditionHandler } from "../table-edition";
import { readTables } from "../utils/table";
import fs from 'fs/promises';

export function createEditorHandler(assets: AppAssets): AppHandler['editor'] {
  const { holidays, serializer, workerRegistryMap } = assets;
  const editor = new EditionHandler();

  return {
    async clear() {
      delete editor.data;
    },

    async getEditor() {
      const result = editor.createEditor();
      if (result === ErrorCode.DATA_NOT_LOADED) return AppResponse.error('Shold load data before get editor!', result);

      return AppResponse.ok(result.data);
    },

    async load(_, payload) {
      const tables = await readTables(payload, fs);

      editor.load({ holidays, tables, workerRegistryMap });

      return AppResponse.ok();
    },

    async save(_, data) {
      return editor.save(data)
        ? AppResponse.ok()
        : AppResponse.error('Shold load data before save!', ErrorCode.DATA_NOT_LOADED);
    },

    async serialize() {
      const table = editor.data?.table;
      if (!table) return AppResponse.error('Shold load data before serialize!', ErrorCode.DATA_NOT_LOADED);

      const buffer = await serializer.generate(table, { sheetName: 'DADOS' });

      return AppResponse.ok(buffer.buffer);
    },
  };
}