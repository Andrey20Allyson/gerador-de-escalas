import { ClickIntoElementPayload } from "./dtos/element.click";
import { TDKContext } from "./uitester";

export class ElementHandler {
  constructor(
    readonly context: TDKContext,
    readonly selector: string,
  ) {}

  async click(): Promise<void> {
    return this.context.call<ClickIntoElementPayload>("ui:element.click", {
      selector: this.selector,
    });
  }
}
