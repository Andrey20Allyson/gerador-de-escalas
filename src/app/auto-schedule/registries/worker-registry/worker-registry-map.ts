import { WorkerRegistry } from '.';

export interface ScrappeRegistriesOptions {
  sheetName?: string;
}

export class WorkerRegistryMap implements Iterable<WorkerRegistry> {
  private map: Map<string, WorkerRegistry>;

  constructor(registries: WorkerRegistry[]) {
    const entries = registries.map(registry => [registry.workerId, registry] as const);

    this.map = new Map(entries);
  }

  get(workerId: string): WorkerRegistry {
    const registry = this.map.get(workerId);

    if (registry == null) {
      throw new Error(`Can't find workerID "${workerId}"`);
    }

    return registry;
  }

  has(workerID: string) {
    return this.map.has(workerID);
  }

  workers(): WorkerRegistry[] {
    const workers = Array.from(this.map.values());

    return workers;
  }

  [Symbol.iterator](): Iterator<WorkerRegistry> {
    return this.map.values();
  }
}
