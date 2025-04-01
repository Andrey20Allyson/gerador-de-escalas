import { RemoteActionIO } from "../../infra/remote-actions";
import { GetElementPayload, GetElementReply } from "../dtos/element.get";

export function handleGetElementAction(actions: RemoteActionIO) {
  actions.handle<GetElementPayload, GetElementReply>(
    "ui:select-element",
    (action) => {
      const { selector } = action.payload;

      const element = document.querySelector(selector);
      if (element == null) {
        return action.reply({ hasFound: false });
      }

      return action.reply({ hasFound: true });
    },
  );
}
