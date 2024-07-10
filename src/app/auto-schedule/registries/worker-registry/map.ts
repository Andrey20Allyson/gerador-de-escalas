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

  get(workerId: string): WorkerRegistry | undefined {
    const registry = this.map.get(workerId);

    return registry;
  }

  has(workerId: string) {
    return this.map.has(workerId);
  }

  workers(): WorkerRegistry[] {
    const workers = Array.from(this.map.values());

    return workers;
  }

  [Symbol.iterator](): Iterator<WorkerRegistry> {
    return this.map.values();
  }
}
