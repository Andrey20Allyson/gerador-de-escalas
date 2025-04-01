import { RemoteActionIO } from "../../infra/remote-actions";
import {
  ClickIntoElementPayload,
  ClickIntoElementReply,
} from "../dtos/element.click";

export function handleClickIntoElementAction(actions: RemoteActionIO) {
  actions.handle<ClickIntoElementPayload, ClickIntoElementReply>(
    "ui:element.click",
    (action) => {
      const { selector } = action.payload;

      const element = document.querySelector(selector);
      if (element == null) {
        return action.reply(null);
      }

      if (!(element instanceof HTMLElement)) {
        return action.reply(null);
      }

      element.click();

      return action.reply(null);
    },
  );
}
