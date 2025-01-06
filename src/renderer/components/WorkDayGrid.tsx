import { WorkerEditor } from "../../apploader/api/table-generation/pre-generate-editor";
import { useRerender } from "../hooks";
import {
  DayCell,
  DayGrid,
  WorkDayCell,
} from "../pages/Generator/WorkerEditionStage.styles";
import {
  getFirstSundayOfMonth,
  getNumOfDaysInMonth,
  iterRange,
} from "../utils";
import React from "react";

export interface WorkDayGridProps {
  worker: WorkerEditor;
}

export function WorkDayGrid(props: WorkDayGridProps) {
  const rerender = useRerender();

  const { worker } = props;
  const { year, month } = worker.data;

  const firstSunday = getFirstSundayOfMonth(2023, month).getDate();
  const pastMonthNumOfDays = getNumOfDaysInMonth(
    month < 1 ? 11 : month - 1,
    year,
  );

  const pastMonthDayCells = Array.from(
    iterRange(0, 8 - firstSunday),
    createDayCell,
  );
  const workDayCells = Array.from(
    iterRange(0, worker.sizeOfOrdinary()),
    createWorkDayCell,
  );

  function handleChange(dayIndex: number) {
    worker.toggleOrdinary(dayIndex);

    rerender();
  }

  function createDayCell(day: number, index: number) {
    return (
      <DayCell key={index}>
        {day + pastMonthNumOfDays - 7 + firstSunday}
      </DayCell>
    );
  }

  function createWorkDayCell(dayIndex: number, index: number) {
    return (
      <WorkDayCell
        key={index}
        onClick={() => handleChange(dayIndex)}
        isWorkDay={worker.ordinaryAt(dayIndex)}
      >
        {dayIndex + 1}
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
