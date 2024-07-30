export type WorkerRegistryGender = 'F' | 'M';

export type WorkerRegistry = WorkerRegistryInit & {
  readonly createdAtVersion: number;
}

export type AllowedInterval = { 
  readonly start: number;
  readonly end: number;
}

export type WorkerRegistryAllowedIntervalsRule = {
  readonly tag: 'allowed-intervals';
  readonly intervals: AllowedInterval[];
}

export type WorkerRegistryRule = WorkerRegistryAllowedIntervalsRule;

export type WorkerRegistryInit = {
  readonly workerId: string;
  readonly name: string;
  readonly gender: WorkerRegistryGender;
  readonly individualId: string;
  readonly isCoordinator?: boolean;
  readonly rules?: WorkerRegistryRule[];
}

export interface WorkerRegistryRepository {
  create(registry: WorkerRegistryInit): Promise<WorkerRegistry>;
  update(workerId: string, changes: Partial<WorkerRegistryInit>): Promise<void>;
  delete(workerId: string): Promise<void>;
  list(): Promise<WorkerRegistry[]>;
  load(): Promise<WorkerRegistryMap>;
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
