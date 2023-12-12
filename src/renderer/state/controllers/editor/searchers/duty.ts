import { DutyData } from "../../../../../app/api/table-reactive-edition/table";
import { Searcher } from "../../../../utils/searcher";

export class DutySearcher extends Searcher<DutyData> {
  dayEquals(day: number): this {
    return this.addStep(duty => duty.day === day);
  }
  
  indexEquals(index: number): this {
    return this.addStep(duty => duty.index === index);
  }
  
  idEquals(id: number): this {
    return this.addStep(duty => duty.id === id);
  }

  static dayEquals(day: number): DutySearcher {
    return new DutySearcher().dayEquals(day);
  }

  static indexEquals(index: number): DutySearcher {
    return new DutySearcher().indexEquals(index);
  }

  static idEquals(id: number): DutySearcher {
    return new DutySearcher().idEquals(id);
  }

}