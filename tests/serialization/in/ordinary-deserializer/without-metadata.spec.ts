import fs from "node:fs/promises";
import { OrdinaryDeserializer } from "src/lib/serialization/in/impl/ordinary-deserializer";
import { describe, test, expect } from "vitest";
import path from "node:path";
import { ExtraDutyTable, Gender, Month } from "src/lib/structs";
import {
  WorkerRegistry,
  WorkerRegistryInit,
  WorkerRegistryMap,
  WorkerRegistryRepository,
} from "src/lib/persistence/entities";

class MockWorkerRegistryRepository implements WorkerRegistryRepository {
  constructor(readonly registries: WorkerRegistry[]) {}

  create(registry: WorkerRegistryInit): Promise<WorkerRegistry> {
    throw new Error("Method not implemented.");
  }

  update(
    workerId: string,
    changes: Partial<WorkerRegistryInit>,
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }

  delete(workerId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  list(): Promise<WorkerRegistry[]> {
    throw new Error("Method not implemented.");
  }

  async load(): Promise<WorkerRegistryMap> {
    return new WorkerRegistryMap(this.registries);
  }
}

describe(OrdinaryDeserializer, () => {
  test("#deserialize should transform xlsx into a ExtraDutyTable", async () => {
    const buff = await fs.readFile(
      path.join(
        process.cwd(),
        "tests/.input/serialization/in/ordinary-deserializer/without-metadata.xlsx",
      ),
    );

    const deserializer = new OrdinaryDeserializer({
      month: new Month(2025, 0),
      workerRegistryRepository: new MockWorkerRegistryRepository([
        {
          createdAtVersion: 1,
          gender: "M",
          individualId: "1",
          name: "John Due",
          workerId: "12-3",
        },
        {
          createdAtVersion: 1,
          gender: "F",
          individualId: "2",
          name: "",
          workerId: "13-3",
        },
      ]),
    });

    const table = await deserializer.deserialize(buff);

    expect(table).toBeInstanceOf(ExtraDutyTable);

    const worker0 = table.workers.get(12_3)!;

    expect(worker0).toBeDefined();
    expect(worker0.gender).toBe("male" satisfies Gender);
    expect(worker0.config.individualId).toBe(1);

    const worker1 = table.workers.get(13_3)!;

    expect(worker1).toBeDefined();
    expect(worker1.gender).toBe("female" satisfies Gender);
    expect(worker1.config.individualId).toBe(2);
  });
});
