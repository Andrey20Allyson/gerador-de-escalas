import { io } from "src/lib";
import { ipcMain } from "electron";
import fs from "fs/promises";
import { AppAssets } from "./assets";
import { APIHandler } from "./ipc";
import { IpcHandlerConsumer } from "./mapping/app";

io.setFileSystem(fs);

export async function loadAPI(debug = false) {
  const assets = new AppAssets();

  const handlerFactory = new APIHandler(assets);

  const ipcHandler = new IpcHandlerConsumer(handlerFactory);

  ipcHandler.listen(ipcMain);
}
