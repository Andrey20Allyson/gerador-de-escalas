import React, { useEffect, useState } from "react";
import { FaCalendarAlt, FaTrash } from "react-icons/fa";
import {
  genderComponentMap,
  graduationTextColor2Map,
} from "../../components/DayEditionModal/utils";
import { DutyCard } from "../../components/DutyCard";
import { useDutySelectModal } from "../../components/DutySelectModal";
import { ColoredText } from "../../styles/WorkerEditionStage.styles";
import { WorkerEditorController } from "../../state/controllers/editor/worker";
import { sleep } from "../../utils";
import { ElementList, IterProps } from "../../utils/react-iteration";
import { StyledWorkerEditionCard } from "./styles";
import { formatWorkerID } from "./utils";

export interface WorkerEditionCardProps {
  onOpenModal?: (dutyId: number) => void;
}

export function WorkerEditionCard(
  props: IterProps<number, WorkerEditionCardProps>,
) {
  const { onOpenModal } = props;

  const workerController = new WorkerEditorController(props.entry);
  const { worker } = workerController;

  const dutyIds = workerController.duties().map((duty) => duty.id);

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
      valid = false;
    };
  }, [copiedID]);

  const graduation = worker.graduation;
  const upperCaseGraduation = graduation.toUpperCase();

  const Gender = genderComponentMap[worker.gender];

  const formattedWorkerID = formatWorkerID(worker.workerId);

  function handleExcludeDuty(dutyId: number) {
    workerController.leave(dutyId);
  }

  function handleExcludeAllDuties() {
    workerController.leaveAll();
  }

  async function handleCopyID() {
    await navigator.clipboard.writeText(formattedWorkerID);

    setCopiedID(true);
  }

  function handleOpenDutySelection() {
    dutyModal.open({ workerId: worker.id });
  }

  return (
    <StyledWorkerEditionCard>
      <section className="presentation">
        <p className="name">{worker.name}</p>
        <div className="info">
          <Gender />
          <ColoredText
            className="graduation"
            color={graduationTextColor2Map[graduation]}
          >
            {upperCaseGraduation}
          </ColoredText>
          <p className="id-box">
            <span className="title">MAT:</span>
            <span
              className={`content${copiedID ? " copied" : ""}`}
              onClick={handleCopyID}
            >
              {formattedWorkerID}
            </span>
          </p>
        </div>
      </section>
      <section className="duty-list">
        <ElementList
          Component={DutyCard}
          communProps={{ onExcludeDuty: handleExcludeDuty, onOpenModal }}
          iter={dutyIds}
        />
      </section>
      <section className="commands">
        <button className="add-duty-button" onClick={handleOpenDutySelection}>
          <FaCalendarAlt size={14} />
        </button>
        <button className="delete-all-button" onClick={handleExcludeAllDuties}>
          <FaTrash size={14} />
        </button>
      </section>
    </StyledWorkerEditionCard>
  );
}
