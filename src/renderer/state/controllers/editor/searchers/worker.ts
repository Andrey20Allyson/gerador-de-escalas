import { WorkerData } from "../../../../../apploader/api/table-reactive-edition/table";
import { Gender } from "../../../../extra-duty-lib";
import { Searcher } from "../../../../utils/searcher";

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
