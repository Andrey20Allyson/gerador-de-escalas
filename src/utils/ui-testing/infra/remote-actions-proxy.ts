import {
  ClosedListener,
  RemoteActionCaller,
  RemoteActionIO,
} from "./remote-actions";

export interface ProxyCallPayload {
  proxyId: string;
  proxyAction: ProxyCallAction;
}

export interface ProxyCallAction {
  name: string;
  payload: any;
}

export class RemoteActionIOProxy implements RemoteActionCaller {
  constructor(
    private readonly actions: RemoteActionIO,
    readonly id: string,
  ) {}

  call<P = any, R = any>(name: string, payload: P): Promise<R> {
    return this.actions.call<ProxyCallPayload>("proxy:call", {
      proxyId: this.id,
      proxyAction: {
        name,
        payload,
      },
    });
  }

  closed(listener: ClosedListener) {
    this.actions.closed(listener);
  }

  static async fromTag(
    actions: RemoteActionIO,
    tag: string,
  ): Promise<RemoteActionIOProxy> {
    const result = await actions.call("tag:list", { tag: "ui" });
    const id: string | undefined = result.actionIds[0];

    if (id == null) {
      throw new Error(`tag '${tag}' don't have correspondents`);
    }

    return new RemoteActionIOProxy(actions, id);
  }

  close(): void {
    this.actions.close();
  }
}
