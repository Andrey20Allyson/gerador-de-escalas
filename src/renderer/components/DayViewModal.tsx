
import React, { useState } from "react";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { BsFillArrowLeftCircleFill, BsFillArrowRightCircleFill } from "react-icons/bs";
import { HiUserRemove } from "react-icons/hi";
import { SlOptionsVertical } from 'react-icons/sl';
import { DayViewer, DutyViewer, WorkerViewer } from "../../app/api/table-visualization";
import { useRerender } from "../hooks";
import { ColoredText } from "../pages/Generator/WorkerEditionStage.styles";
import { ElementList, IterProps } from "../utils/react-iteration";
import { AvaliableWorkers } from "./AvaliableWorkers";
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
} from "./DayViewModal.styles";
import { genderComponentMap, graduationTextColorMap } from "./DayViewModal.utils";
import { dutyTitles } from "./DutyTableGrid.utils";

export interface DayViewModalProps {
  day: DayViewer;
  onClose?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export function DayViewModal(props: DayViewModalProps) {
  const { day, onClose, onNext, onPrev } = props;
  const rerender = useRerender();

  const [closing, setClosing] = useState(false);
  const [dutyIndex, setDutyIndex] = useState(0);

  const duty = day.getDuty(dutyIndex);

  function handleAnimationEnd(ev: React.AnimationEvent<HTMLSpanElement>) {
    if (ev.animationName === 'close') onClose?.();
  }

  async function handleClose() {
    setClosing(true);
  }

  const dutyViewContent = duty.numOfWorkers() > 0
    ? <ElementList communProps={{ duty, onUpdate: rerender }} iter={duty.iterWorkers()} Component={WorkerView} />
    : <StyledEmpityDutyMessage>Esse turno não possui componentes.</StyledEmpityDutyMessage>;

  return (
    <StyledDayViewModal closing={closing} onAnimationEnd={handleAnimationEnd}>
      <StyledModalHeader>
        <div />
        <StyledDayViewNavigation>
          <BsFillArrowLeftCircleFill onClick={onPrev} />
          <StyledModalTitle>
            Dia {day.data.index + 1}
          </StyledModalTitle>
          <BsFillArrowRightCircleFill onClick={onNext} />
        </StyledDayViewNavigation>
        <AiOutlineCloseCircle onClick={handleClose} size={25} color="#cc0000" />
      </StyledModalHeader>
      <StyledModalBody>
        <DutyViewNavation day={day} duty={duty} onNavate={setDutyIndex} />
        <StyledModalTitle2>
          Turno das {dutyTitles.at(dutyIndex)}
        </StyledModalTitle2>
        <StyledDutyViewBody>
          <StyledDutyViewSlotSection>
            {dutyViewContent}
          </StyledDutyViewSlotSection>
          <AvaliableWorkers duty={duty} onUpdate={rerender} />
        </StyledDutyViewBody>
      </StyledModalBody>
    </StyledDayViewModal>
  );
}

export interface DutyViewNavationProps {
  duty: DutyViewer;
  day: DayViewer;
  onNavate?: (newIndex: number) => void;
}

export function DutyViewNavation(props: DutyViewNavationProps) {
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
  duty: DutyViewer;
}

export function WorkerView(props: IterProps<WorkerViewer, WorkerViewProps>) {
  const { entry: worker, duty, onUpdate } = props;
  const Gender = genderComponentMap[worker.data.gender];
  const gradutationColor = graduationTextColorMap[worker.data.graduation];

  function handleWorkerRemove() {
    const success = worker.removeDuty(duty.data) && duty.removeWorker(worker.data);
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