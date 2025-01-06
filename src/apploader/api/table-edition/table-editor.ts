import type { ExtraDutyTable, WorkerInfo } from "../../auto-schedule/extra-duty-lib";
import { getNumOfDaysInMonth } from "../../utils";
import { DayEditor, DayEditorData } from "./day-editor";
import { normalizeIndex } from "./utils";
import { WorkerEditor, WorkerEditorData } from "./worker-editor";
import { DutyEditor } from "./duty-editor";

export interface WorkerInsertionRulesState {
  ordinaryRule: boolean;
  timeOffRule: boolean;
  femaleRule: boolean;
  inspRule: boolean;
}

export interface TableEditorData {
  readonly workers: Map<number, WorkerEditorData>;
  readonly rules: WorkerInsertionRulesState;
  readonly days: DayEditorData[];
  readonly nunOfDays: number;
  readonly month: number;
  readonly year: number;

  dutiesPerDay: number;
}

export interface CreateTableEditorOptions {
  dutiesPerDay: number;
  month?: number;
  year?: number;
}

export class TableEditor {
  constructor(readonly data: TableEditorData) { }

  *iterDays(): Iterable<DayEditor> {
    for (let i = 0; i < this.data.nunOfDays; i++) {
      yield this.getDay(i);
    }
  }

  *iterDuties(): Iterable<DutyEditor> {
    for (const day of this.iterDays()) {
      for (const duty of day.iterDuties()) {
        yield duty;
      }
    }
  }

  *filterWorker(filter: (worker: WorkerEditor) => boolean): Iterable<WorkerEditor> {
    for (const worker of this.iterWorkers()) {
      if (filter(worker)) yield worker;
    }
  }

  *iterWorkers(): Iterable<WorkerEditor> {
    for (const [_, data] of this.data.workers) {
      yield new WorkerEditor(this, data);
    }
  }

  rules() {
    return this.data.rules;
  }

  isRuleActived(rule: keyof WorkerInsertionRulesState) {
    return this.data.rules[rule];
  }

  numOfDays() {
    return this.data.nunOfDays;
  }

  numOfWorkers() {
    return this.data.workers.size;
  }

  getWorker(id: number) {
    const data = this.data.workers.get(id);
    return data ? new WorkerEditor(this, data) : undefined;
  }

  getDay(index: number) {
    const normalizedIndex = normalizeIndex(index, this.numOfDays());

    let day = this.data.days.at(normalizedIndex);
    if (day) return new DayEditor(this, day);

    const viewer = DayEditor.create(this, normalizedIndex);

    this.data.days[normalizedIndex] = viewer.data;

    return viewer;
  }

  addWorker(worker: WorkerEditorData) {
    this.data.workers.set(worker.workerID, worker);
  }

  removeWorker(id: number) {
    return this.data.workers.delete(id);
  }

  save(table: ExtraDutyTable, workerMap: ReadonlyMap<number, WorkerInfo>) {
    table.clear();

    for (const workerEditor of this.iterWorkers()) {
      const workerInfo = workerMap.get(workerEditor.id());
      if (!workerInfo) throw new Error(`Can't find worker data with id #${workerEditor.id()}!`);

      for (const dutyEditor of workerEditor.iterDuties()) {
        const duty = table
          .getDay(dutyEditor.day.index())
          .getDuty(dutyEditor.index())

        duty.add(workerInfo);
      }
    }

    return table;
  }

  static from(table: ExtraDutyTable, workers: WorkerInfo[]) {
    const { year, month } = table.config;

    const editor = TableEditor.create({
      dutiesPerDay: table.getDay(0).getSize(),
      month,
      year,
    });

    for (const workerInfo of workers) {
      const { id, name, gender, graduation, daysOfWork, workTime } = workerInfo;

      const worker = WorkerEditor.create(editor, id);

      worker.data.name = name;
      worker.data.gender = gender;
      worker.data.graduation = graduation;
      worker.data.isDailyWorker = daysOfWork.isDailyWorker;

      for (const { day, work } of daysOfWork.entries()) {
        if (work) worker.ordinary.add(day);
      }

      worker.ordinary.data.startsAt = workTime.start;
      worker.ordinary.data.duration = workTime.duration;

      editor.addWorker(worker.data);
    }

    for (const day of table) {
      for (const duty of day) {
        const dutyEditor = editor
          .getDay(day.index)
          .getDuty(duty.index);
  
        dutyEditor.setTime(duty.start, duty.end);

        for (const [_, { id }] of duty) {   
          const workerEditor = editor.getWorker(id);
          if (!workerEditor) throw new Error(`Can't find worker data with id #${id}!`);
    
          workerEditor.addDuty(dutyEditor.address());
          dutyEditor.addWorker(workerEditor);
        }
      }
    }

    return editor;
  }

  static create(options: CreateTableEditorOptions) {
    const { dutiesPerDay, month = 0, year = 0 } = options;
    const nunOfDays = getNumOfDaysInMonth(month, year);

    return new TableEditor({
      rules: TableEditor.createRules(),
      workers: new Map(),
      dutiesPerDay,
      nunOfDays,
      days: [],
      month,
      year,
    });
  }

  static createRules(): WorkerInsertionRulesState {
    return {
      ordinaryRule: true,
      timeOffRule: true,
      femaleRule: true,
      inspRule: true,
    }
  }
}