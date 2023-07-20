import React, { useState } from "react";
import { AiOutlineCloseCircle, AiOutlineDoubleLeft, AiOutlineDoubleRight, AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import { HiUserRemove } from "react-icons/hi";
import { SlOptionsVertical } from 'react-icons/sl';
import { DayEditor, DutyEditor, TableEditor, WorkerEditor } from "../../../app/api/table-edition";
import { useRerender } from "../../hooks";
import { ColoredText } from "../../pages/Generator/WorkerEditionStage.styles";
import { ElementList, IterProps } from "../../utils/react-iteration";
import { AvaliableWorkers } from "../AvaliableWorkers";
import { dutyTitles } from "../DutyTableGrid/utils";
import {
  StyledDayViewModal,
  StyledDayViewNavigation,
  StyledDutyViewBody,
  StyledDutyViewNavButton,
  StyledDutyViewNavigation,
  StyledDutyViewSlotSection,
  StyledEmpityDutyMessage,
  StyledModalBody,
  StyledModalHeader,
  StyledModalTitle,
  StyledModalTitle2,
  StyledWorkerInfoSection,
  StyledWorkerViewBody,
} from "./styles";
import { genderComponentMap, graduationTextColorMap } from "./utils";
import { useEditionModal } from "../../contexts/duty-edition-modal";

export interface DayViewModalProps {
  startDutyIndex?: number;
  startDayIndex?: number;
  table: TableEditor;
  onUpdate?: () => void;
}

export function DayEditionModal(props: DayViewModalProps) {
  const modal = useEditionModal();
  const { startDutyIndex = 0, startDayIndex = 0, table, onUpdate } = props;

  const [dutyIndex, setDutyIndex] = useState(startDutyIndex);
  const [dayIndex, setDayIndex] = useState(startDayIndex);
  const [closing, setClosing] = useState(false);

  const rerender = useRerender();

  function handleUpdate() {
    onUpdate?.();
    rerender();
  }
  
  const day = table.getDay(dayIndex);
  const duty = day.getDuty(dutyIndex);

  function handleAnimationEnd(ev: React.AnimationEvent<HTMLSpanElement>) {
    if (ev.animationName === 'close') modal.close();
  }

  function handleClose() {
    setClosing(true);
  }

  function nextDay() {
    const nextDayIndex = (dayIndex + 1) % table.numOfDays();

    setDayIndex(nextDayIndex);
  }

  function prevDay() {
    const prevDayIndex = dayIndex - 1;
    const normalizedPrevDayIndex = (prevDayIndex < 0 ? table.numOfDays() + prevDayIndex : prevDayIndex) % table.numOfDays();

    setDayIndex(normalizedPrevDayIndex);
  }

  function nextDuty() {
    const limit = day.numOfDuties();
    let nextDutyIndex = dutyIndex + 1;

    if (nextDutyIndex >= limit) {
      nextDay();
      nextDutyIndex = 0;
    }

    setDutyIndex(nextDutyIndex);
  }

  function prevDuty() {
    let last = day.numOfDuties() - 1;
    let prevDutyIndex = dutyIndex - 1;

    if (prevDutyIndex < 0) {
      prevDay();
      prevDutyIndex = last;
    }

    setDutyIndex(prevDutyIndex);
  }

  const dutyViewContent = duty.numOfWorkers() > 0
    ? <ElementList communProps={{ duty, onUpdate: handleUpdate }} iter={duty.iterWorkers()} Component={WorkerCard} />
    : <StyledEmpityDutyMessage>Esse turno não possui componentes.</StyledEmpityDutyMessage>;

  return (
    <StyledDayViewModal closing={closing} onAnimationEnd={handleAnimationEnd}>
      <StyledModalHeader>
        <div />
        <StyledDayViewNavigation>
          <AiOutlineDoubleLeft onClick={prevDay} />
          <AiOutlineLeft onClick={prevDuty} />
          <StyledModalTitle>
            Dia {day.data.index + 1}
          </StyledModalTitle>
          <AiOutlineRight onClick={nextDuty} />
          <AiOutlineDoubleRight onClick={nextDay} />
        </StyledDayViewNavigation>
        <AiOutlineCloseCircle onClick={handleClose} size={25} color="#cc0000" />
      </StyledModalHeader>
      <StyledModalBody>
        <DutyEditionNavation day={day} duty={duty} onNavate={setDutyIndex} />
        <StyledModalTitle2>
          Turno das {dutyTitles.at(dutyIndex)}
        </StyledModalTitle2>
        <StyledDutyViewBody>
          <StyledDutyViewSlotSection>
            {dutyViewContent}
          </StyledDutyViewSlotSection>
          <AvaliableWorkers duty={duty} onUpdate={handleUpdate} />
        </StyledDutyViewBody>
      </StyledModalBody>
    </StyledDayViewModal>
  );
}

export interface DutyViewNavationProps {
  duty: DutyEditor;
  day: DayEditor;
  onNavate?: (newIndex: number) => void;
}

export function DutyEditionNavation(props: DutyViewNavationProps) {
  const { day, duty, onNavate } = props;

  const dutyIndex = duty.data.index;

  return (
    <StyledDutyViewNavigation>
      <ElementList iter={day.iterDuties()} Component={props => {
        const { entry: duty } = props;

        const thisDutyIndex = duty.data.index;

        return (
          <StyledDutyViewNavButton selected={dutyIndex === thisDutyIndex} onClick={() => onNavate?.(thisDutyIndex)}>
            {dutyTitles.at(thisDutyIndex)}
          </StyledDutyViewNavButton>
        );
      }} />
    </StyledDutyViewNavigation>
  );
}

export interface WorkerViewProps {
  onUpdate?: () => void;
  duty: DutyEditor;
}

export function WorkerCard(props: IterProps<WorkerEditor, WorkerViewProps>) {
  const { entry: worker, duty, onUpdate } = props;
  const Gender = genderComponentMap[worker.data.gender];
  const gradutationColor = graduationTextColorMap[worker.data.graduation];

  function handleWorkerRemove() {
    const success = worker.deleteDuty(duty.address()) && duty.deleteWorker(worker.id());
    if (!success) return;

    onUpdate?.();
  }

  return (
    <StyledWorkerViewBody>
      {worker.data.name}
      <StyledWorkerInfoSection>
        [<ColoredText color={gradutationColor}>{worker.data.graduation.toUpperCase()}</ColoredText>]
        <Gender />
        <HiUserRemove className="clickable" color='#c00000' onClick={handleWorkerRemove} />
        <SlOptionsVertical />
      </StyledWorkerInfoSection>
    </StyledWorkerViewBody>
  );
}