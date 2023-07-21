import React, { useEffect, useState } from "react";
import { FaCalendarAlt, FaTrash } from 'react-icons/fa';
import { IoIosAddCircle } from 'react-icons/io';
import styled from "styled-components";
import { WorkerEditor } from "../../../app/api/table-edition";
import { useRerender } from "../../hooks";
import { ColoredText } from "../../pages/Generator/WorkerEditionStage.styles";
import { sleep } from "../../utils";
import { ElementList, IterProps } from "../../utils/react-iteration";
import { genderComponentMap, graduationTextColorMap } from "../DayEditionModal/utils";
import { DutyCard } from "../DutyCard";
import { formatWorkerID } from "./utils";
import { StyledWorkerEditionCard } from "./styles";
import { useDutySelectModal } from "../DutySelectModal";

export interface WorkerEditionCardProps {
  onOpenModal?: (day: number, duty: number) => void;
}

export function WorkerEditionCard(props: IterProps<WorkerEditor, WorkerEditionCardProps>) {
  const { onOpenModal } = props;

  const worker = props.entry;
  const rerender = useRerender();
  const [copiedID, setCopiedID] = useState(false);
  const dutyModal = useDutySelectModal();

  useEffect(() => {
    let valid = true;

    async function removeCopiedEffect() {
      await sleep(1000);

      if (valid) setCopiedID(false);
    }

    if (copiedID) removeCopiedEffect();

    return () => {
      valid = false
    };
  }, [copiedID]);

  const duties = worker.iterDuties();

  const graduation = worker.graduation();
  const upperCaseGraduation = graduation.toUpperCase();

  const Gender = genderComponentMap[worker.gender()];

  const formattedWorkerID = formatWorkerID(worker.id());

  function handleExcludeDuty(day: number, duty: number) {
    const dutyEditor = worker.table.getDay(day).getDuty(duty);

    if (dutyEditor.deleteWorker(worker.id()) && worker.deleteDuty(dutyEditor.address())) rerender();
  }

  function handleExcludeAllDuties() {
    worker.unbindAllDuties();

    rerender();
  }

  async function handleCopyID() {
    await navigator.clipboard.writeText(formattedWorkerID);

    setCopiedID(true);
  }

  function handleOpenDutySelection() {
    const { table } = worker;

    dutyModal.open({ table, worker });
  }

  return (
    <StyledWorkerEditionCard>
      <section className='presentation'>
        <p className='name'>{worker.name()}</p>
        <div className='info'>
          <Gender />
          [<ColoredText color={graduationTextColorMap[graduation]}>{upperCaseGraduation}</ColoredText>]
          <p className='id-box'>
            <span className='title'>
              MAT:
            </span>
            <span className={`content${copiedID ? ' copied' : ''}`} onClick={handleCopyID}>
              {formattedWorkerID}
            </span>
          </p>
        </div>
      </section>
      <section className='duty-list'>
        <ElementList Component={DutyCard} communProps={{ onExcludeDuty: handleExcludeDuty, onOpenModal }} iter={duties} />
      </section>
      <section className='commands'>
        <button className='add-duty-button' onClick={handleOpenDutySelection}>
          <FaCalendarAlt size={14} />
        </button>
        <button className='delete-all-button' onClick={handleExcludeAllDuties}>
          <FaTrash size={14} />
        </button>
      </section>
    </StyledWorkerEditionCard>
  );
}