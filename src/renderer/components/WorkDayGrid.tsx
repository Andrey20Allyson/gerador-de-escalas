import React from "react";
import { getFirstSundayOfMonth, getNumOfDaysInMonth, iterRange } from '../utils';
import { DayCell, DayGrid, WorkDayCell } from "./WorkerEditionStage.styles";
import { DaysOfWork } from "../extra-duty-lib";

export interface WorkDayGridProps {
  month: number;
  daysOfWork: DaysOfWork;
  onToggleDay?: (daysOfWork: DaysOfWork, day: number) => void;
}

export function WorkDayGrid(props: WorkDayGridProps) {
  const { daysOfWork, month } = props;

  const firstSunday = getFirstSundayOfMonth(2023, month).getDate();

  const pastMonthDayCells = Array.from(iterRange(0, firstSunday), createDayCell);
  const workDayCells = Array.from(iterRange(0, daysOfWork.length), createWorkDayCell);

  function createDayCell(day: number) {
    return (
      <DayCell>
        {(day + getNumOfDaysInMonth(month < 1 ? 11 : month - 1)) - firstSunday + 1}
      </DayCell>
    );
  }

  function createWorkDayCell(day: number) {
    return (
      <WorkDayCell
        key={day}
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
