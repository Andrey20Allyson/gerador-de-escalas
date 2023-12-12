import type {
  DayRestriction,
  ExtraDuty,
  ExtraDutyTableConfig,
  ExtraDutyTableV2,
  Gender,
  Graduation,
  WorkerInfo
} from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";
import { WorkerInsertionRulesState } from "../table-edition";

export interface OrdinaryInfo {
  readonly isDailyWorker: boolean;
  readonly timeOffEnd: number;
  readonly startsAt: number;
  readonly endsAt: number;
  readonly duration: number;
}

export interface WorkerData {
  readonly id: number;
  readonly workerId: number;
  readonly individualId: number;
  readonly name: string;
  readonly graduation: Graduation;
  readonly gender: Gender;
  readonly restrictions: DayRestriction[];
  readonly ordinary: OrdinaryInfo;
}

export interface DutyData {
  readonly id: number;
  readonly day: number;
  readonly index: number;
}

export interface TableConfig extends ExtraDutyTableConfig {
  readonly numOfDays: number;
  readonly dutiesPerDay: number;
  readonly workerCapacity: number;
}

export interface DutyAndWorkerRelationship {
  readonly id: number;
  readonly workerId: number;
  readonly dutyId: number;
}

export interface TableData {
  idCounters: Record<string, number>;
  workers: WorkerData[];
  duties: DutyData[];
  rules: WorkerInsertionRulesState;
  dutyAndWorkerRelationships: DutyAndWorkerRelationship[];
  readonly config: TableConfig;
}

export class TableFactory {
  readonly BASE_WORKER_CAPACITY = 10;

  constructor(
    readonly idGenerator: IdGenerator = new IdGenerator(),
  ) { }

  createTableData(table: ExtraDutyTableV2): TableData {

    return {
      idCounters: this.idGenerator.counters,
      duties: [],
      workers: [],
      rules: {
        femaleRule: true,
        inspRule: true,
        ordinaryRule: true,
        timeOffRule: true,
      },
      config: {
        ...table.config,
        dutyCapacity: 3,
        dutiesPerDay: Math.floor(24 / table.config.dutyDuration),
        numOfDays: table.width,
        workerCapacity: Math.trunc(this.BASE_WORKER_CAPACITY / table.config.dutyPositionSize),
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
    const { workTime, daysOfWork } = worker;

    const endsAt = workTime.startTime + workTime.totalTime;

    return {
      workerId: worker.fullWorkerID,
      ordinary: {
        endsAt,
        timeOffEnd: endsAt + workTime.totalTime,
        isDailyWorker: daysOfWork.isDailyWorker,
        startsAt: workTime.startTime,
        duration: workTime.totalTime,
      },
      restrictions: Array.from(daysOfWork.values()),
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

        tableData.dutyAndWorkerRelationships.push(this.createDutyAndWorkerRelationship(workerData.id, dutyData.id));
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
    readonly counters: Record<string, number> = {},
  ) { }

  next(name: string) {
    let id = this.counters[name];
    if (id === undefined) {
      id = 0;
    }

    this.counters[name] = id + 1;

    return id;
  }
}