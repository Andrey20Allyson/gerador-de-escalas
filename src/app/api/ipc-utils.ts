import { WorkerInfo } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-table/worker-info";
import { LoadedData } from "./channels";
import { DaysOfWork, WorkTime } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-table";

export function setPrototypesOfLoadedData(data: LoadedData | undefined) {
  if (!data) return;

  setPrototypesOfWorkers(data.workers);

  return data;
}

export function setPrototypesOfWorkers(workers: readonly WorkerInfo[]) {
  for (const worker of workers) {
    setPrototypesOfWorker(worker);
  }

  return workers as WorkerInfo[];
}

export function setPrototypesOfWorker(worker: WorkerInfo) {
  Object.setPrototypeOf(worker, WorkerInfo.prototype);
  Object.setPrototypeOf(worker.daysOfWork, DaysOfWork.prototype);
  Object.setPrototypeOf(worker.workTime, WorkTime.prototype);

  return worker;
}