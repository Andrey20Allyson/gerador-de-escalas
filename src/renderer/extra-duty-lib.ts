import type { DaysOfWork } from '@andrey-allyson/escalas-automaticas/dist/extra-duty-lib';

export function toggleWorkDay(daysOfWork: DaysOfWork, day: number) {
  if (daysOfWork.workOn(day)) {
    daysOfWork.notWork(day);
  } else {
    daysOfWork.work(day);
  }
}

export * from '@andrey-allyson/escalas-automaticas/dist/extra-duty-lib';