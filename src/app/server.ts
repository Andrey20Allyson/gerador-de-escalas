import express from 'express';
import { fromRoot } from './root-path';

export function createServer(host: string, port = 80) {
  const server = express();

  server.use(express.static(fromRoot('./public')));

  const listen = new Promise<void>(resolve => {
    server.listen(port, host, resolve);
  });

  return {
    server,
    listen,
  }
}