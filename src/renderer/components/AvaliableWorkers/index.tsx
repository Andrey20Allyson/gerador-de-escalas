import React, { useState } from "react";
import { BiSearch } from "react-icons/bi";
import { HiUserAdd } from "react-icons/hi";
import { SlOptionsVertical } from "react-icons/sl";
import { DutyEditor, WorkerEditor } from "../../../app/api/table-edition";
import { ColoredText } from "../../pages/Generator/WorkerEditionStage.styles";
import { ElementList } from "../../utils/react-iteration";
import { StyledAvaliableWorker, StyledAvaliableWorkerBody, StyledAvaliableWorkerSearchBody, StyledAvaliableWorkersScrollable, StyledAvaliableWorkersSection } from "./styles";
import { StyledWorkerInfoSection } from "../DayEditionModal/styles";
import { genderComponentMap, graduationTextColorMap } from "../DayEditionModal/utils";

export interface AvaliableWorkers {
  onUpdate?: () => void;
  duty: DutyEditor;
}

export function AvaliableWorkers(props: AvaliableWorkers) {
  const [search, setSearch] = useState<string>();
  const { duty, onUpdate } = props;

  const day = duty.parent;
  const isDutyFull = duty.numOfWorkers() >= 3;
  const workers = iterFilteredWorkers(day.table.iterWorkers(), search);

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
          <ElementList iter={workers} Component={(props) => {
            const { entry: worker } = props;

            const Gender = genderComponentMap[worker.gender()];
            const gradutationColor = graduationTextColorMap[worker.graduation()];

            function handleAddWorker() {
              if (isDutyFull) return;

              duty.addWorker(worker.id());
              worker.addDuty(duty.address());

              onUpdate?.();
            }

            const dutyLimit = worker.data.maxDuties;

            return (
              <StyledAvaliableWorker>
                {worker.name()}
                <StyledWorkerInfoSection>
                  [<ColoredText color='#303100'>{dutyLimit - worker.numOfDuties()} / {dutyLimit}</ColoredText>]
                  [<ColoredText color={gradutationColor}>{worker.data.graduation.toUpperCase()}</ColoredText>]
                  <Gender />
                  <HiUserAdd className={isDutyFull ? undefined : 'clickable'} color={isDutyFull ? '#2055274b' : '#078118'} onClick={handleAddWorker} />
                  <SlOptionsVertical />
                </StyledWorkerInfoSection>
              </StyledAvaliableWorker>
            );
          }} />
        </StyledAvaliableWorkersScrollable>
      </StyledAvaliableWorkersSection>
    </StyledAvaliableWorkerBody>
  );
}

export function* iterFilteredWorkers(workers: Iterable<WorkerEditor>, search: string | undefined): Iterable<WorkerEditor> {
  for (const worker of workers) {
    if (worker.numOfDuties() >= worker.data.maxDuties) continue;
    if (search && !worker.name().toLowerCase().includes(search.toLowerCase())) continue;

    yield worker;
  }
}