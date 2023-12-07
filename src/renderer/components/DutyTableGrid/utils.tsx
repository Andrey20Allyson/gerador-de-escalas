import { iterRange } from "../../utils";
import { ElementList, IterProps } from "../../utils/react-iteration";
import React from "react";
import { StyledDay, StyledDayTitle, StyledDutiesContainer, StyledDuty, StyledDutyHeader, StyledDutySlot, StyledDutyTitle, StyledEmpityDutySlot } from "./styles";
import { Searcher, TableEditorController } from "../../state/controllers/editor/table";
import { WorkerEditorController } from "../../state/controllers/editor/worker";

export const dutyTitles = [
  '7 as 19h',
  '19 as 7h',
];

export function EmpityDutySlot() {
  return <StyledEmpityDutySlot />;
}

export function WorkerView(props: IterProps<number>) {
  const workerController = new WorkerEditorController(props.entry);
  const { worker } = workerController;

  return <StyledDutySlot gender={worker.gender} graduation={worker.graduation} />;
}

export type OnDutySelect = (dutyId: number) => void;

export interface DutyViewProps {
  onSelect?: OnDutySelect;
  day: number;
}

export function DutyView(props: IterProps<number, DutyViewProps>) {
  const { onSelect, day } = props;
  const tableController = new TableEditorController();
  const dutyController = tableController.findDuty(
    Searcher.duty.dayEquals(day),
    Searcher.duty.indexEquals(props.entry),
  );
  if (!dutyController) throw new Error(`Can't find duty at day ${day} in index ${props.entry}!`);

  const { duty } = dutyController;

  const dutySize = dutyController.size();

  function handleSelect() {
    onSelect?.(duty.id);
  }

  return (
    <StyledDuty className={`${dutySize < 2 ? 'low-quantity' : ''}`} onClick={handleSelect}>
      <ElementList Component={WorkerView} iter={dutyController.workerIds()} />
      <ElementList Component={EmpityDutySlot} iter={iterRange(0, 3 - dutySize)} />
      <StyledDutyTitle>{dutyTitles.at(duty.index) ?? 'N/A'}</StyledDutyTitle>
    </StyledDuty>
  );
}

export interface DayViewProps {
  onSelect?: OnDutySelect;
}

export function DayView(props: IterProps<number, DayViewProps>) {
  const { onSelect } = props;
  const day = props.entry;

  const tableController = new TableEditorController();

  return (
    <StyledDay>
      <StyledDutyHeader>
        <StyledDayTitle>Dia {day + 1}</StyledDayTitle>
      </StyledDutyHeader>
      <StyledDutiesContainer>
        <ElementList Component={DutyView} iter={tableController.iterDutyIndexes()} communProps={{ onSelect, day }} />
      </StyledDutiesContainer>
    </StyledDay>
  );
}