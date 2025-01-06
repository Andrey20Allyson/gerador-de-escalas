import {
  DateData,
  DutyData,
} from "../../../../../apploader/api/table-reactive-edition/table";
import { Searcher } from "../../../../utils/searcher";

export class DutySearcher extends Searcher<DutyData> {
  dayEquals(day: DateData): this {
    return this.addStep((duty) => duty.date.key === day.key);
  }

  dayIndexEquals(index: number): DutySearcher {
    return this.addStep((duty) => duty.date.index === index);
  }

  indexEquals(index: number): this {
    return this.addStep((duty) => duty.index === index);
  }

  idEquals(id: number): this {
    return this.addStep((duty) => duty.id === id);
  }

  static dayEquals(day: DateData): DutySearcher {
    return new DutySearcher().dayEquals(day);
  }

  static dayIndexEquals(index: number): DutySearcher {
    return new DutySearcher().dayIndexEquals(index);
  }

  static indexEquals(index: number): DutySearcher {
    return new DutySearcher().indexEquals(index);
  }

  static idEquals(id: number): DutySearcher {
    return new DutySearcher().idEquals(id);
  }
}
