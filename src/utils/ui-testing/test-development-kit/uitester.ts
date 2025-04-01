import NodeWebSocket from "ws";
import { RemoteActionCaller, RemoteActionIO } from "../infra/remote-actions";
import { GetElementAction } from "./get-element";
import { RemoteActionIOProxy } from "../infra/remote-actions-proxy";

export class TDKContext {
  constructor(readonly factory: RemoteActionCallerFactory) {}

  caller: RemoteActionCaller | null = null;

  async call<P = any, R = any>(action: string, payload: P): Promise<R> {
    if (this.caller == null) {
      this.caller = await this.factory();
    }

    return this.caller.call(action, payload);
  }
}

export type RemoteActionCallerFactory = () => Promise<RemoteActionCaller>;

export interface UITesterConfig {
  readonly remoteCallerFactory: RemoteActionCallerFactory;
}

export class UITester {
  private readonly context: TDKContext;

  constructor(readonly config: UITesterConfig) {
    this.context = new TDKContext(this.config.remoteCallerFactory);

    this._getAction = new GetElementAction(this.context);
  }

  private readonly _getAction: GetElementAction;

  async get(...args: Parameters<GetElementAction["get"]>) {
    return this._getAction.get(...args);
  }

  async create() {}

  close(): void {
    if (this.context.caller == null) {
      return;
    }

    this.context.caller.close();
  }
}

interface RemoteActionCallerFactoryConfig {
  address: string;
}

function createRemoteCallerFactory(
  config: RemoteActionCallerFactoryConfig,
): RemoteActionCallerFactory {
  return async () => {
    const ws = new NodeWebSocket(config.address);

    const actions = await RemoteActionIO.from(ws).asReady();

    const proxy = await RemoteActionIOProxy.fromTag(actions, "ui");

    return proxy;
  };
}

export const DEFAULT_UI_TESTING_ADDRESS = "ws://localhost:7575";

const uitester = new UITester({
  remoteCallerFactory: createRemoteCallerFactory({
    address: DEFAULT_UI_TESTING_ADDRESS,
  }),
});

export default uitester;
