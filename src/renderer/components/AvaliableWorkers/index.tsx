import React, { useState } from "react";
import { BiSearch } from "react-icons/bi";
import { FaCalendarAlt } from "react-icons/fa";
import { HiUserAdd } from "react-icons/hi";
import { DutyEditorController } from "../../state/controllers/editor/duty";
import { TableEditorController } from "../../state/controllers/editor/table";
import { WorkerEditorController } from "../../state/controllers/editor/worker";
import styled from "styled-components";
import { DutyEditor, WorkerEditor } from "../../../apploader/api/table-edition";
import {
  genderComponentMap,
  graduationTextColorMap,
} from "../../components/DayEditionModal/utils";
import { useDutySelectModal } from "../../components/DutySelectModal";
import { ColoredText } from "../../pages/Generator/WorkerEditionStage.styles";
import { ElementList, IterProps } from "../../utils/react-iteration";
import {
  StyledAvaliableWorkerBody,
  StyledAvaliableWorkerSearchBody,
  StyledAvaliableWorkersScrollable,
  StyledAvaliableWorkersSection,
} from "./styles";

export interface AvaliableWorkers {
  dutyId: number;
}

export function AvaliableWorkers(props: AvaliableWorkers) {
  const [search, setSearch] = useState<string>();
  const { dutyId } = props;
  const tableController = new TableEditorController();
  const dutyController = new DutyEditorController(dutyId);
  const { duty } = dutyController;

  const workers = tableController.table.workers.map((worker) => worker.id);

  function handleSearchChange(ev: React.ChangeEvent<HTMLInputElement>) {
    const { value } = ev.currentTarget;

    setSearch(value.length === 0 ? undefined : value);
  }

  return (
    <StyledAvaliableWorkerBody>
      <StyledAvaliableWorkerSearchBody>
        <input type="text" placeholder="Buscar" onChange={handleSearchChange} />
        <BiSearch />
      </StyledAvaliableWorkerSearchBody>
      <StyledAvaliableWorkersSection>
        <StyledAvaliableWorkersScrollable>
          <ElementList
            iter={workers}
            communProps={{ dutyId }}
            Component={(props: IterProps<number, { dutyId: number }>) => {
              const { dutyId, entry: workerId } = props;

              const tableController = new TableEditorController();
              const { table } = tableController;

              const workerController = new WorkerEditorController(workerId);
              const { worker } = workerController;

              const selectionModal = useDutySelectModal();

              const Gender = genderComponentMap[worker.gender];
              const gradutationColor =
                graduationTextColorMap[worker.graduation];
              const dutyLimit = table.config.workerCapacity;

              function handleAddWorker() {
                workerController.enter(dutyId);
              }

              function handleOpenModal() {
                selectionModal.open({ workerId });
              }

              return (
                <StyledAvaliableWorker>
                  {worker.name}
                  <section className="info">
                    [
                    <ColoredText color="#303100">
                      {workerController.duties().length} / {dutyLimit}
                    </ColoredText>
                    ] [
                    <ColoredText color={gradutationColor}>
                      {worker.graduation.toUpperCase()}
                    </ColoredText>
                    ]
                    <Gender />
                    {/* TODO make verification of worker insertion rules */}
                    <HiUserAdd
                      className={`add-worker ${false ? " unclickable" : ""}`}
                      onClick={handleAddWorker}
                    />
                    <FaCalendarAlt
                      className="open-selection-modal"
                      onClick={handleOpenModal}
                    />
                  </section>
                </StyledAvaliableWorker>
              );
            }}
          />
        </StyledAvaliableWorkersScrollable>
      </StyledAvaliableWorkersSection>
    </StyledAvaliableWorkerBody>
  );
}

export const StyledAvaliableWorker = styled.span`
  justify-content: space-between;
  background-color: #dbdbdb;
  box-shadow: -0.2rem 0.2rem 0.3rem #0003;
  border-radius: 0.3rem;
  align-items: center;
  width: 95%;
  padding: 0.3rem;
  display: flex;

  & * {
    user-select: none;
  }

  & > .info {
    height: 100%;
    display: flex;
    gap: 0.3rem;
    align-items: center;

    & > .add-worker {
      color: #0f9c0a;
      cursor: pointer;

      &.unclickable {
        color: #0f9c0a67;
        cursor: default;
      }
    }

    & > .open-selection-modal {
      cursor: pointer;
      color: #535353;
    }
  }
`;

export function* iterFilteredWorkers(
  duty: DutyEditor,
  workers: Iterable<WorkerEditor>,
  search: string | undefined,
): Iterable<WorkerEditor> {
  for (const worker of workers) {
    if (!duty.canAddWorker(worker)) continue;
    if (search && !worker.name().toLowerCase().includes(search.toLowerCase()))
      continue;

    yield worker;
  }
}
