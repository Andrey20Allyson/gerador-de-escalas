import { IpcMapping, IpcMappingFactory } from "../mapping";
import { PreGenerateEditorDTO } from "../table-generation/pre-generate-editor";
import { TableGenerator } from "../table-generation/table-generator";

export class PreGenerateEditorHandler implements IpcMappingFactory {
  constructor(
    readonly generator: TableGenerator,
  ) { }

  getEditor() {
    return this.generator.createPreGenerateEditor();
  }

  save(_: IpcMapping.IpcEvent, data: PreGenerateEditorDTO) {
    return this.generator.save(data);
  }

  handler() {
    return IpcMapping.create({
      getEditor: this.getEditor,
      save: this.save,
    }, this);
  }
}