import { RemoteActionIO } from "./infra/remote-actions";

export function setupTestWebSocket() {
  const ws = new WebSocket("ws://localhost:7575");

  const actions = RemoteActionIO.from(ws);

  actions.ready(() => {
    actions.addTag("renderer");

    actions.call("say:hi", "hello world");
  });
}
