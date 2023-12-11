import { Gender } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";
import { WorkerData } from "../../../../../app/api/table-reactive-edition/table";
import { Searcher } from "../../../../utils/searcher";

export class WorkerSearcher extends Searcher<WorkerData> {
  genderEquals(gender: Gender): this {
    return this.addStep(worker => worker.gender === gender);
  }

  idEquals(id: number): this {
    return this.addStep(worker => worker.id === id);
  }

  static genderEquals(gender: Gender): WorkerSearcher {
    return new WorkerSearcher().genderEquals(gender);
  }
  
  static idEquals(id: number): WorkerSearcher {
    return new WorkerSearcher().idEquals(id);
  }
}