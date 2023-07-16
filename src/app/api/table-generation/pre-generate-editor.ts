import { DayOfWork, WorkerInfo } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";

export interface WorkerEditorDTO {
  readonly workerID: number;

  ordinaryDays: Map<number, boolean>;
  numberOfDays: number;
  month: number;
  year: number;
  name: string;
}

export class WorkerEditor {
  constructor(parent: PreGenerateEditor, readonly data: WorkerEditorDTO) { }

  name() {
    return this.data.name;
  }

  sizeOfOrdinary() {
    return this.data.numberOfDays;
  }

  *days(): Iterable<DayOfWork> {
    for (const [day, work] of this.data.ordinaryDays) {
      yield { day, work };
    }
  }

  toggleOrdinary(index: number) {
    const newValue = !this.ordinaryAt(index);
    
    this.setOrdinary(index, newValue);
  }

  setOrdinary(index: number, work: boolean) {
    if (!this.data.ordinaryDays.has(index)) throw new Error(`Invalid day index at ${index}!`);
    this.data.ordinaryDays.set(index, work);
  }

  ordinaryAt(index: number) {
    const day = this.data.ordinaryDays.get(index);
    if (!day) throw new Error(`Invalid day index at ${index}!`);
    return day;
  }

  static create(parent: PreGenerateEditor, workerID: number) {
    return new WorkerEditor(parent, { name: 'N/A', numberOfDays: 0, ordinaryDays: new Map(), workerID, month: 0, year: 0 });
  }

  static from(parent: PreGenerateEditor, workerInfo: WorkerInfo) {
    const { name, daysOfWork, fullWorkerID } = workerInfo;
    const worker = WorkerEditor.create(parent, fullWorkerID);

    const { data } = worker;

    data.name = name;
    data.year = daysOfWork.year;
    data.month = daysOfWork.month;
    data.numberOfDays = daysOfWork.length;

    for (const { day, work } of daysOfWork.entries()) {
      data.ordinaryDays.set(day, work);
    }

    return worker;
  }
}

export interface PreGenerateEditorDTO {
  readonly workers: Map<number, WorkerEditorDTO>;
}

export class PreGenerateEditor {
  constructor(readonly data: PreGenerateEditorDTO) { }

  *workers(): Iterable<WorkerEditor> {
    for (const [_, worker] of this.data.workers) {
      yield new WorkerEditor(this, worker);
    }
  }

  addWorker(worker: WorkerEditorDTO) {
    if (this.data.workers.has(worker.workerID)) return false;
    
    this.data.workers.set(worker.workerID, worker);
  }

  getWorker(id: number) {
    const data = this.data.workers.get(id);
    return data ? new WorkerEditor(this, data) : undefined;
  }

  save(workers: WorkerInfo[]) {
    for (const workerInfo of workers) {
      const worker = this.getWorker(workerInfo.fullWorkerID);
      if (!worker) throw new Error(`Invalid input, 'workers' arg have a not mapped worker!`);
      
      for (const { day, work } of worker.days()) {
        workerInfo.daysOfWork.setDayOfWork(day, work);
      }
    }
  }

  static from(workers: WorkerInfo[]) {
    const editor = PreGenerateEditor.create();

    for (const workerInfo of workers) {
      const worker = WorkerEditor.from(editor, workerInfo);

      editor.addWorker(worker.data);
    }

    return editor;
  }

  static create() {
    return new PreGenerateEditor({ workers: new Map() });
  }
}