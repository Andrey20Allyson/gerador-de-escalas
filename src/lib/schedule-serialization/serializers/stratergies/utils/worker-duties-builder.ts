import { DayOfExtraDuty } from "../../../../extra-duty-lib";
import { WorkerDuty } from "./worker-duty";

export class WorkerDutiesBuilder {
  build(day: DayOfExtraDuty): WorkerDuty[] {
    const dutyPair = day.pair();
    const duties = dutyPair.all();
    const workers = duties.workers();

    const workerDuties = workers.flatMap(worker => {
      const workerDuties: WorkerDuty[] = [];

      for (let i = 0; i < duties.length; i++) {
        let duty = duties.at(i)!;

        if (duty.has(worker) === false) {
          continue;
        }

        const date = duty.day.date;
        const start = duty.start;
        let end = duty.end;

        while (duty.has(worker)) {
          end = duty.end;

          const nextDuty = duty.next();

          if (nextDuty == null || duty.isDaytime() !== nextDuty.isDaytime()) {
            break;
          }

          duty = nextDuty;
          i++;
        }

        workerDuties.push(new WorkerDuty(
          worker,
          start,
          end,
          date,
        ));
      }

      return workerDuties;
    }).sort((a, b) => a.compare(b));

    return workerDuties;
  }
}