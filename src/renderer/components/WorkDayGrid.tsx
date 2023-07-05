import React from "react";
import { getFirstSundayOfMonth, getNumOfDaysInMonth, iterRange } from '../utils';
import { DaysOfWork } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";
import { DayCell, WorkDayCell, DayGrid } from "../pages/Generator/WorkerEditionStage.styles";

export interface WorkDayGridProps {
  daysOfWork: DaysOfWork;
  month: number;
  year: number;

  onToggleDay?: (daysOfWork: DaysOfWork, day: number) => void;
}

export function WorkDayGrid(props: WorkDayGridProps) {
  const { daysOfWork, month, year } = props;

  const firstSunday = getFirstSundayOfMonth(2023, month).getDate();

  const pastMonthDayCells = Array.from(iterRange(0, firstSunday), createDayCell);
  const workDayCells = Array.from(iterRange(0, daysOfWork.length), createWorkDayCell);

  function createDayCell(day: number, index: number) {
    return (
      <DayCell key={index}>
        {(day + getNumOfDaysInMonth(month < 1 ? 11 : month - 1, year)) - firstSunday + 1}
      </DayCell>
    );
  }

  function createWorkDayCell(day: number, index: number) {
    return (
      <WorkDayCell
        key={index}
        onClick={props.onToggleDay?.bind(undefined, daysOfWork, day)}
        isWorkDay={daysOfWork.workOn(day)}>{day + 1}
      </WorkDayCell>
    );
  }

  return (
    <DayGrid>
      {pastMonthDayCells}
      {workDayCells}
    </DayGrid>
  );
}
