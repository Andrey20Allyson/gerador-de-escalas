import React, { useState } from "react";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { BsFillArrowLeftCircleFill, BsFillArrowRightCircleFill } from "react-icons/bs";
import { DayViewer } from "../../app/api/table-visualization";
import { ColoredText } from "../pages/Generator/WorkerEditionStage.styles";
import { StyledDayViewModal, StyledDayViewNavigation, StyledDutyViewBody, StyledDutyViewNavButton, StyledDutyViewNavigation, StyledDutyViewSlotSection, StyledEmpityDutyMessage, StyledModalBody, StyledModalHeader, StyledModalTitle, StyledModalTitle2, StyledWorkerInfoSection, StyledWorkerViewBody } from "./DayViewModal.styles";
import { dutyTitles } from "./DutyTableGrid.utils";
import { genderComponentMap, graduationTextColorMap } from "./DayViewModal.utils";

export interface DayViewModalProps {
  day: DayViewer;
  onClose?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export function DayViewModal(props: DayViewModalProps) {
  const { day, onClose, onNext, onPrev } = props;

  const [closing, setClosing] = useState(false);
  const [dutyIndex, setDutyIndex] = useState(0);

  const duty = day.getDuty(dutyIndex);

  function handleAnimationEnd(ev: React.AnimationEvent<HTMLSpanElement>) {
    if (ev.animationName === 'close') onClose?.();
  }

  async function handleClose() {
    setClosing(true);
  }

  return (
    <StyledDayViewModal closing={closing} onAnimationEnd={handleAnimationEnd}>
      <StyledModalHeader>
        <div></div>
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
        <StyledDutyViewBody>
          <StyledDutyViewNavigation>
            {Array.from(day.iterDuties(), duty => {
              const thisDutyIndex = duty.data.index;

              return <StyledDutyViewNavButton selected={dutyIndex === thisDutyIndex} onClick={() => setDutyIndex(thisDutyIndex)}>{dutyTitles.at(thisDutyIndex)}</StyledDutyViewNavButton>;
            })}
          </StyledDutyViewNavigation>
          <StyledModalTitle2>
            Turno das {dutyTitles.at(dutyIndex)}
          </StyledModalTitle2>
          <StyledDutyViewSlotSection>
            {duty.numOfWorkers() > 0 ? Array.from(duty.iterWorkers(), worker => {
              const Gender = genderComponentMap[worker.data.gender];
              const gradutationColor = graduationTextColorMap[worker.data.graduation];

              return (
                <StyledWorkerViewBody>
                  {worker.data.name}
                  <StyledWorkerInfoSection>
                    [<ColoredText color={gradutationColor}>{worker.data.graduation.toUpperCase()}</ColoredText>]
                    <Gender />
                  </StyledWorkerInfoSection>
                </StyledWorkerViewBody>
              );
            }) : <StyledEmpityDutyMessage>Esse turno não possui componentes.</StyledEmpityDutyMessage>}
          </StyledDutyViewSlotSection>
        </StyledDutyViewBody>
      </StyledModalBody>
    </StyledDayViewModal>
  );
}