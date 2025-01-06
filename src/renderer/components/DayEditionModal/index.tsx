import React, { useState } from "react";
import { AiOutlineCloseCircle, AiOutlineDoubleLeft, AiOutlineDoubleRight, AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import { FaCalendarAlt } from "react-icons/fa";
import { HiUserRemove } from "react-icons/hi";
import { AvaliableWorkers } from "../../components/AvaliableWorkers";
import { useDutySelectModal } from "../../components/DutySelectModal";
import { createModalContext } from "../../contexts/modal";
import { ColoredText } from "../../pages/Generator/WorkerEditionStage.styles";
import { DutyEditorController } from "../../state/controllers/editor/duty";
import { DutySearcher } from "../../state/controllers/editor/searchers/duty";
import { TableEditorController } from "../../state/controllers/editor/table";
import { WorkerEditorController } from "../../state/controllers/editor/worker";
import { ElementList, IterProps } from "../../utils/react-iteration";
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
import { DateData } from "../../../apploader/api/table-reactive-edition/table";

export interface DutyViewModalProps {
  dutyId: number;
}

export function DutyEditionModal(props: DutyViewModalProps) {
  const { dutyId: startDutyId } = props;

  const [dutyId, setDutyId] = useState(startDutyId);
  const dutyController = new DutyEditorController(dutyId);
  const { duty } = dutyController;

  const modal = useDayEditionModal();

  const dutyViewContent = dutyController.size() > 0
    ? <ElementList communProps={{ dutyId }} iter={dutyController.workerIds()} Component={WorkerCard} />
    : <StyledEmpityDutyMessage>Esse turno não possui componentes.</StyledEmpityDutyMessage>;

  function handleClose() {
    modal.close();
  }

  function nextDay() {
    setDutyId(dutyController.nextDay().duty.id);
  }

  function prevDay() {
    setDutyId(dutyController.prevDay().duty.id);
  }

  function nextDuty() {
    setDutyId(dutyController.next().duty.id);
  }

  function prevDuty() {
    setDutyId(dutyController.prev().duty.id);
  }

  return (
    <StyledDayViewModal>
      <StyledModalHeader>
        <div />
        <StyledDayViewNavigation>
          <AiOutlineDoubleLeft onClick={prevDay} />
          <AiOutlineLeft onClick={prevDuty} />
          <StyledModalTitle>
            {dutyController.format.day()}
          </StyledModalTitle>
          <AiOutlineRight onClick={nextDuty} />
          <AiOutlineDoubleRight onClick={nextDay} />
        </StyledDayViewNavigation>
        <AiOutlineCloseCircle onClick={handleClose} size={25} color="#cc0000" />
      </StyledModalHeader>
      <StyledModalBody>
        <DutyEditionNavation day={duty.date} selectedDutyIndex={duty.index} onNavigate={setDutyId} />
        <StyledModalTitle2>
          Turno das {dutyController.format.hours()}
        </StyledModalTitle2>
        <StyledDutyViewBody>
          <StyledDutyViewSlotSection>
            {dutyViewContent}
          </StyledDutyViewSlotSection>
          <AvaliableWorkers dutyId={duty.id} />
        </StyledDutyViewBody>
      </StyledModalBody>
    </StyledDayViewModal>
  );
}

export const {
  ModalProvider: DayEditionModalProvider,
  useModal: useDayEditionModal,
} = createModalContext(DutyEditionModal);

export interface DutyViewNavationProps {
  day: DateData;
  selectedDutyIndex: number;
  onNavigate?: (id: number) => void;
}

export function DutyEditionNavation(props: DutyViewNavationProps) {
  const { day, selectedDutyIndex, onNavigate } = props;

  const tableController = new TableEditorController();
  const dutyIds = tableController
    .findDuties(DutySearcher.dayEquals(day))
    .map(controller => controller.duty.id);

  return (
    <StyledDutyViewNavigation>
      <ElementList iter={dutyIds} Component={props => {
        const { entry: dutyId } = props;

        const dutyController = new DutyEditorController(dutyId);
        const { duty } = dutyController;

        function handleNavigate() {
          onNavigate?.(duty.id);
        }

        return (
          <StyledDutyViewNavButton selected={duty.index === selectedDutyIndex} onClick={handleNavigate}>
            {dutyController.format.hours()}
          </StyledDutyViewNavButton>
        );
      }} />
    </StyledDutyViewNavigation>
  );
}

export interface WorkerViewProps {
  dutyId: number;
}

export function WorkerCard(props: IterProps<number, WorkerViewProps>) {
  const { entry: workerId, dutyId } = props;
  
  const workerController = new WorkerEditorController(workerId);
  const { worker } = workerController;

  const Gender = genderComponentMap[worker.gender];
  const gradutationColor = graduationTextColorMap[worker.graduation];
  const dutyModal = useDutySelectModal();

  function handleWorkerRemove() {
    workerController.leave(dutyId);
  }

  function handleOpenDutyModal() {
    dutyModal.open({ workerId });
  }

  return (
    <StyledWorkerViewBody>
      {worker.name}
      <section className='info'>
        [<ColoredText color={gradutationColor}>{worker.graduation.toUpperCase()}</ColoredText>]
        <Gender />
        <HiUserRemove className="clickable" color='#c00000' onClick={handleWorkerRemove} />
        <FaCalendarAlt className='open-modal' onClick={handleOpenDutyModal} />
      </section>
    </StyledWorkerViewBody>
  );
}