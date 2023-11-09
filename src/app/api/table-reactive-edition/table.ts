import type { ExtraDuty, ExtraDutyTableV2, Gender, Graduation, WorkerInfo } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";

export interface WorkerData {
  id: number;
  workerId: number;
  individualId: number;
  name: string;
  graduation: Graduation;
  gender: Gender;
}

export interface DutyData {
  id: number;
  day: number;
  index: number;
}

export interface TableConfig {
  year: number;
  month: number;
  dutyCapacity: number;
}

export interface DutyAndWorkerRelationship {
  id: number;
  workerId: number;
  dutyId: number;
}

export interface TableData {
  idCounters: Map<string, number>;
  workers: WorkerData[];
  duties: DutyData[];
  dutyAndWorkerRelationships: DutyAndWorkerRelationship[];
  config: TableConfig;
}

export class TableFactory {
  constructor(
    readonly idGenerator: IdGenerator = new IdGenerator(),
  ) { }

  createTableData(table: ExtraDutyTableV2): TableData {
    return {
      idCounters: this.idGenerator.counters,
      duties: [],
      workers: [],
      config: {
        dutyCapacity: table.config.dutyCapacity,
        month: table.config.month,
        year: table.config.year,
      },
      dutyAndWorkerRelationships: [],
    };
  }

  createDutyData(duty: ExtraDuty): DutyData {
    return {
      day: duty.day,
      id: this.idGenerator.next('duty'),
      index: duty.index,
    };
  }

  createWorkerData(worker: WorkerInfo): WorkerData {
    return {
      workerId: worker.fullWorkerID,
      gender: worker.gender,
      graduation: worker.graduation,
      id: this.idGenerator.next('worker'),
      individualId: worker.config.individualRegistry,
      name: worker.name,
    };
  }

  createDutyAndWorkerRelationship(workerId: number, dutyId: number): DutyAndWorkerRelationship {
    return {
      dutyId,
      workerId,
      id: this.idGenerator.next('duty-and-worker-relationship'),
    };
  }

  toDTO(table: ExtraDutyTableV2, workers: WorkerInfo[]): TableData {
    const tableData = this.createTableData(table);

    const workerDataMap: Map<number, WorkerData> = new Map();

    for (const worker of workers) {
      const workerData = this.createWorkerData(worker);

      tableData.workers.push(workerData);

      workerDataMap.set(worker.fullWorkerID, workerData);
    }

    for (const duty of table.iterDuties()) {
      const dutyData = this.createDutyData(duty);

      tableData.duties.push(dutyData);

      for (const [_, worker] of duty) {
        const workerData = workerDataMap.get(worker.fullWorkerID);
        if (workerData === undefined) continue;

        tableData.dutyAndWorkerRelationships.push();
      }
    }

    return tableData;
  }

  fromDTO(tableData: TableData, table: ExtraDutyTableV2, workers: WorkerInfo[]): ExtraDutyTableV2 {
    table.clear();

    const dutyDataMap = new Map(tableData.duties.map(duty => [duty.id, duty]));
    const workerDataMap = new Map(tableData.workers.map(worker => [worker.id, worker]));
    const workerInfoMap = new Map(workers.map(worker => [worker.fullWorkerID, worker]));

    for (const relationship of tableData.dutyAndWorkerRelationships) {
      const dutyData = dutyDataMap.get(relationship.dutyId);
      const workerData = workerDataMap.get(relationship.workerId);
      if (dutyData === undefined || workerData === undefined) continue;

      const workerInfo = workerInfoMap.get(workerData.workerId);
      if (workerInfo === undefined) continue;

      table
        .getDay(dutyData.day)
        .getDuty(dutyData.index)
        .add(workerInfo);
    }

    return table;
  }
}

export class IdGenerator {
  constructor(
    readonly counters: Map<string, number> = new Map(),
  ) { }

  next(name: string) {
    let id = this.counters.get(name);
    if (id === undefined) {
      id = 0;
    }

    this.counters.set(name, id + 1);

    return id;
  }
}