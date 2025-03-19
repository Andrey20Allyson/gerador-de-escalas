import NodeWebSocket from "ws";
import { RemoteActionIO } from "../infra/remote-actions";
import { GetElementAction } from "./get-element";

export class ElementHandler {
  click() {}
}

export interface TDKContext {
  actions: RemoteActionIO;
}

export class UITester {
  constructor(private readonly context: TDKContext) {
    this._getAction = new GetElementAction(this.context);
  }

  private readonly _getAction: GetElementAction;

  get(...args: Parameters<GetElementAction["get"]>) {
    return this._getAction.get(...args);
  }
}

const ws = new NodeWebSocket("ws://localhost:7575");

const actions = RemoteActionIO.from(ws);

const uitester = new UITester({ actions });

export default uitester;
