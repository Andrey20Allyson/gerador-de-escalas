import { RemoteActionIO } from "./infra/remote-actions";
import { handleClickIntoElementAction } from "./test-development-kit/ui-handling/element.click";
import { handleGetElementAction } from "./test-development-kit/ui-handling/get-element";

export function setupTestWebSocket() {
  const ws = new WebSocket("ws://localhost:7575");

  const actions = RemoteActionIO.from(ws);

  actions.ready(async () => {
    await actions.addTag("ui");

    handleGetElementAction(actions);
    handleClickIntoElementAction(actions);
  });
}
