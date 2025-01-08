import React from "react";
import { DutySearcher } from "../../state/controllers/editor/searchers/duty";
import { TableEditorController } from "../../state/controllers/editor/table";
import { WorkerEditorController } from "../../state/controllers/editor/worker";
import { iterRange } from "../../utils";
import { ElementList, IterProps } from "../../utils/react-iteration";
import {
  StyledDay,
  StyledDayTitle,
  StyledDutiesContainer,
  StyledDuty,
  StyledDutyHeader,
  StyledDutySlot,
  StyledDutyTitle,
  StyledEmpityDutySlot,
} from "./styles";
import { DateData } from "../../../apploader/api/table-reactive-edition/table";
import { DateFormatter } from "../../state/formatters/editor/day";

export function EmpityDutySlot() {
  return <StyledEmpityDutySlot />;
}

export function WorkerView(props: IterProps<number>) {
  const workerController = new WorkerEditorController(props.entry);
  const { worker } = workerController;

  return (
    <StyledDutySlot gender={worker.gender} graduation={worker.graduation} />
  );
}

export type OnDutySelect = (dutyId: number) => void;

export interface DutyViewProps {
  onSelect?: OnDutySelect;
  date: DateData;
}

export function DutyView(props: IterProps<number, DutyViewProps>) {
  const { onSelect, date } = props;
  const tableController = new TableEditorController();
  const dutyController = tableController.findDuty(
    DutySearcher.dayEquals(date).indexEquals(props.entry),
  );
  if (!dutyController)
    throw new Error(`Can't find duty at day ${date} in index ${props.entry}!`);

  const { duty } = dutyController;

  const dutySize = dutyController.size();

  function handleSelect() {
    onSelect?.(duty.id);
  }

  const dutyClass = duty.active
    ? dutySize < 2
      ? "low-quantity"
      : ""
    : "disabled";

  return (
    <StyledDuty
      className={dutyClass}
      onClick={duty.active ? handleSelect : undefined}
    >
      <ElementList Component={WorkerView} iter={dutyController.workerIds()} />
      <ElementList
        Component={EmpityDutySlot}
        iter={iterRange(0, 3 - dutySize)}
      />
      <StyledDutyTitle>{dutyController.format.hours()}</StyledDutyTitle>
    </StyledDuty>
  );
}

export interface DayViewProps {
  onSelect?: OnDutySelect;
}

export function DayView(props: IterProps<DateData, DayViewProps>) {
  const { onSelect } = props;
  const date = props.entry;

  const tableController = new TableEditorController();

  const dateFormatter = new DateFormatter(tableController.table, date);

  return (
    <StyledDay>
      <StyledDutyHeader>
        <StyledDayTitle>{dateFormatter.day()}</StyledDayTitle>
      </StyledDutyHeader>
      <StyledDutiesContainer>
        <ElementList
          Component={DutyView}
          iter={tableController.iterDutyIndexes()}
          communProps={{ onSelect, date: date }}
        />
      </StyledDutiesContainer>
    </StyledDay>
  );
}
