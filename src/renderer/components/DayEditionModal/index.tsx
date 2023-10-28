import { DayEditor, DutyEditor, TableEditor, WorkerEditor } from "@gde/app/api/table-edition";
import { AvaliableWorkers } from "@gde/renderer/components/AvaliableWorkers";
import { useDutySelectModal } from "@gde/renderer/components/DutySelectModal";
import { dutyTitles } from "@gde/renderer/components/DutyTableGrid/utils";
import { createModalContext } from "@gde/renderer/contexts/modal";
import { useRerender } from "@gde/renderer/hooks";
import { ColoredText } from "@gde/renderer/pages/Generator/WorkerEditionStage.styles";
import { ElementList, IterProps } from "@gde/renderer/utils/react-iteration";
import React, { useState } from "react";
import { AiOutlineCloseCircle, AiOutlineDoubleLeft, AiOutlineDoubleRight, AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import { FaCalendarAlt } from "react-icons/fa";
import { HiUserRemove } from "react-icons/hi";
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
  StyledWorkerViewBody,
} from "./styles";
import { genderComponentMap, graduationTextColorMap } from "./utils";

export interface DayViewModalProps {
  dutyIndex?: number;
  dayIndex?: number;
  table: TableEditor;
  onUpdate?: () => void;
}

export function DayEditionModal(props: DayViewModalProps) {
  const modal = useDayEditionModal();
  const { dutyIndex: startDutyIndex = 0, dayIndex: startDayIndex = 0, table, onUpdate } = props;

  const [dutyIndex, setDutyIndex] = useState(startDutyIndex);
  const [dayIndex, setDayIndex] = useState(startDayIndex);

  const rerender = useRerender();
  const day = table.getDay(dayIndex);
  const duty = day.getDuty(dutyIndex);

  const dutyViewContent = duty.numOfWorkers() > 0
    ? <ElementList communProps={{ duty, onUpdate: update }} iter={duty.iterWorkers()} Component={WorkerCard} />
    : <StyledEmpityDutyMessage>Esse turno não possui componentes.</StyledEmpityDutyMessage>;

  function update() {
    onUpdate?.();
    rerender();
  }

  function handleClose() {
    modal.close();
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

  return (
    <StyledDayViewModal>
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
          <AvaliableWorkers duty={duty} onUpdate={update} />
        </StyledDutyViewBody>
      </StyledModalBody>
    </StyledDayViewModal>
  );
}

export const {
  ModalProvider: DayEditionModalProvider,
  useModal: useDayEditionModal,
} = createModalContext(DayEditionModal);

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
  const dutyModal = useDutySelectModal();

  function handleWorkerRemove() {
    if (worker.unbindDuty(duty)) onUpdate?.();
  }

  function handleOpenDutyModal() {
    dutyModal.open({ worker, onUpdate });
  }

  return (
    <StyledWorkerViewBody>
      {worker.data.name}
      <section className='info'>
        [<ColoredText color={gradutationColor}>{worker.data.graduation.toUpperCase()}</ColoredText>]
        <Gender />
        <HiUserRemove className="clickable" color='#c00000' onClick={handleWorkerRemove} />
        <FaCalendarAlt className='open-modal' onClick={handleOpenDutyModal} />
      </section>
    </StyledWorkerViewBody>
  );
}