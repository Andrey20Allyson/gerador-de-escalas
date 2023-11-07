import { DutyEditor, WorkerEditor } from "@gde/app/api/table-edition";
import { genderComponentMap, graduationTextColorMap } from "@gde/renderer/components/DayEditionModal/utils";
import { useDutySelectModal } from "@gde/renderer/components/DutySelectModal";
import { ColoredText } from "@gde/renderer/pages/Generator/WorkerEditionStage.styles";
import { ElementList, IterProps } from "@gde/renderer/utils/react-iteration";
import React, { useState } from "react";
import { BiSearch } from "react-icons/bi";
import { FaCalendarAlt } from "react-icons/fa";
import { HiUserAdd } from "react-icons/hi";
import styled from "styled-components";
import { StyledAvaliableWorkerBody, StyledAvaliableWorkerSearchBody, StyledAvaliableWorkersScrollable, StyledAvaliableWorkersSection } from "./styles";

export interface AvaliableWorkers {
  onUpdate?: () => void;
  duty: DutyEditor;
}

export function AvaliableWorkers(props: AvaliableWorkers) {
  const [search, setSearch] = useState<string>();
  const { duty, onUpdate } = props;
  const { day } = duty;
  const { table } = day;

  const workers = iterFilteredWorkers(duty, table.iterWorkers(), search);

  function handleSearchChange(ev: React.ChangeEvent<HTMLInputElement>) {
    const { value } = ev.currentTarget;

    setSearch(value.length === 0 ? undefined : value)
  }

  return (
    <StyledAvaliableWorkerBody>
      <StyledAvaliableWorkerSearchBody>
        <input type="text" placeholder="Buscar" onChange={handleSearchChange} />
        <BiSearch />
      </StyledAvaliableWorkerSearchBody>
      <StyledAvaliableWorkersSection>
        <StyledAvaliableWorkersScrollable>
          <ElementList iter={workers} communProps={{ duty }} Component={(props: IterProps<WorkerEditor, { duty: DutyEditor }>) => {
            const { duty } = props;
            const worker = props.entry;
            const selectionModal = useDutySelectModal();

            const Gender = genderComponentMap[worker.gender()];
            const gradutationColor = graduationTextColorMap[worker.graduation()];
            const dutyLimit = worker.data.maxDuties;

            function handleAddWorker() {
              if (worker.isFull()) return;

              duty.bindWorker(worker);

              onUpdate?.();
            }

            function handleOpenModal() {
              selectionModal.open({ worker });
            }

            return (
              <StyledAvaliableWorker>
                {worker.name()}
                <section className='info'>
                  [<ColoredText color='#303100'>{worker.numOfDuties()} / {dutyLimit}</ColoredText>]
                  [<ColoredText color={gradutationColor}>{worker.data.graduation.toUpperCase()}</ColoredText>]
                  <Gender />
                  <HiUserAdd className={`add-worker ${worker.isFull() ? ' unclickable' : ''}`} onClick={handleAddWorker} />
                  <FaCalendarAlt className='open-selection-modal' onClick={handleOpenModal} />
                </section>
              </StyledAvaliableWorker>
            );
          }} />
        </StyledAvaliableWorkersScrollable>
      </StyledAvaliableWorkersSection>
    </StyledAvaliableWorkerBody>
  );
}

export const StyledAvaliableWorker = styled.span`
  justify-content: space-between;
  background-color: #dbdbdb;
  box-shadow: -.2rem .2rem .3rem #0003;
  border-radius: .3rem;
  align-items: center;
  width: 95%;
  padding: .3rem;
  display: flex;

  & * {
    user-select: none;
  }

  &>.info {
    height: 100%;
    display: flex;
    gap: .3rem;
    align-items: center;

    &>.add-worker {
      color: #0f9c0a;
      cursor: pointer;
      
      &.unclickable {
        color: #0f9c0a67;
        cursor: default;
      }
    }

    &>.open-selection-modal {
      cursor: pointer;
      color: #535353;
    }
  }
`;

export function* iterFilteredWorkers(duty: DutyEditor, workers: Iterable<WorkerEditor>, search: string | undefined): Iterable<WorkerEditor> {
  for (const worker of workers) {
    if (!duty.canAddWorker(worker)) continue;
    if (search && !worker.name().toLowerCase().includes(search.toLowerCase())) continue;

    yield worker;
  }
}