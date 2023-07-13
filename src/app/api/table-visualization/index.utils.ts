import { DutyViewerData } from "./duty-viewer";
import { WorkerViewerData } from "./worker-viewer";

export class IndexError extends Error {
  constructor(index: number, size: number) {
    super(`Index out of bounds, tried access element #${index} from Array with ${size} elements!`);
  }
}

export function normalizeIndex(index: number, size: number) {
  if (index < 0) index = size + index;
  if (index >= size) throw new IndexError(size, index);

  return index;
}

export function removeWorkerFromDuty(workerData: WorkerViewerData, dutyData: DutyViewerData) {
  const removedWorkerData = removeFromArray(dutyData.workers, workerData);
  if (!removedWorkerData) return false;

  removeFromArray(removedWorkerData.duties, dutyData);

  return true;
}

export function removeFromArray<T>(array: T[], value: T) {
  const index = array.indexOf(value);
  if (index === -1) return;

  const [element] = array.splice(index, 1);

  return element;
}