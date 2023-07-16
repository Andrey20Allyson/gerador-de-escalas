import { io } from "@andrey-allyson/escalas-automaticas";
import { AppHandler } from "../channels";

export function createUtilsHandler(): AppHandler['utils'] {
  return {
    async getSheetNames(ev, filePath) {
      return { ok: true, data: await io.loadSheetNames(filePath) };
    },
  };
}