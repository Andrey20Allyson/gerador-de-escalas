import NodeWebSocket from "ws";

export type RawData = string | Buffer;
export type BufferListener = (data: RawData) => void;
export type ConnectionListener = () => void;
export type ConnectionCloseListener = () => void;
export type Unsubscriber = () => void;

export interface BufferIO {
  send(buffer: RawData): void;
  listen(listener: BufferListener): void;
  connected(listener: ConnectionListener): Unsubscriber;
  closed(listener: ConnectionCloseListener): Unsubscriber;
  close(): void;
}

export type JsonListener<T = any> = (data: T) => void;

export class JsonIO<T = any> {
  constructor(private readonly io: BufferIO) {}

  send(data: T) {
    const buffer = JSON.stringify(data);

    this.io.send(buffer);
  }

  listen(listener: JsonListener<T>) {
    this.io.listen((data) => {
      let text: string;
      if (typeof data === "string") {
        text = data;
      } else if (global.Buffer && data instanceof global.Buffer) {
        text = data.toString("utf-8");
      } else {
        throw new TypeError(
          `unhandled case for data type ${data.constructor.name}`,
        );
      }

      const json = JSON.parse(text);

      listener(json);
    });
  }

  connected(listener: ConnectionListener): Unsubscriber {
    return this.io.connected(listener);
  }

  closed(listener: ConnectionCloseListener): Unsubscriber {
    return this.io.closed(listener);
  }

  close() {
    this.io.close();
  }

  static from(ws: NodeWebSocket | WebSocket) {
    const bufferIO: BufferIO =
      ws instanceof NodeWebSocket
        ? new NodeBufferIO(ws)
        : new BrowserBufferIO(ws);

    return new JsonIO(bufferIO);
  }
}

class NodeBufferIO implements BufferIO {
  constructor(readonly ws: NodeWebSocket) {}

  listen(listener: BufferListener) {
    this.ws.on("message", (data) => {
      if (data instanceof Buffer) {
        return listener(data);
      }

      throw new TypeError("unhandled message type");
    });
  }

  send(buffer: RawData) {
    this.ws.send(buffer);
  }

  connected(listener: ConnectionListener): Unsubscriber {
    this.ws.on("open", listener);

    return () => this.ws.removeListener("open", listener);
  }

  closed(listener: ConnectionCloseListener): Unsubscriber {
    this.ws.on("close", listener);

    return () => this.ws.removeListener("close", listener);
  }

  close(): void {
    this.ws.close();
  }
}

class BrowserBufferIO implements BufferIO {
  constructor(readonly ws: WebSocket) {}

  listen(listener: BufferListener) {
    this.ws.addEventListener("message", (ev) => {
      listener(ev.data as string);
    });
  }

  send(buffer: RawData) {
    this.ws.send(buffer);
  }

  connected(listener: ConnectionListener): Unsubscriber {
    this.ws.addEventListener("open", () => {
      listener();
    });

    return () => this.ws.removeEventListener("open", listener);
  }

  closed(listener: ConnectionCloseListener): Unsubscriber {
    this.ws.addEventListener("close", listener);

    return () => this.ws.removeEventListener("close", listener);
  }

  close(): void {
    this.ws.close();
  }
}
