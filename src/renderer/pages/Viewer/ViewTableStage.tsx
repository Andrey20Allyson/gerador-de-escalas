import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { DayViewer, TableViewer } from "../../../app/api/table-visualization/table-viewer";
import { Gender, Graduation } from "../../extra-duty-lib";
import { iterRange } from "../../utils";
import { AiOutlineCloseCircle, AiOutlineExpandAlt } from 'react-icons/ai';

export function useTableViewer() {
  const [viewer, setViewer] = useState<TableViewer>();

  useEffect(() => {
    async function load() {
      const viewerData = await window.api.getLoadedTableViewerData();
      if (!viewerData) return alert(`a tabela ainda não foi carretada corretamente, tente recarregar o visualizador!`);

      setViewer(new TableViewer(viewerData));
    }

    load();
  }, []);

  return viewer;
}

export function ViewTableStage() {
  const table = useTableViewer();

  return (
    <>
      {table && <DayViewGrid table={table} />}
    </>
  );
}

export interface DayViewGridProps {
  table: TableViewer;
}

const dutyTitles = [
  '7 as 19h',
  '19 as 7h',
];

export function DayViewGrid(props: DayViewGridProps) {
  const { table } = props;
  const [selectedDay, setSelectedDay] = useState<DayViewer | undefined>(table.getDay(0));

  function createDay(dayIndex: number) {
    const day = table.getDay(dayIndex);

    function createDuty(dutyIndex: number) {
      const duty = day.getDuty(dutyIndex);

      function createWorker(workerIndex: number) {
        const worker = duty.data.workers.at(workerIndex);

        return worker
          ? <StyledDutySlot gender={worker.gender} graduation={worker.graduation} />
          : <StyledEmpityDutySlot />;
      }

      return (
        <StyledDuty key={dutyIndex}>
          {(Array.from(iterRange(0, 3), createWorker))}
          <StyledDutyTitle>{dutyTitles.at(dutyIndex) ?? 'N/A'}</StyledDutyTitle>
        </StyledDuty>
      )
    }

    function handleSelectDay() {
      setSelectedDay(day);
    }

    return (
      <StyledDay key={dayIndex}>
        <StyledDutyHeader>
          <StyledDayTitle>Dia {dayIndex + 1}</StyledDayTitle>
          <AiOutlineExpandAlt onClick={handleSelectDay} />
        </StyledDutyHeader>
        <StyledDutiesContainer>
          {Array.from(iterRange(0, 2), createDuty)}
        </StyledDutiesContainer>
      </StyledDay>
    )
  }

  return (
    <StyledDayViewGrid>
      {Array.from(iterRange(0, 31), createDay)}
      {selectedDay && <DayViewModal onClose={() => setSelectedDay(undefined)} day={selectedDay} />}
    </StyledDayViewGrid>
  )
}

interface DayViewModalProps {
  day: DayViewer;
  onClose?: () => void;
}

function DayViewModal(props: DayViewModalProps) {
  const { day, onClose } = props;

  const [closing, setClosing] = useState(false);
  const [dutyIndex, setDutyIndex] = useState(0);

  const duty = day.getDuty(dutyIndex);

  function handleAnimationEnd(ev: React.AnimationEvent<HTMLSpanElement>) {
    if (ev.animationName === 'close') onClose?.();
  }

  async function handleClose() {
    setClosing(true);
  }

  return (
    <StyledDayViewModal closing={closing} onAnimationEnd={handleAnimationEnd}>
      <StyledModalHeader>
        <StyledModalTitle>Dia {day.data.index + 1}</StyledModalTitle>
        <AiOutlineCloseCircle onClick={handleClose} size={15} />
      </StyledModalHeader>
      <StyledModalBody>
        <h4>Turno {dutyIndex + 1}</h4>
        <StyledDutyViewBody>
          {Array.from(duty.iterWorkers(), worker => (
            <StyledWorkerViewBody>
              {worker.data.name}
            </StyledWorkerViewBody>
          ))}
        </StyledDutyViewBody>
      </StyledModalBody>
    </StyledDayViewModal>
  );
}

const StyledWorkerViewBody = styled.span`
  background-color: #e2e2e2;
  padding: .3rem;
  border-radius: .3rem;
  box-shadow: -.2rem .2rem .2rem #0002;
`;

const StyledDutyViewBody = styled.section`
  padding: .5rem;
  gap: .2rem;
  display: flex;
  flex-direction: column;
`;

const StyledModalBody = styled.div`

`;

const StyledModalHeader = styled.div`
  display: flex;
  height: 20px;
  padding: 0 .4rem;
  justify-content: space-between;
  align-items: center;
  background-color: #c0c0c0;

  &>svg {
    cursor: pointer;
  }
`;

const StyledModalTitle = styled.h1`
  user-select: none;
  font-size: 14px;
  flex: 1;
`;

interface StyledDayViewModalProps {
  closing?: boolean;
}

const StyledDayViewModal = styled.span<StyledDayViewModalProps>`
  overflow: hidden;
  box-sizing: content-box;
  flex-direction: column;
  position: absolute;
  display: flex;
  width: 90%;
  height: 90%;
  right: 50%;
  top: 50%;
  transform: translate(50%, -50%);
  background-color: #eee;
  border-radius: .5rem;
  box-shadow: -.4rem .4rem .6rem #0005;
  animation-name: ${({ closing }) => closing ? 'close' : 'open'};
  animation-duration: 200ms;
  opacity: ${({ closing }) => closing ? '0' : '1'};

  @keyframes open {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
  
  @keyframes close {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
`;

const StyledDayViewGrid = styled.div`
  display: grid;
  gap: .2rem;
  grid-template-columns: repeat(7, 1fr);
  position: relative;
`;

const StyledDay = styled.div`
  height: 4rem;
  width: 6rem;
  background-color: #cecece;
  box-shadow: -.1rem .1rem .2rem #0004;
  padding: .3rem;
  gap: .2rem;
  border-radius: .2rem;
  display: flex;
  flex-direction: column;
`;

const StyledDayTitle = styled.h3`
  margin: 0;
  flex: .7;
  font-size: .9rem;
`;

const StyledDutiesContainer = styled.div`
  display: flex;
  gap: .2rem;
  flex: 1;
`;

const StyledDuty = styled.div`
  background-color: #bebebe;
  flex: 1;
  display: flex;
  flex-direction: column-reverse;
  box-shadow: -.1rem .1rem .2rem #0004 inset;
  justify-content: end;
  gap: .2rem;
  padding: .2rem;
  border-radius: .2rem;
`;

const StyledDutyHeader = styled.section`
  justify-content: space-between;
  align-items: center;
  display: flex;
  flex: .7;

  &>svg {
    cursor: pointer;
  }
`;

const StyledDutyTitle = styled.h4`
  margin: 0;
  text-align: center;
  font-size: .6rem;
`;

const dutySlotStyles = css`
  height: 3px;
  width: 100%;
  border-radius: .1rem;
`;

interface StyledDutySlotProps {
  graduation: Graduation;
  gender: Gender;
}

const graduationColorMap: Record<Graduation, string> = {
  [Graduation.INSP]: '#71eb8a',
  [Graduation.GCM]: '#313131',
  [Graduation.SI]: '#f0d35e',
};

const genderColorMap: Record<Gender, string> = {
  [Gender.UNDEFINED]: '#727272',
  [Gender.FEMALE]: '#de63e2',
  [Gender.MALE]: '#5b4af5',
}

const StyledDutySlot = styled.span<StyledDutySlotProps>`
  ${dutySlotStyles}
  display: flex;
  background-color: ${({ graduation }) => graduationColorMap[graduation]};

  &::before {
    content: '';
    background-color: ${({ gender }) => genderColorMap[gender]};
    width: 6px;
    height: 100%;
    border-width: 1px;
    border-right-style: solid;
    border-color: #0004;
  }
`;

const StyledEmpityDutySlot = styled.span`
  ${dutySlotStyles}
  background-color: #a0a0a0;
`;