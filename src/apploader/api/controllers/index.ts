import { AppAssets } from "../assets";
import { AppResponse } from "../mapping/response";
import { IpcMappingFactory, IpcMapping } from "../mapping/utils";
import { ConfigController } from "./config";
import { EditorHandler } from "./editor";
import { UtilsHandler } from "./utils";

export interface HandlerFactory<THandler> {
  handler(): THandler;
}

export class APIHandler implements IpcMappingFactory {
  editor: EditorHandler;
  utils: UtilsHandler;
  config: ConfigController;

  constructor(readonly assets: AppAssets) {
    this.editor = new EditorHandler(assets);
    this.config = new ConfigController(assets);
    this.utils = new UtilsHandler();
  }

  async unlockServices(_: IpcMapping.IpcEvent, password: string) {
    const unlockResult = await this.assets.unlockServices(password);
    if (unlockResult.ok === false) return unlockResult;

    this.assets.load();

    return AppResponse.ok();
  }

  async isServicesLocked() {
    await this.assets.unlockWithEnv();

    const isLocked = this.assets.isServicesLocked();

    return AppResponse.ok(isLocked);
  }

  handler() {
    return IpcMapping.create(
      {
        config: this.config.handler(),
        editor: this.editor.handler(),
        utils: this.utils.handler(),
        unlockServices: this.unlockServices,
        isServicesLocked: this.isServicesLocked,
      },
      this,
    );
  }
}

export * from "./editor";
export * from "./utils";
