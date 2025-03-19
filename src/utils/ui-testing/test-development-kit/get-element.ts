import { ElementHandler, TDKContext } from "./uitester";

export class GetElementAction {
  constructor(readonly context: TDKContext) {}

  get(query: string): ElementHandler {
    throw new Error("Method not implemented.");
  }
}
