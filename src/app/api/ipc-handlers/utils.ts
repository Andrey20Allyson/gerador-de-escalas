import { io } from "@andrey-allyson/escalas-automaticas";
import { AppUtilsHandler } from ".";

export function createUtilsHandler(): AppUtilsHandler {
  return {
    async getSheetNames(ev, filePath) {
      return { ok: true, data: await io.loadSheetNames(filePath) };
    },
  };
}