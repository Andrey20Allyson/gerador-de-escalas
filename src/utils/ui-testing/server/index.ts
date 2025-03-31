import WebSocket from "ws";
import {
  Action,
  ActionController,
  RemoteActionIO,
} from "../infra/remote-actions";
import chalk from "chalk";
import { ProxyCallPayload } from "../infra/remote-actions-proxy";

const clients = new Map<string, RemoteActionIO>();
const taggedClients = new Map<string, Set<string>>();
const isDebug = false;

function log(...args: any[]) {
  if (isDebug) {
    console.log(...args);
  }
}

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
      log(
        chalk.greenBright(`client ${actions.id} sended:`),
        data.toString("utf-8"),
      );
    }
  });

  const actions = RemoteActionIO.from(ws);

  await handleClientConnection(actions);
}

interface TagListPayload {
  tag: string;
}

interface TagListReply {
  actionIds: string[] | null;
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

    log(taggedClients);
  });

  actions.handle("say:hi", async (action) => {
    action.reply({ abc: "hello" });
  });

  actions.handle(
    "tag:list",
    async (action: ActionController<TagListPayload, TagListReply>) => {
      const tag = action.payload.tag;

      const tagSet = taggedClients.get(tag);
      if (tagSet == null || tagSet.size == 0) {
        return action.reply({ actionIds: null });
      }

      const actionIds = Array.from(tagSet.values());

      action.reply({ actionIds });
    },
  );

  actions.handle(
    "proxy:call",
    async (action: ActionController<ProxyCallPayload>) => {
      const { proxyId, proxyAction } = action.payload;

      const target = clients.get(proxyId);
      if (target == null) {
        return action.reply(null);
      }

      const response = await target.call(proxyAction.name, proxyAction.payload);

      action.reply(response);
    },
  );

  clients.set(actions.id, actions);

  actions.closed(() => {
    handleConnectionClose(actions);
  });
}

function handleConnectionClose(actions: RemoteActionIO) {
  log(`connection to actions ${actions.id} has been closed`);

  clients.delete(actions.id);

  for (const tag of actions.getTags()) {
    const ids = taggedClients.get(tag);
    if (ids == null) {
      continue;
    }

    ids.delete(actions.id);
  }
}
