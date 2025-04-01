import { GetElementPayload, GetElementReply } from "./dtos/element.get";
import { ElementHandler } from "./element-handler";
import { UIAssertionError } from "./ui-assertion-error";
import { TDKContext } from "./uitester";

export class GetElementAction {
  constructor(readonly context: TDKContext) {}

  async get(selector: string): Promise<ElementHandler> {
    const { hasFound } = await this.context.call<
      GetElementPayload,
      GetElementReply
    >("ui:select-element", {
      selector,
    });

    if (hasFound == false) {
      throw new UIAssertionError(`Expected existence of element '${selector}'`);
    }

    return new ElementHandler(this.context, selector);
  }
}
