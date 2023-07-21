import React from "react";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { FaTrash } from "react-icons/fa";
import styled from "styled-components";
import { DutyEditor, TableEditor, WorkerEditor } from "../../../app/api/table-edition";
import { createModalContext } from "../../contexts/modal";
import { useRerender } from "../../hooks";
import { ElementList } from "../../utils/react-iteration";
import { genderComponentMap } from "../DayEditionModal/utils";
import { DutyCard } from "../DutyCard";
import { formatWorkerID } from "../WorkerEditionCard/utils";
import { DutySelectionGrid } from "./DutySelectionGrid";

export interface DutySelectModalProps {
  worker: WorkerEditor;
  table: TableEditor;
  idList?: number[];
}

export function DutySelectModal(props: DutySelectModalProps) {
  const { table, worker } = props;

  const handler = useDutySelectModal();
  const rerender = useRerender();

  function handleClose() {
    handler.close();
  }

  const graduation = worker.graduation();
  const upperCaseGraduation = graduation.toUpperCase();
  const Gender = genderComponentMap[worker.gender()];

  const formattedWorkerID = formatWorkerID(worker.id());

  function handleExcludeDuty(dayIndex: number, dutyIndex: number) {
    const duty = table.getDay(dayIndex).getDuty(dutyIndex);

    if (worker.unbindDuty(duty)) rerender();
  }

  function handleAddDuty(duty: DutyEditor) {
    if (worker.hasDuty(duty.address()) && worker.unbindDuty(duty)) return rerender();

    if (worker.bindDuty(duty)) return rerender();
  }

  function handleClearDuties() {
    worker.unbindAllDuties();

    rerender();
  }

  return (
    <StyledDutySelectModal>
      <section className='head'>
        Escolha os turnos
        <AiOutlineCloseCircle onClick={handleClose} size={25} color="#cc0000" />
      </section>
      <section className='body'>
        <div className='presentation'>
          <span className='worker-info'>
            <span className='name'>
              {worker.name()}
            </span>
            <span className='other-info'>
              <label className='title'>Matricula</label>
              <p className='id'>{formattedWorkerID}</p>
              <label className='title'>Graduação</label>
              <label>{upperCaseGraduation}</label>
              <label className='title'>Sexo</label>
              <span className='gender'>
                <Gender />
              </span>
            </span>
          </span>
          <span className='delete-all-box'>
            <FaTrash onClick={handleClearDuties}/>
          </span>
          <span className='duty-list'>
            <ElementList Component={DutyCard} communProps={{ titleType: 'extence', onExcludeDuty: handleExcludeDuty }} iter={worker.iterDuties()} />
          </span>
        </div>
        <DutySelectionGrid onDutySelected={handleAddDuty} worker={worker} />
      </section>
    </StyledDutySelectModal>
  );
}

export const StyledDutySelectModal = styled.div`
  width: 80%;
  height: 80%;
  background-color: #d1d1d1;
  animation-duration: 200ms;
  border-radius: .5rem;
  display: grid;
  grid-template-rows: 2rem 1fr;
  border: 1px solid #0005;

  &>.head {
    background-color: #bbbbbb;
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;
    display: flex;
    justify-content: space-between;
    border-bottom: inherit;
    align-items: center;
    font-weight: bold;
    padding: 0 .5rem;

    &>svg {
      cursor: pointer;
    }
  }

  &>.body {
    grid-template-columns: 1fr 4fr;
    padding: .5rem;
    display: grid;

    &>.presentation {
      border-right: 1px solid #0005;
      flex-direction: column;
      padding-right: .5rem;
      display: flex;

      &>.worker-info {
        flex-direction: column;
        display: flex;
        flex: 1;
        gap: .7rem;
        font-weight: 900;

        &>.name {
          font-size: 1rem;
          text-align: center;
          font-weight: bold;
        }

        &>.other-info {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: .5rem;
          font-size: .8rem;

          &>* {
            border-bottom: 1px solid #0005;
          }

          &>label {
            width: 100%;
            display: flex;
            justify-content: space-between;
            gap: .2rem;
            font-size: .8rem;

            &.title::after {
              content: ":";
            }
          }

          &>.id {
            margin: 0;
            font-size: .9rem;
          }

          &>.gender {
            display: flex;
            align-items: center;
            font-size: 1.1rem;
          }
        }
      }

      &>.delete-all-box {
        &>svg {
          transition: all 200ms;
          cursor: pointer;

          &:hover {
            opacity: .7;
          }
        }
      }

      &>.duty-list {
        flex: 1;
        display: grid;
        gap: .5rem;
        border-top: 1px solid #0005;
        padding-top: .5rem;
        grid-template-rows: repeat(5, 1fr);

        &>* * {
          font-size: .7rem;
        }
      }
    }
  }
`;

export const {
  ModalProvider: DutySelectModalProvider,
  useModal: useDutySelectModal,
} = createModalContext(DutySelectModal);