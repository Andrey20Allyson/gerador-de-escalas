import { AppAssets } from '../assets';
import { IpcMapping, IpcMappingFactory } from '../mapping';
import { EditorHandler } from './editor';
import { GeneratorHandler } from './generator';
import { UtilsHandler } from './utils';

export interface HandlerFactory<THandler> {
  handler(): THandler;
}

export class APIHandler implements IpcMappingFactory {
  generator: GeneratorHandler;
  editor: EditorHandler;
  utils: UtilsHandler;

  constructor(readonly assets: AppAssets) {
    this.generator = new GeneratorHandler(assets);
    this.editor = new EditorHandler(assets);
    this.utils = new UtilsHandler();
  }

  handler() {
    return IpcMapping.create({
      generator: this.generator.handler(),
      editor: this.editor.handler(),
      utils: this.utils.handler(),
    });
  }
}

export * from './editor';
export * from './generator';
export * from './utils';

