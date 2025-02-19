import React from "react";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { BsGearFill } from "react-icons/bs";
import { FaTrash } from "react-icons/fa";
import styled from "styled-components";
import { genderComponentMap } from "../../components/DayEditionModal/utils";
import { DutyCard } from "../../components/DutyCard";
import { useRulesModal } from "../../components/RulesModal";
import { formatWorkerID } from "../../components/WorkerEditionCard/utils";
import { createModalContext } from "../../contexts/modal";
import { TableEditorController } from "../../state/controllers/editor/table";
import { WorkerEditorController } from "../../state/controllers/editor/worker";
import { ElementList } from "../../utils/react-iteration";
import { DutySelectionGrid } from "./DutySelectionGrid";
import { Scrollable } from "../Scrollable";
import { OrdinaryFormatter } from "../../state/formatters/editor/ordinary";

export interface DutySelectModalProps {
  workerId: number;
  idList?: number[];
}

export function DutySelectModal(props: DutySelectModalProps) {
  const { workerId } = props;
  const tableController = new TableEditorController();
  const workerController = new WorkerEditorController(workerId);

  const { worker } = workerController;

  const handler = useDutySelectModal();
  const rulesModal = useRulesModal();

  function handleClose() {
    handler.close();
  }

  const upperCaseGraduation = worker.graduation.toUpperCase();
  const Gender = genderComponentMap[worker.gender];

  const formattedWorkerID = formatWorkerID(worker.workerId);

  function handleExcludeDuty(dutyId: number) {
    workerController.leave(dutyId);
  }

  function handleAddDuty(dutyId: number) {
    const selected = workerController
      .duties()
      .some((duty) => duty.id === dutyId);

    if (selected) {
      workerController.leave(dutyId);
    } else {
      workerController.enter(dutyId);
    }
  }

  function handleClearDuties() {
    workerController.leaveAll();
  }

  function handleChangeRules() {
    rulesModal.open();
  }

  const ordinaryFormatter = new OrdinaryFormatter(worker.ordinary);

  return (
    <StyledDutySelectModal>
      <section className="head">
        Escolha os turnos
        <AiOutlineCloseCircle onClick={handleClose} size={25} color="#cc0000" />
      </section>
      <section className="body">
        <div className="presentation">
          <span className="worker-info">
            <span className="name">{worker.name}</span>
            <span className="other-info">
              <label className="title">Matricula</label>
              <p className="id">{formattedWorkerID}</p>
              <label className="title">Graduação</label>
              <label>{upperCaseGraduation}</label>
              <label className="title">Sexo</label>
              <span className="gender">
                <Gender />
              </span>
              <label>Expediente Ord.</label>
              <label>{ordinaryFormatter.officeHour()}</label>
              <label>Horas Ord.</label>
              <label>{ordinaryFormatter.duration()}</label>
            </span>
          </span>
          <span className="options-box">
            <FaTrash onClick={handleClearDuties} />
            <BsGearFill onClick={handleChangeRules} />
          </span>
          <Scrollable className="duty-list">
            <ElementList
              Component={DutyCard}
              communProps={{
                titleType: "extence",
                onExcludeDuty: handleExcludeDuty,
              }}
              iter={workerController.dutyIds()}
            />
          </Scrollable>
        </div>
        <DutySelectionGrid
          onDutySelected={handleAddDuty}
          workerId={worker.id}
        />
      </section>
    </StyledDutySelectModal>
  );
}

export const StyledDutySelectModal = styled.div`
  width: 80%;
  height: 80%;
  background-color: #d1d1d1;
  animation-duration: 200ms;
  border-radius: 0.5rem;
  display: grid;
  grid-template-rows: 2rem 1fr;
  border: 1px solid #0005;

  & > .head {
    background-color: #bbbbbb;
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;
    display: flex;
    justify-content: space-between;
    border-bottom: inherit;
    align-items: center;
    font-weight: bold;
    padding: 0 0.5rem;

    & > svg {
      cursor: pointer;
    }
  }

  & > .body {
    grid-template-columns: 1fr 4fr;
    padding: 0.5rem;
    display: grid;

    & > .presentation {
      border-right: 1px solid #0005;
      flex-direction: column;
      padding-right: 0.5rem;
      display: flex;

      & > .worker-info {
        flex-direction: column;
        display: flex;
        flex: 1;
        gap: 0.7rem;
        font-weight: 900;

        & > .name {
          font-size: 1rem;
          text-align: center;
          font-weight: bold;
        }

        & > .other-info {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 0.5rem;
          font-size: 0.8rem;

          & > * {
            border-bottom: 1px solid #0005;
          }

          & > label {
            width: 100%;
            display: flex;
            justify-content: space-between;
            gap: 0.2rem;
            font-size: 0.8rem;

            &.title::after {
              content: ":";
            }
          }

          & > .id {
            margin: 0;
            font-size: 0.9rem;
          }

          & > .gender {
            display: flex;
            align-items: center;
            font-size: 1.1rem;
          }
        }
      }

      & > .options-box {
        display: flex;
        gap: 0.5rem;
        padding: 0.5rem 0;

        & > svg {
          transition: all 200ms;
          cursor: pointer;

          &:hover {
            opacity: 0.7;
          }
        }
      }

      & > .duty-list {
        flex: 1;
        display: grid;
        gap: 0.5rem;
        border-top: 1px solid #0005;
        padding-top: 0.5rem;
        grid-template-rows: repeat(5, 1fr);

        & > * * {
          font-size: 0.7rem;
        }
      }
    }
  }
`;

export const {
  ModalProvider: DutySelectModalProvider,
  useModal: useDutySelectModal,
} = createModalContext(DutySelectModal);
