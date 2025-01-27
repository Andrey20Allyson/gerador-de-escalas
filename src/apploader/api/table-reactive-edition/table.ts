import {
  DayRestriction,
  ExtraDuty,
  ExtraDutyTable,
  Gender,
  Graduation,
  WorkerInfo,
  DayOfExtraDuty,
  DaysOfWork,
  Month,
  WorkerIdentifier,
  WorkTime,
  WorkLimit,
} from "src/lib/structs";
import { WorkerInsertionRulesState } from "../table-edition";
import { ScheduleType } from "../controllers";
import { ScheduleFileInfo } from "src/lib/serialization";

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
  readonly workerPreId: number;
  readonly workerPostId: number;
  readonly individualId: number;
  readonly name: string;
  readonly graduation: Graduation;
  readonly gender: Gender;
  readonly restrictions: DayRestriction[];
  readonly ordinary: OrdinaryInfo;
  readonly workLimit: number;
}

export interface DateData {
  readonly key: string;
  readonly index: number;
  readonly day: number;
  readonly month: number;
  readonly year: number;
}

export interface DutyData {
  readonly id: number;
  readonly date: DateData;
  readonly key: string;
  readonly index: number;
  readonly active: boolean;
  readonly start: number;
  readonly end: number;
}

export interface TableStateConfig {
  readonly numOfDays: number;
  readonly dutiesPerDay: number;
  readonly workerCapacity: number;
  readonly dutyDuration: number;
  readonly firstDutyTime: number;
  readonly month: number;
  readonly year: number;
  dutyOffTimeToOrdinary: number;
  dutyPositionSize: number;
  dutyMinDistance: number;
  dutyCapacity: number;
  currentPlace: string;
}

export interface DutyAndWorkerRelationship {
  readonly id: number;
  readonly workerId: number;
  readonly dutyId: number;
}

export interface ScheduleFileSaveConfig {
  fileInfo: ScheduleFileInfo;
  path: string;
}

export interface ScheduleState {
  idCounters: Record<string, number>;
  workers: WorkerData[];
  duties: DutyData[];
  days: DateData[];
  rules: WorkerInsertionRulesState;
  dutyAndWorkerRelationships: DutyAndWorkerRelationship[];
  fileSaveConfig: ScheduleFileSaveConfig;
  readonly config: TableStateConfig;
}

export class TableFactory {
  readonly BASE_WORKER_CAPACITY = 10;

  constructor(readonly idGenerator: IdGenerator = new IdGenerator()) {}

  createTableData(
    table: ExtraDutyTable,
    fileSaveConfig: ScheduleFileSaveConfig,
  ): ScheduleState {
    return {
      idCounters: this.idGenerator.counters,
      duties: [],
      workers: [],
      days: [],
      rules: {
        femaleRule: true,
        inspRule: true,
        ordinaryRule: true,
        timeOffRule: true,
      },
      fileSaveConfig,
      config: {
        dutyCapacity: 3,
        dutiesPerDay: Math.floor(24 / table.config.dutyDuration),
        numOfDays: table.width,
        workerCapacity: Math.trunc(
          this.BASE_WORKER_CAPACITY / table.config.dutyPositionSize,
        ),
        currentPlace: table.config.currentPlace,
        dutyDuration: table.config.dutyDuration,
        dutyMinDistance: table.config.dutyMinDistance,
        dutyOffTimeToOrdinary: table.config.dutyOffTimeToOrdinary,
        dutyPositionSize: table.config.dutyPositionSize,
        firstDutyTime: table.config.firstDutyTime,
        month: table.config.month.index,
        year: table.config.month.year,
      },
      dutyAndWorkerRelationships: [],
    };
  }

  createDayData(dutyDay: DayOfExtraDuty): DateData {
    const day = dutyDay.date;

    return {
      key: day.toString(),
      index: dutyDay.index,
      day: day.index,
      month: day.month,
      year: day.year,
    };
  }

  createDutyData(duty: ExtraDuty): DutyData {
    const index = duty.index;

    const day = this.createDayData(duty.day);

    const key = `${index}:${day.key}`;

    const id = this.idGenerator.next("duty");

    return {
      id,
      date: day,
      key,
      index,
      active: duty.isActive(),
      start: duty.start,
      end: duty.end,
    };
  }

  createWorkerData(worker: WorkerInfo): WorkerData {
    const { workTime, daysOfWork } = worker;

    const endsAt = workTime.end;

    return {
      workerId: worker.id,
      ordinary: {
        endsAt,
        timeOffEnd: workTime.offTimeEnd,
        isDailyWorker: daysOfWork.isDailyWorker,
        startsAt: workTime.start,
        duration: workTime.duration,
      },
      restrictions: Array.from(daysOfWork.values()),
      gender: worker.gender,
      graduation: worker.graduation,
      id: this.idGenerator.next("worker"),
      individualId: worker.config.individualId,
      name: worker.name,
      workerPostId: worker.identifier.postId,
      workerPreId: worker.identifier.preId,
      workLimit: worker.limit.of("unknow"),
    };
  }

  createDutyAndWorkerRelationship(
    workerId: number,
    dutyId: number,
  ): DutyAndWorkerRelationship {
    return {
      dutyId,
      workerId,
      id: this.idGenerator.next("duty-and-worker-relationship"),
    };
  }

  intoState(
    table: ExtraDutyTable,
    fileSaveConfig: ScheduleFileSaveConfig,
  ): ScheduleState {
    const tableData = this.createTableData(table, fileSaveConfig);

    const workers = table.getWorkerList();
    const workerDataMap: Map<number, WorkerData> = new Map();

    for (const worker of workers) {
      const workerData = this.createWorkerData(worker);

      tableData.workers.push(workerData);

      workerDataMap.set(worker.id, workerData);
    }

    for (const day of table) {
      const dayData = this.createDayData(day);

      tableData.days.push(dayData);

      for (const duty of day) {
        const dutyData = this.createDutyData(duty);

        tableData.duties.push(dutyData);

        for (const [_, worker] of duty) {
          const workerData = workerDataMap.get(worker.id);
          if (workerData === undefined) continue;

          tableData.dutyAndWorkerRelationships.push(
            this.createDutyAndWorkerRelationship(workerData.id, dutyData.id),
          );
        }
      }
    }

    return tableData;
  }

  fromState(state: ScheduleState): ExtraDutyTable {
    const month = new Month(state.config.year, state.config.month);

    const table = new ExtraDutyTable({
      ...state.config,
      month,
    });

    const workers = state.workers.map((workerState) =>
      this.workerFromState(month, workerState),
    );

    table.addWorkers(workers);

    console.log(workers.length);

    const dutyDataMap = new Map(state.duties.map((duty) => [duty.id, duty]));
    const workerDataMap = new Map(
      state.workers.map((worker) => [worker.id, worker]),
    );
    const workerInfoMap = new Map(workers.map((worker) => [worker.id, worker]));

    for (const relationship of state.dutyAndWorkerRelationships) {
      const dutyData = dutyDataMap.get(relationship.dutyId);
      const workerData = workerDataMap.get(relationship.workerId);
      if (dutyData === undefined || workerData === undefined) continue;

      const workerInfo = workerInfoMap.get(workerData.workerId);
      if (workerInfo === undefined) continue;

      table.getDay(dutyData.date.index).getDuty(dutyData.index).add(workerInfo);
    }

    return table;
  }

  workerFromState(month: Month, state: WorkerData): WorkerInfo {
    let daysOfWork;
    if (state.ordinary.isDailyWorker) {
      daysOfWork = DaysOfWork.fromDailyWorker(month);
    } else {
      daysOfWork = DaysOfWork.fromRestrictionArray(state.restrictions, month);
    }

    const workTime = new WorkTime(
      state.ordinary.startsAt,
      state.ordinary.duration,
    );

    const worker = new WorkerInfo({
      name: state.name,
      daysOfWork,
      post: state.graduation,
      gender: state.gender,
      graduation: state.graduation,
      identifier: new WorkerIdentifier(state.workerPreId, state.workerPostId),
      individualId: state.individualId,
      workTime,
      limit: new WorkLimit([], state.workLimit),
    });

    return worker;
  }
}

export class IdGenerator {
  constructor(readonly counters: Record<string, number> = {}) {}

  next(name: string) {
    let id = this.counters[name];
    if (id === undefined) {
      id = 0;
    }

    this.counters[name] = id + 1;

    return id;
  }
}
