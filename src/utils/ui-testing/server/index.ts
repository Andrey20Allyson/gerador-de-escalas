import WebSocket from "ws";
import { RemoteActionIO } from "../infra/remote-actions";
import chalk from "chalk";

const clients = new Map<string, RemoteActionIO>();
const taggedClients = new Map<string, Set<string>>();

export function startServer(onStart?: () => void) {
  const wss = new WebSocket.Server({ host: "localhost", port: 7575 });

  wss.on("connection", handleSocketConnection);

  if (onStart) {
    wss.on("listening", onStart);
  }

  return wss;
}

async function handleSocketConnection(ws: WebSocket) {
  ws.on("message", (data) => {
    if (data instanceof Buffer) {
      console.log(
        chalk.greenBright(`client ${actions.id} sended:`),
        data.toString("utf-8"),
      );
    }
  });

  ws.on("close", () => {
    clients.delete(actions.id);
  });

  const actions = RemoteActionIO.from(ws);

  await handleClientConnection(actions);

  function deleteFromTagged(actions: RemoteActionIO, tag: string) {}
}

async function handleClientConnection(actions: RemoteActionIO) {
  await actions.init();

  actions.handle("add-tag", (action) => {
    const { tag } = action.payload;

    let ids = taggedClients.get(tag);

    if (ids == null) {
      ids = new Set();

      taggedClients.set(tag, ids);
    }

    ids.add(actions.id);

    console.log(taggedClients);
  });

  actions.handle("say:hi", async (action) => {
    await new Promise(() => {});

    action.reply({ abc: "hello" });
  });

  clients.set(actions.id, actions);
}

startServer(() => {
  console.log("websocket server started on port 7575");
});
