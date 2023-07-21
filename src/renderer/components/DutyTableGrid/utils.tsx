import React from "react";
import { HiOutlineArrowsExpand } from "react-icons/hi";
import { WorkerEditor, DayEditor, DutyEditor } from "../../../app/api/table-edition";
import { iterRange } from "../../utils";
import { ElementList, IterProps } from "../../utils/react-iteration";
import { StyledDay, StyledDayTitle, StyledDutiesContainer, StyledDuty, StyledDutyHeader, StyledDutySlot, StyledDutyTitle, StyledEmpityDutySlot, StyledExpandDayButton } from "./styles";

export const dutyTitles = [
  '7 as 19h',
  '19 as 7h',
];

export function EmpityDutySlot() {
  return <StyledEmpityDutySlot />;
}

export function WorkerView(props: IterProps<WorkerEditor>) {
  const worker = props.entry;

  return <StyledDutySlot gender={worker.data.gender} graduation={worker.data.graduation} />;
}

export interface DutyViewProps {
  onSelect?: (day: number, duty: number) => void;
}

export function DutyView(props: IterProps<DutyEditor, DutyViewProps>) {
  const { onSelect } = props;
  const duty = props.entry;

  function handleSelect() {
    if (onSelect) {
      const dutyIndex = duty.index();
      const dayIndex = duty.day.index();

      onSelect(dayIndex, dutyIndex);
    }
  }

  return (
    <StyledDuty onClick={handleSelect}>
      <ElementList Component={WorkerView} iter={duty.iterWorkers()}/>
      <ElementList Component={EmpityDutySlot} iter={iterRange(0, 3 - duty.numOfWorkers())}/>
      <StyledDutyTitle>{dutyTitles.at(duty.data.index) ?? 'N/A'}</StyledDutyTitle>
    </StyledDuty>
  );
}

export interface DayViewProps {
  onSelect?: DutyViewProps['onSelect'];
}

export function DayView(props: IterProps<DayEditor, DayViewProps>) {
  const { onSelect } = props;
  const day = props.entry;

  return (
    <StyledDay>
      <StyledDutyHeader>
        <StyledDayTitle>Dia {day.data.index + 1}</StyledDayTitle>
      </StyledDutyHeader>
      <StyledDutiesContainer>
        <ElementList Component={DutyView} iter={day.iterDuties()} communProps={{ onSelect }} />
      </StyledDutiesContainer>
    </StyledDay>
  );
}