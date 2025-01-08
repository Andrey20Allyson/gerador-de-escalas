import { DayOfExtraDuty, Graduation, WorkerInfo } from "src/lib/structs";
import { enumerate, iterReverse } from "src/utils";
import { WorkerDuty } from "./worker-duty";

export interface DayGridEntry {
  duty: string;
  name: string;
  id: string;
}

export interface DayGrid {
  title: string;
  entries: DayGridEntry[];
  numOfDiurnal: number;
  numOfNightly: number;
}

export class DayGridFromatter {
  protected readonly _graduationPrefixMap: Record<Graduation, string> = {
    "sub-insp": "SI",
    gcm: "GCM",
    insp: "INSP.",
  };

  protected readonly _weekDayNames = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];

  format(day: DayOfExtraDuty, workerDuties: WorkerDuty[]): DayGrid {
    const weekDay = day.date.getWeekDay();

    const weekDayName = this._weekDayNames.at(weekDay) ?? "Unknow";

    const title = `Dia ${day.date} (${weekDayName})`;

    const grid: DayGrid = {
      title,
      entries: [],
      numOfDiurnal: 0,
      numOfNightly: 0,
    };

    for (const duty of workerDuties) {
      grid.entries.push(this._toDayGridEntry(duty, duty.worker));

      if (duty.start < 18 && duty.start >= 7) {
        grid.numOfDiurnal++;
      } else {
        grid.numOfNightly++;
      }
    }

    return grid;
  }

  protected _toDayGridEntry(
    duty: WorkerDuty,
    worker: WorkerInfo,
  ): DayGridEntry {
    const normalizedDutyStartTime = duty.start % 24;
    const normalizedDutyEndTime = duty.end % 24;

    const namePrefix = this._graduationPrefixMap[worker.graduation];

    return {
      duty: this._toDutyDesc(normalizedDutyStartTime, normalizedDutyEndTime),
      id: this._parseWorkerID(worker.id),
      name: `${namePrefix} ${worker.name}`,
    };
  }

  protected _toDutyDesc(start: number, end: number) {
    const prefix = start >= 7 && start < 18 ? "Diurno" : "Noturno";

    return `${prefix} (${start.toString().padStart(2, "0")} ÀS ${end.toString().padStart(2, "0")}h)`;
  }

  protected _parseWorkerID(id: number): string {
    const stringifiedID = id.toString();
    let out = "-" + stringifiedID.slice(-1);

    for (const [i, digit] of enumerate(
      iterReverse(stringifiedID.slice(0, -1)),
    )) {
      const separator = i > 0 && i % 3 === 0 ? "." : "";
      out = digit + separator + out;
    }

    return out;
  }
}
