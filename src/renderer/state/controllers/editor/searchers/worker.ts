import { WorkerData } from "src/apploader/api/table-reactive-edition";
import { Gender } from "src/lib/structs";
import { Searcher } from "src/renderer/utils";

export class WorkerSearcher extends Searcher<WorkerData> {
  genderEquals(gender: Gender): this {
    return this.addStep((worker) => worker.gender === gender);
  }

  idEquals(id: number): this {
    return this.addStep((worker) => worker.id === id);
  }

  static genderEquals(gender: Gender): WorkerSearcher {
    return new WorkerSearcher().genderEquals(gender);
  }

  static idEquals(id: number): WorkerSearcher {
    return new WorkerSearcher().idEquals(id);
  }
}
