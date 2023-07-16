import { AppAssets } from "../assets";
import { AppHandler } from "../channels";
import { TableGenerator } from "../table-generation/table-generator";

export function createGeneratorHandler(assets: AppAssets): AppHandler['generator'] {
  const { holidays, serializer, workerRegistryMap } = assets;
  const generator = new TableGenerator();

  return {
    async clear(ev) {
      throw new Error('Method not implemented');
    },

    async generate(ev) {
      throw new Error('Method not implemented');
    },

    async getWorkerInfo(ev) {
      throw new Error('Method not implemented');
    },

    async load(ev, payload) {
      throw new Error('Method not implemented');
    },

    async serialize(ev) {
      throw new Error('Method not implemented');
    },
  }
}