import { WorkerRegistry, WorkerRegistryInit, WorkerRegistryMap, WorkerRegistryRepository } from "../../entities/worker-registry";
import { ChunkNotFoundError, WorkerRegistryChunkStorage } from "./chunk-storage";

export interface WorkerRegistryRepositoryOptions {
    firestore: FirebaseFirestore.Firestore;
    cacheOnly?: boolean;
}

export class FirestoreWorkerRegistryRepository implements WorkerRegistryRepository {
    readonly cacheOnly: boolean;
    readonly storage: WorkerRegistryChunkStorage;

    constructor(options: WorkerRegistryRepositoryOptions) {
        const collection = options.firestore.collection('worker-registries');

        this.storage = new WorkerRegistryChunkStorage(collection);

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