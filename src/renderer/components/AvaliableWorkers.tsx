import React, { useState } from "react";
import { BiSearch } from "react-icons/bi";
import { HiUserAdd } from "react-icons/hi";
import { SlOptionsVertical } from "react-icons/sl";
import { DutyViewer, WorkerViewer } from "../../app/api/table-visualization";
import { ColoredText } from "../pages/Generator/WorkerEditionStage.styles";
import { ElementList } from "../utils/react-iteration";
import { StyledAvaliableWorker, StyledAvaliableWorkerBody, StyledAvaliableWorkerSearchBody, StyledAvaliableWorkersScrollable, StyledAvaliableWorkersSection } from "./AvaliableWorkers.styles";
import { StyledWorkerInfoSection } from "./DayViewModal.styles";
import { genderComponentMap, graduationTextColorMap } from "./DayViewModal.utils";

export interface AvaliableWorkers {
  onUpdate?: () => void;
  duty: DutyViewer;
}

export function AvaliableWorkers(props: AvaliableWorkers) {
  const [search, setSearch] = useState<string>();
  const { duty, onUpdate } = props;

  const day = duty.parent;
  const isDutyFull = duty.numOfWorkers() >= 3;
  const workers = iterFilteredWorkers(day.parent.iterWorkers(), search);

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

            const Gender = genderComponentMap[worker.getGender()];
            const gradutationColor = graduationTextColorMap[worker.getGraduation()];

            function handleAddWorker() {
              if (isDutyFull) return;

              duty.addWorker(worker.data);
              worker.addDuty(duty.data);

              onUpdate?.();
            }

            const dutyLimit = worker.data.maxDuties;

            return (
              <StyledAvaliableWorker>
                {worker.getName()}
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

export function* iterFilteredWorkers(workers: Iterable<WorkerViewer>, search: string | undefined): Iterable<WorkerViewer> {
  for (const worker of workers) {
    if (worker.numOfDuties() >= worker.data.maxDuties) continue;
    if (search && !worker.getName().toLowerCase().includes(search.toLowerCase())) continue;

    yield worker;
  }
}