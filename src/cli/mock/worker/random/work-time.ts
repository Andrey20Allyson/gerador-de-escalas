import { WorkTime } from "src/lib/structs";

function nightWorkTime(): WorkTime {
  return new WorkTime(19, 12);
}

function morningWorkTime(): WorkTime {
  return new WorkTime(7, 12);
}

function dailyWorkerWorkTime(): WorkTime {
  const choice = Math.random();

  const totalTime = choice < 0.5 ? 9 : 11;

  return new WorkTime(7, totalTime);
}

export function randomWorkTime(isDailyWorker: boolean = false): WorkTime {
  if (isDailyWorker) {
    return dailyWorkerWorkTime();
  }

  const choice = Math.random();

  return choice < 0.5 ? morningWorkTime() : nightWorkTime();
}
