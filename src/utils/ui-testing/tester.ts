import NodeWebSocket from "ws";
import { RemoteActionIO } from "./infra/remote-actions";

export function setupTester() {
  const ws = new NodeWebSocket("ws://localhost:7575");

  const actions = RemoteActionIO.from(ws);

  actions.ready(async () => {
    try {
      const result = await actions.call<string>(
        "say:hi",
        "hello world from tester",
      );

      console.log({ result });
    } catch (error) {
      console.log(error);
    }

    actions.close();
  });
}

setupTester();
