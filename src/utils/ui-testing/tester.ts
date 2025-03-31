import NodeWebSocket from "ws";
import { RemoteActionIO } from "./infra/remote-actions";
import { RemoteActionIOProxy } from "./infra/remote-actions-proxy";

export function setupTester() {
  const ws = new NodeWebSocket("ws://localhost:7575");

  const actions = RemoteActionIO.from(ws);

  actions.ready(async () => {
    try {
      const proxy = await RemoteActionIOProxy.fromTag(actions, "ui");

      console.log(proxy);
    } catch (error) {
      console.log(error);
    }

    actions.close();
  });
}

setupTester();
