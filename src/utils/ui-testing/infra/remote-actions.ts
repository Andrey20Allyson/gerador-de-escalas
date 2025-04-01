import chalk from "chalk";
import { JsonIO, Unsubscriber } from "./json-io";
import NodeWebSocket from "ws";
import {
  CancellablePromise,
  PromiseCanceller,
  timeoutCanceller,
} from "src/utils/promise";
import { random } from "src/utils/random";

export interface Action {
  action: string;
  payload: any;
  meta: ActionMeta;
}

export interface ActionMeta {
  executionId: string;
  expectsReply: boolean;
}

export type ActionHandler<P = any, R = any> = (
  action: ActionController<P, R>,
) => void | Promise<void>;
export type ReadyListener = () => Promise<void> | void;
export type ClosedListener = () => Promise<void> | void;

export class ActionController<P = any, R = any> {
  ended: boolean = false;
  replyPayload: R | null = null;

  constructor(
    readonly name: string,
    readonly payload: P,
    readonly meta: ActionMeta,
  ) {}

  reply(payload: R) {
    this.replyPayload = payload;

    this.end();
  }

  end() {
    this.ended = true;
  }

  toDTO(): Action {
    return {
      action: this.name,
      payload: this.payload,
      meta: this.meta,
    };
  }

  asReply(): ActionController {
    return new ActionController(
      `${this.name}@return:${this.meta.executionId}`,
      this.replyPayload,
      {
        ...this.meta,
        expectsReply: false,
      },
    );
  }
}

export class HandlerMap {
  private _handlers: Map<string, ActionHandler> = new Map();

  constructor(readonly action: string) {}

  get(id: string) {
    return this._handlers.get(id);
  }

  add(id: string, handler: ActionHandler): Unsubscriber {
    this._handlers.set(id, handler);

    return () => this._handlers.delete(id);
  }

  delete(id: string) {
    return this._handlers.delete(id);
  }

  iter() {
    return this._handlers.values();
  }
}

export interface RemoteActionCaller {
  call<P = any, R = any>(name: string, payload: P): Promise<R>;
  close(): void;
}

export class RemoteActionIO implements RemoteActionCaller {
  private handlers = new Map<string, HandlerMap>();
  private tags: Set<string> = new Set();
  private isDebug: boolean = false;
  id: string = "";

  constructor(private readonly io: JsonIO<Action>) {
    this.io.listen((data) => {
      const action = new ActionController(data.action, data.payload, data.meta);

      this.log(chalk.redBright(`action reviced by ${this.id}:`), action.name);

      this._receive(action);
    });

    this.handle("init", (action) => {
      this.id = action.payload.id;

      //   this._receive(new ActionController("ready", null, action.meta));

      action.end();
    });

    this.handle("add-tag", (action) => {
      this.tags.add(action.payload.tag);
    });

    this.handle("delete-tag", (action) => {
      this.tags.delete(action.payload.tag);
    });
  }

  setDebug(active: boolean) {
    this.isDebug = active;
  }

  private log(...args: any[]) {
    if (this.isDebug) {
      this.log(...args);
    }
  }

  private async _receive(action: ActionController) {
    const handlerMap = this.handlers.get(action.name);

    if (handlerMap != null) {
      await this._callHandlers(handlerMap.iter(), action);
    }

    if (action.meta.expectsReply) {
      this.log(chalk.blueBright(`sending reply to ${action.name}`));
      this._returnAction(action);
    }
  }

  private async _callHandlers(
    handlers: Iterable<ActionHandler>,
    action: ActionController,
  ) {
    for (const handler of handlers) {
      try {
        await handler(action);
      } catch (error) {}

      if (action.ended) {
        break;
      }
    }
  }

  async init() {
    this.id = random.id();

    await this.call("init", { id: this.id });

    this.notify("ready", null);
  }

  async addTag(tag: string) {
    if (this.tags.has(tag)) {
      return;
    }

    this.tags.add(tag);
    await this.call("add-tag", { tag });
  }

  async deleteTag(tag: string) {
    if (!this.tags.has(tag)) {
      return;
    }

    this.tags.delete(tag);
    await this.call("delete-tag", { tag });
  }

  getTags() {
    return Array.from(this.tags);
  }

  call<P = any, R = any>(name: string, payload: P): Promise<R> {
    const action = new ActionController(name, payload, {
      executionId: random.id(),
      expectsReply: true,
    });

    this.io.send(action.toDTO());

    const actionReply = action.asReply();

    return new CancellablePromise<R>((res) => {
      const unsub = this.once(actionReply.name, (action) => {
        this.log("reply:", action.name, action.payload);
        res(action.payload);
      });

      return unsub;
    })
      .use(timeoutCanceller(30_000))
      .use(disconnectionCanceller(this.io));
  }

  notify<P = any>(name: string, payload: P) {
    const action = new ActionController(name, payload, {
      executionId: random.id(),
      expectsReply: false,
    });

    this.io.send(action.toDTO());
  }

  private _returnAction(action: ActionController) {
    this.io.send(action.asReply().toDTO());
  }

  handle<P = any, R = any>(action: string, handler: ActionHandler<P, R>) {
    let handlerMap = this.handlers.get(action);

    if (handlerMap == null) {
      handlerMap = new HandlerMap(action);

      this.handlers.set(action, handlerMap);
    }

    const id = random.id();

    const unsub = handlerMap.add(id, handler);

    return unsub;
  }

  once(action: string, handler: ActionHandler) {
    const unsub = this.handle(action, (...args) => {
      unsub();
      return handler(...args);
    });

    return unsub;
  }

  ready(listener: ReadyListener) {
    this.handle("ready", async () => {
      try {
        await listener();
      } catch (error) {
        console.log(chalk.redBright("Unhandled error in ready listener"));
        console.log(error);

        throw error;
      }
    });
  }

  closed(listener: ClosedListener) {
    this.io.closed(listener);
  }

  close() {
    this.io.close();
  }

  asReady(): Promise<RemoteActionIO> {
    return new Promise((res) => {
      if (this.id !== "") {
        return res(this);
      }

      this.once("ready", () => res(this));
    });
  }

  static from(ws: NodeWebSocket | WebSocket) {
    return new RemoteActionIO(JsonIO.from(ws));
  }
}

export function disconnectionCanceller(io: JsonIO): PromiseCanceller {
  return (promise) => {
    const unsub = io.closed(() => {
      promise.cancel(new Error("disconnected"));
    });

    return unsub;
  };
}
