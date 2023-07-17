import { io } from '@andrey-allyson/escalas-automaticas';
import { ipcMain } from 'electron';
import fs from 'fs/promises';
import { IPCHandlerConsumer } from './app.ipc';
import { loadAssets } from './assets';
import { createAPIHandler } from './ipc-handlers';

io.setFileSystem(fs);

export async function loadAPI(debug = false) {
  const assets = await loadAssets();

  const handlerObject = createAPIHandler(assets);

  const ipcHandler = new IPCHandlerConsumer(handlerObject);

  ipcHandler.listen(ipcMain);
}