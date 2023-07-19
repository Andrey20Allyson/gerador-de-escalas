import { AppAssets } from '../assets';
import { AppHandler } from '../channels';
import { EditorHandlerFactory } from './editor';
import { createGeneratorHandler } from './generator';
import { createUtilsHandler } from './utils';

export type AppEditorHandler = AppHandler['editor'];

export type AppGeneratorHandler = AppHandler['generator'];
export type AppPreGenerateEditorHandler = AppGeneratorHandler['preGenerateEditor'];

export type AppUtilsHandler = AppHandler['utils'];

export interface HandlerFactory<THandler> {
  hander(): THandler;
}

export class APIHandlerFactory implements HandlerFactory<AppHandler> {
  editor: EditorHandlerFactory;

  constructor(readonly assets: AppAssets) {
    this.editor = new EditorHandlerFactory(assets);
  }

  hander(): AppHandler {
    const { assets } = this;

    return {
      editor: this.editor.hander(),
      generator: createGeneratorHandler(assets),
      utils: createUtilsHandler(),
    };
  }
}

export * from './editor';
export * from './generator';
export * from './utils';
