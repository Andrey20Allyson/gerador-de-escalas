import { WorkerRegistry } from ".";
import { adminFirestore } from "../../firebase";
import { Loader } from "../loader";
import { ChunkNotFoundError, WorkerRegistryChunkStorage } from "./chunk-storage";
import { WorkerRegistryMap } from "./map";

export interface FirebaseWorkerRegistryLoaderOptions {
  cacheOnly?: boolean;
  collection?: FirebaseFirestore.CollectionReference;
}

export class FirebaseWorkerRegistryLoader implements Loader<WorkerRegistryMap> {
  readonly storage: WorkerRegistryChunkStorage;
  readonly cacheOnly: boolean;

  constructor(options?: FirebaseWorkerRegistryLoaderOptions) {
    const collection = options?.collection ?? adminFirestore.collection('worker-registries');

    this.storage = new WorkerRegistryChunkStorage(collection);

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