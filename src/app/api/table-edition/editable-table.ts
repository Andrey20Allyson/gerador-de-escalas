import type { ExtraDutyTable, WorkerInfo } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";
import type { TableEditorLoadedData } from "./table-editor";
import { enumerate } from "@andrey-allyson/escalas-automaticas/dist/utils";

export enum DutyState {
  WORK = 1,
  DONT_WORK,
  NOT_EDITABLE,
}

export type TableSlotEntry = {
  dutyIndex: number;
  state: DutyState;
  day: number;
}

export type TableSlot = DutyState[][];

export type TableSlotMap = {
  [K in string]?: TableSlot;
};

export class EditableTableSlot {
  constructor(
    readonly slot: TableSlot,
  ) { }

  get(day: number, dutyIndex: number) {
    return this.slot.at(day)?.at(dutyIndex) ?? DutyState.DONT_WORK;
  }

  *iter(): Iterable<TableSlotEntry> {
    for (const [day, duties] of enumerate(this.slot)) {
      if (!duties) continue;
      for (const [dutyIndex, state] of enumerate(duties)) {
        yield {
          dutyIndex,
          state,
          day,
        };
      }
    }
  }

  set(day: number, dutyIndex: number, value: DutyState): boolean {
    const oldValue = this.get(day, dutyIndex);
    if (value === oldValue || oldValue === DutyState.NOT_EDITABLE) return false;

    let duties = this.slot.at(day);

    if (!duties) {
      duties = [];

      this.slot[day] = duties;
    }

    duties[dutyIndex] = value;

    return true;
  }
}


export class EditableDutyTable {
  changes: TableSlotMap;

  constructor(
    public tableMap: TableSlotMap,
    public names: readonly string[],
  ) {
    this.changes = {};
  }

  get(workerName: string) {
    const slot = this.tableMap[workerName];
    if (!slot) return;

    return new EditableTableSlot(slot);
  }

  set(workerName: string, day: number, dutyIndex: number, value: DutyState): boolean {
    const editableSlot = this.get(workerName);
    if (!editableSlot) return false;

    const changed = editableSlot.set(day, dutyIndex, value);

    if (changed) this.changes[workerName] = editableSlot.slot;

    return changed;
  }

  getChanges() {
    return this.changes;
  }

  applyChanges(table: ExtraDutyTable, workerMap: Map<string, WorkerInfo>) {
    return EditableDutyTable.applyChanges(this.getChanges(), table, workerMap);
  }

  static *iterTableMap(map: TableSlotMap): Iterable<[string, EditableTableSlot]> {
    for (const key in map) {
      const slot = map[key];
      if (!slot) continue;

      yield [key, new EditableTableSlot(slot)];
    }
  }

  static applyChanges(changes: TableSlotMap, table: ExtraDutyTable, workerMap: Map<string, WorkerInfo>) {
    for (const [workerName, slot] of EditableDutyTable.iterTableMap(changes)) {
      const worker = workerMap.get(workerName);
      if (!worker) continue;

      for (const { day, dutyIndex, state } of slot.iter()) {
        if (state === DutyState.NOT_EDITABLE) continue;

        const duty = table.getDay(day).getDuty(dutyIndex);

        switch (state) {
          case DutyState.WORK:
            if (!duty.has(worker)) duty.add(worker, true);
            break;
          case DutyState.DONT_WORK:
            duty.delete(worker);
            break;
        }
      }
    }
  }

  static from(map: TableSlotMap) {
    const names = Object.keys(map);

    return new EditableDutyTable(
      map,
      names,
    );
  }

  static load(payload: TableEditorLoadedData) {
    return new EditableDutyTable(
      EditableDutyTable.mapTable(payload.table),
      EditableDutyTable.getNamesFrom(payload.workers),
    );
  }

  static mapTable(table: ExtraDutyTable) {
    const map: TableSlotMap = {};

    const workers = new Set<WorkerInfo>();

    for (const { day, duty, worker } of table.entries()) {
      let slot = map[worker.name];

      workers.add(worker);

      if (!slot) {
        slot = [];

        map[worker.name] = slot;
      }

      let duties = slot.at(day.day);

      if (!duties) {
        duties = [];

        slot[day.day] = duties;
      }

      duties[duty.index] = DutyState.WORK;
    }

    for (const worker of workers) {
      const slot = map[worker.name];
      if (!slot) continue;

      // TODO implement not editable duties
    }

    return map;
  }

  static getNamesFrom(workers: WorkerInfo[]) {
    return workers.map(worker => worker.name);
  }
}