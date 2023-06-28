import { ipcMain } from "electron";
import { AppChannels, AppChannelParams, AppChannelReturn } from "./channels";

export function handleIPC<C extends keyof AppChannels>(channel: C, handler: (event: Electron.IpcMainInvokeEvent, ...args: AppChannelParams<C>) => Promise<AppChannelReturn<C>>) {
  ipcMain.handle(channel, handler as () => any);
}