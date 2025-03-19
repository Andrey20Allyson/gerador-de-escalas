import { RemoteActionIO } from "./infra/remote-actions";

export function setupTestWebSocket() {
  const ws = new WebSocket("ws://localhost:7575");

  const actions = RemoteActionIO.from(ws);

  actions.ready(async () => {
    await actions.addTag("ui");

    await actions.call("say:hi", "hello world");
  });
}
