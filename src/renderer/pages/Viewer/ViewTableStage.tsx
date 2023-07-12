import React, { useEffect, useState } from "react";
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { BsFillArrowLeftCircleFill, BsFillArrowRightCircleFill } from 'react-icons/bs';
import { GrStatusUnknown } from 'react-icons/gr';
import { HiOutlineArrowsExpand } from 'react-icons/hi';
import { PiGenderFemaleBold, PiGenderMaleBold } from 'react-icons/pi';
import styled, { css } from "styled-components";
import { DayViewer, DutyViewer, TableViewer, WorkerViewer } from "../../../app/api/table-visualization";
import { Gender, Graduation } from "../../extra-duty-lib";
import { iterRange } from "../../utils";
import { ColoredText } from "../Generator/WorkerEditionStage.styles";
import { useStage } from "../../contexts/stages";

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
  const { prev } = useStage();
  const table = useTableViewer();

  return (
    <>
      {table && <DayViewGrid table={table} />}
      <input type='button' onClick={prev} value='Voltar'/>
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

export function createEmpityDutySlot() {
  return <StyledEmpityDutySlot />;
}

export function* iterWithProps<T, P extends {}>(iter: Iterable<T>, props: P): Iterable<IterProps<T, P>> {
  for (const entry of iter) {
    yield { ...props, entry };
  }
}

export type IterProps<T, P extends {}> = P & { entry: T };

export interface DayProps {
  onSelect: (day: DayViewer) => void;
}

export function createWorker(worker: WorkerViewer) {
  return <StyledDutySlot gender={worker.data.gender} graduation={worker.data.graduation} />
}

export function createDuty(duty: DutyViewer) {
  const dutySlots = Array.from(duty.iterWorkers(), createWorker);
  const empitySlots = Array.from(iterRange(0, 3 - dutySlots.length), createEmpityDutySlot);

  return (
    <StyledDuty key={duty.data.index}>
      {dutySlots}
      {empitySlots}
      <StyledDutyTitle>{dutyTitles.at(duty.data.index) ?? 'N/A'}</StyledDutyTitle>
    </StyledDuty>
  )
}

export function createDay(props: IterProps<DayViewer, DayProps>) {
  const day = props.entry;

  return (
    <StyledDay key={day.data.index}>
      <StyledDutyHeader>
        <StyledDayTitle>Dia {day.data.index + 1}</StyledDayTitle>
        <StyledExpandDayButton onClick={() => props.onSelect(day)}>
          <HiOutlineArrowsExpand color='#6d6d6d' />
        </StyledExpandDayButton>
      </StyledDutyHeader>
      <StyledDutiesContainer>
        {Array.from(day.iterDuties(), createDuty)}
      </StyledDutiesContainer>
    </StyledDay>
  )
}

const StyledExpandDayButton = styled.button`
  background-color: #ffffff22;
  cursor: pointer;
  outline: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 1.4rem;
  padding: 0;
  width: 1.8rem;
  border-radius: .2rem;
  transition: opacity 100ms;
  box-shadow:
    .1rem -.1rem .5rem #0002 inset,
    -.1rem .1rem .5rem #ffffff58 inset;

  &>svg {
    width: 100%;
    height: 100%;
  }

  &:hover {
    opacity: .7;
  }
`;

export function DayViewGrid(props: DayViewGridProps) {
  const { table } = props;
  const [selectedDay, setSelectedDay] = useState<DayViewer>();

  function handleNextDayView() {
    if (!selectedDay) return;

    const nextIndex = (selectedDay.data.index + 1) % table.numOfDays();

    const nextDay = table.getDay(nextIndex);

    setSelectedDay(nextDay);
  }

  function handlePrevDayView() {
    if (!selectedDay) return;

    const prevIndex = selectedDay.data.index - 1;
    const normalizedPrevIndex = (prevIndex < 0 ? table.numOfDays() + prevIndex : prevIndex) % table.numOfDays();

    const prevDay = table.getDay(normalizedPrevIndex);

    setSelectedDay(prevDay);
  }

  function handleCloseDayView() {
    setSelectedDay(undefined);
  }

  const daysProps: DayProps = {
    onSelect: day => setSelectedDay(day),
  };

  const days = Array.from(iterWithProps(table.iterDays(), daysProps), createDay);

  return (
    <StyledDayViewGrid>
      {days}
      {selectedDay && (
        <DayViewModal
          onNext={handleNextDayView}
          onPrev={handlePrevDayView}
          onClose={handleCloseDayView}
          day={selectedDay} />
      )}
    </StyledDayViewGrid>
  )
}

const genderComponentMap: Record<Gender, () => React.JSX.Element> = {
  [Gender.FEMALE]: () => <PiGenderFemaleBold color='#de63e2' />,
  [Gender.MALE]: () => <PiGenderMaleBold color='#5b4af5' />,
  [Gender.UNDEFINED]: () => <GrStatusUnknown />,
};

const graduationTextColorMap: Record<Graduation, string> = {
  [Graduation.INSP]: '#047400',
  [Graduation.GCM]: '#000000',
  [Graduation.SI]: '#a7aa00',
}

export interface DayViewModalProps {
  day: DayViewer;
  onClose?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export function DayViewModal(props: DayViewModalProps) {
  const { day, onClose, onNext, onPrev } = props;

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
        <div></div>
        <StyledDayViewNavigation>
          <BsFillArrowLeftCircleFill onClick={onPrev} />
          <StyledModalTitle>
            Dia {day.data.index + 1}
          </StyledModalTitle>
          <BsFillArrowRightCircleFill onClick={onNext} />
        </StyledDayViewNavigation>
        <AiOutlineCloseCircle onClick={handleClose} size={25} color="#cc0000" />
      </StyledModalHeader>
      <StyledModalBody>
        <StyledDutyViewBody>
          <StyledDutyViewNavigation>
            {Array.from(day.iterDuties(), duty => {
              const thisDutyIndex = duty.data.index;

              return <StyledDutyViewNavButton selected={dutyIndex === thisDutyIndex} onClick={() => setDutyIndex(thisDutyIndex)}>{dutyTitles.at(thisDutyIndex)}</StyledDutyViewNavButton>;
            })}
          </StyledDutyViewNavigation>
          <StyledModalTitle2>
            Turno das {dutyTitles.at(dutyIndex)}
          </StyledModalTitle2>
          <StyledDutyViewSlotSection>
            {duty.numOfWorkers() > 0 ? Array.from(duty.iterWorkers(), worker => {
              const Gender = genderComponentMap[worker.data.gender];
              const gradutationColor = graduationTextColorMap[worker.data.graduation];

              return (
                <StyledWorkerViewBody>
                  {worker.data.name}
                  <StyledWorkerInfoSection>
                    [<ColoredText color={gradutationColor}>{worker.data.graduation.toUpperCase()}</ColoredText>]
                    <Gender />
                  </StyledWorkerInfoSection>
                </StyledWorkerViewBody>
              );
            }) : <StyledEmpityDutyMessage>Esse turno não possui componentes.</StyledEmpityDutyMessage>}
          </StyledDutyViewSlotSection>
        </StyledDutyViewBody>
      </StyledModalBody>
    </StyledDayViewModal>
  );
}

const StyledEmpityDutyMessage = styled.h3`
  color: #00000067;
  text-align: center;
`;

interface StyledDutyViewNavButtonProps {
  selected?: boolean;
}

const StyledDutyViewNavButton = styled.button<StyledDutyViewNavButtonProps>`
  cursor: pointer;
  outline: none;
  border: none;
  border-top-right-radius: .4rem;
  background-color: ${({ selected }) => selected ? '#9e9e9e' : '#e0e0e0'};
  transition: background-color 200ms;

  &:hover {
    background-color: ${({ selected }) => selected ? '#9e9e9e' : '#b3b3b3'};
  }
`;

const StyledDutyViewNavigation = styled.nav`
  display: flex;
  gap: .2rem;
  border-bottom: 1px solid #0003;
`;

const StyledDutyViewSlotSection = styled.section`
  flex-direction: column;
  display: flex;
  gap: .3rem;
`;

const StyledWorkerInfoSection = styled.section`
  height: 100%;
  display: flex;
  gap: .3rem;
  align-items: center;
`;

const StyledWorkerViewBody = styled.span`
  box-shadow: -.2rem .2rem .2rem #0002;
  justify-content: space-between;
  background-color: #e2e2e2;
  border-radius: .3rem;
  align-items: center;
  padding: .3rem;
  display: flex;

  &, & * {
    user-select: none;
  }
`;

const StyledDutyViewBody = styled.section`
  padding: .5rem;
  gap: .4rem;
  display: flex;
  flex-direction: column;
`;

const StyledModalBody = styled.div`

`;

const StyledModalHeader = styled.div`
  display: flex;
  height: 30px;
  padding: 0 .4rem;
  justify-content: space-between;
  align-items: center;
  background-color: #dddddd;
  border-bottom: 1px solid #6d6d6d5a;

  &>svg {
    cursor: pointer;
  }
`;

const StyledModalTitle2 = styled.h2`
  width: 100%;
  font-size: .9rem;
`;

const StyledDayViewNavigation = styled.nav`
  width: 20%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  align-self: center;

  & * {
    user-select: none;
  }

  &>svg {
    cursor: pointer;
    transition: fill 200ms, transform 200ms;
  }

  &>svg:hover {
    fill: #0008;
  }

  &>svg:active {
    transform: scale(.9);
  }
`;

const StyledModalTitle = styled.h1`
  gap: .4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  font-size: 1rem;
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
  gap: .3rem;
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
  gap: 2px;
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
  height: 5px;
  width: 100%;
  overflow: hidden;
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
    width: 20%;
    height: 100%;
    border-width: 1px;
    border-right-style: solid;
    border-color: #ffffff97;
  }
`;

const StyledEmpityDutySlot = styled.span`
  ${dutySlotStyles}
  background-color: #a0a0a0;
`;