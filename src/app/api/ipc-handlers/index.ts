import { AppAssets } from '../assets';
import { AppHandler } from '../channels';
import { createEditorHandler } from './editor';
import { createGeneratorHandler } from './generator';
import { createUtilsHandler } from './utils';

export function createAPIHandler(assets: AppAssets): AppHandler {
  return {
    editor: createEditorHandler(assets),
    generator: createGeneratorHandler(assets),
    utils: createUtilsHandler(),
  };
}

export * from './editor';
export * from './generator';
export * from './utils';
