import { BrowserWindow, ipcMain } from "electron";
import { AppAssets } from "./assets";
import { APIHandler } from "./controllers";
import { IpcHandlerConsumer } from "./mapping/app";

export async function loadAPI(mainWindow: BrowserWindow, debug = false) {
  const assets = new AppAssets(mainWindow);

  const handlerFactory = new APIHandler(assets);

  const ipcHandler = new IpcHandlerConsumer(handlerFactory);

  ipcHandler.listen(ipcMain);
}
