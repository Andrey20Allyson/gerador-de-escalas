import React from "react";
import { HiOutlineArrowsExpand } from "react-icons/hi";
import { DayViewer, DutyViewer, WorkerViewer } from "../../app/api/table-visualization";
import { iterRange } from "../utils";
import { ElementList, IterProps } from "../utils/react-iteration";
import { StyledDay, StyledDayTitle, StyledDutiesContainer, StyledDuty, StyledDutyHeader, StyledDutySlot, StyledDutyTitle, StyledEmpityDutySlot, StyledExpandDayButton } from "./DutyTableGrid.styles";

export const dutyTitles = [
  '7 as 19h',
  '19 as 7h',
];

export function EmpityDutySlot() {
  return <StyledEmpityDutySlot />;
}

export function WorkerView(props: IterProps<WorkerViewer>) {
  const worker = props.entry;

  return <StyledDutySlot gender={worker.data.gender} graduation={worker.data.graduation} />;
}

export function DutyView(props: IterProps<DutyViewer>) {
  const duty = props.entry;

  return (
    <StyledDuty>
      <ElementList Component={WorkerView} iter={duty.iterWorkers()}/>
      <ElementList Component={EmpityDutySlot} iter={iterRange(0, 3 - duty.numOfWorkers())}/>
      <StyledDutyTitle>{dutyTitles.at(duty.data.index) ?? 'N/A'}</StyledDutyTitle>
    </StyledDuty>
  );
}

export interface DayViewProps {
  onSelect?: (day: DayViewer) => void;
}

export function DayView(props: IterProps<DayViewer, DayViewProps>) {
  const { onSelect } = props;
  const day = props.entry;

  return (
    <StyledDay>
      <StyledDutyHeader>
        <StyledDayTitle>Dia {day.data.index + 1}</StyledDayTitle>
        <StyledExpandDayButton onClick={() => onSelect?.(day)}>
          <HiOutlineArrowsExpand color='#6d6d6d' />
        </StyledExpandDayButton>
      </StyledDutyHeader>
      <StyledDutiesContainer>
        <ElementList Component={DutyView} iter={day.iterDuties()} />
      </StyledDutiesContainer>
    </StyledDay>
  );
}