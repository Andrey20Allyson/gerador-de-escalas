import { WorkerEditor } from "../../../app/api/table-edition";
import { genderComponentMap, graduationTextColor2Map } from "../../components/DayEditionModal/utils";
import { DutyCard } from "../../components/DutyCard";
import { useDutySelectModal } from "../../components/DutySelectModal";
import { useRerender } from "../../hooks";
import { ColoredText } from "../../pages/Generator/WorkerEditionStage.styles";
import { sleep } from "../../utils";
import { ElementList, IterProps } from "../../utils/react-iteration";
import React, { useEffect, useState } from "react";
import { FaCalendarAlt, FaTrash } from 'react-icons/fa';
import { StyledWorkerEditionCard } from "./styles";
import { formatWorkerID } from "./utils";
import { WorkerEditorController } from "../../state/controllers/worker-editor";
import { DutyEditorController } from "../../state/controllers/duty-editor";

export interface WorkerEditionCardProps {
  onOpenModal?: (day: number, duty: number) => void;
}

export function WorkerEditionCard(props: IterProps<number, WorkerEditionCardProps>) {
  const { onOpenModal } = props;

  const workerController = new WorkerEditorController(props.entry);
  const { worker } = workerController;
  const duties = workerController.duties();
  
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

  const graduation = worker.graduation;
  const upperCaseGraduation = graduation.toUpperCase();

  const Gender = genderComponentMap[worker.gender];

  const formattedWorkerID = formatWorkerID(worker.workerId);

  function handleExcludeDuty(day: number, duty: number) {
    const dutyController = DutyEditorController.find(day, duty);

    workerController.leave(dutyController.duty.id);
  }

  function handleExcludeAllDuties() {
    workerController.leaveAll();
  }

  async function handleCopyID() {
    await navigator.clipboard.writeText(formattedWorkerID);

    setCopiedID(true);
  }

  function handleOpenDutySelection() {
    dutyModal.open({ worker: workerController, onUpdate: rerender });
  }

  return (
    <StyledWorkerEditionCard>
      <section className='presentation'>
        <p className='name'>{workerController.name()}</p>
        <div className='info'>
          <Gender />
          <ColoredText className='graduation' color={graduationTextColor2Map[graduation]}>{upperCaseGraduation}</ColoredText>
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