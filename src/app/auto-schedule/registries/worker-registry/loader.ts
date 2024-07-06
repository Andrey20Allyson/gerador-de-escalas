import { WorkerRegistry } from ".";
import { Loader } from "../loader";
import { ChunkNotFoundError, WorkerRegistryChunkStorage } from "./chunk-storage";
import { WorkerRegistryMap } from "./worker-registry-map";

export interface FirebaseWorkerRegistryLoaderOptions {
  cacheOnly?: boolean;
}

export class FirebaseWorkerRegistryLoader implements Loader<WorkerRegistryMap> {
  readonly storage: WorkerRegistryChunkStorage;
  readonly cacheOnly: boolean;

  constructor(options?: FirebaseWorkerRegistryLoaderOptions) {
    this.storage = new WorkerRegistryChunkStorage();

    this.cacheOnly = options?.cacheOnly ?? false;
  }

  async load(): Promise<WorkerRegistryMap> {
    if (this.cacheOnly) {
      const chunk = await this.storage
        .fromCache(0)
        .then(chunk => chunk ?? ChunkNotFoundError.reject(0));

      return new WorkerRegistryMap(chunk.registries());
    }

    const chunk = await this.storage.get(0);

    return new WorkerRegistryMap(chunk.registries());
  }
}