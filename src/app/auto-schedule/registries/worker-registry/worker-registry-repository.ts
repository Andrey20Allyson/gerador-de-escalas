import { WorkerRegistry, WorkerRegistryInit } from ".";
import { ChunkNotFoundError, WorkerRegistryChunkStorage } from "./chunk-storage";
import { FirebaseWorkerRegistryLoaderOptions } from "./loader";
import { WorkerRegistryMap } from "./worker-registry-map";

export interface WorkerRegistryRepositoryOptions {
    collection: FirebaseFirestore.CollectionReference;
    cacheOnly?: boolean;
}

export class WorkerRegistryRepository {
    readonly cacheOnly: boolean;
    readonly storage: WorkerRegistryChunkStorage;

    constructor(options: WorkerRegistryRepositoryOptions) {
        this.storage = new WorkerRegistryChunkStorage(options.collection);

        this.cacheOnly = options.cacheOnly ?? false;
    }

    async create(registry: WorkerRegistryInit): Promise<WorkerRegistry> {
        const chunk = await this.storage.get(0);

        chunk.add(registry);

        await chunk.persist();

        const persistedRegistry = chunk
            .registries()
            .find(persistedRegistry => persistedRegistry.workerId === registry.workerId)!;

        return persistedRegistry;
    }

    async update(workerId: string, changes: Partial<WorkerRegistryInit>): Promise<void> {
        const chunk = await this.storage.get(0);

        const persistedRegistry = chunk.findById(workerId);

        if (persistedRegistry == null) {
            throw new Error(`Worker with id ${workerId} do not exists!`);
        }

        const changedRegistry: WorkerRegistry = {
            ...persistedRegistry,
            ...changes,
            workerId,
        }

        chunk.update(changedRegistry);
    }

    async delete(workerId: string): Promise<void> {
        const chunk = await this.storage.get(0);

        chunk.delete(workerId);

        await chunk.persist();
    }

    async list(): Promise<WorkerRegistry[]> {
        if (this.cacheOnly) {
            const chunk = await this.storage.fromCache(0)
            if (chunk == null) {
                return ChunkNotFoundError.reject(0);
            }

            return chunk.registries();
        }

        const chunk = await this.storage.get(0);

        return chunk.registries();
    }

    async load(): Promise<WorkerRegistryMap> {
        const registries = await this.list();

        const registryMap = new WorkerRegistryMap(registries);

        return registryMap;
    }
}