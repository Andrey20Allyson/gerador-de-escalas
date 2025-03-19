import { RemoteActionIO } from "./remote-actions";

export interface ProxyCallPayload {
  proxyId: string;
  proxyAction: ProxyCallAction;
}

export interface ProxyCallAction {
  name: string;
  payload: any;
}

export class RemoteActionIOProxy {
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
}
