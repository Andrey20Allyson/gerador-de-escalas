import { io } from '@andrey-allyson/escalas-automaticas';
import { ipcMain } from 'electron';
import fs from 'fs/promises';
import { loadAssets } from './assets';
import { IpcHandlerConsumer } from './mapping/app';
import { APIHandler } from './ipc';

io.setFileSystem(fs);

export async function loadAPI(debug = false) {
  const assets = await loadAssets();

  const handlerFactory = new APIHandler(assets);

  const ipcHandler = new IpcHandlerConsumer(handlerFactory);

  ipcHandler.listen(ipcMain);
}