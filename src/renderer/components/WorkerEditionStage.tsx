import { DaysOfWork } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-table/parsers/days-of-work";
import { WorkTime } from '@andrey-allyson/escalas-automaticas/dist/extra-duty-table/parsers/work-time';
import { WorkerInfo } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-table/worker-info";
import { iterRange } from "@andrey-allyson/escalas-automaticas/dist/utils/iteration";
import { getNumOfDaysInMonth, numOfDaysInThisMonth } from '@andrey-allyson/escalas-automaticas/dist/utils/month';
import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components";

function getFirstSundayOfMonth(year: number, month: number): Date {
  const firstDayOfMonth = new Date(year, month, 1);
  const dayOfWeek = firstDayOfMonth.getDay();
  const daysUntilSunday = (7 - dayOfWeek) % 7;
  const firstSundayOfMonth = new Date(year, month, 1 + daysUntilSunday);
  return firstSundayOfMonth;
}

export interface WorkerEditionStageProps {
  onSuccess?: () => void;
}

function useRerender() {
  const [rerenderState, setRerenderState] = useState(false);

  function rerender() {
    setRerenderState(!rerenderState);
  }

  return rerender;
}

export function WorkerEditionStage(props: WorkerEditionStageProps) {
  const [workers, setWorkers] = useState<readonly WorkerInfo[]>();
  const [currentWorkerIndex, setCurrentWorkerIndex] = useState(0);
  const rerender = useRerender();  

  useEffect(() => {
    async function loadWorkers() {
      const workers = await window.api.getWorkerInfo();

      if (!workers) return;

      for (const worker of workers) {
        Object.setPrototypeOf(worker, WorkerInfo.prototype);
        Object.setPrototypeOf(worker.daysOfWork, DaysOfWork.prototype);
        Object.setPrototypeOf(worker.workTime, WorkTime.prototype);
      };

      setWorkers(workers);
    }

    loadWorkers();
  }, []);

  function handleChangeWorker(ev: React.ChangeEvent<HTMLSelectElement>) {
    const index = +ev.currentTarget.value;

    if (isNaN(index)) return;

    setCurrentWorkerIndex(index);
  }

  function handleChangeWorkDay(daysOfWork: DaysOfWork, day: number) {
    if (daysOfWork.workOn(day)) {
      daysOfWork.notWork(day);
    } else {
      daysOfWork.work(day);
    }

    rerender();
  }

  const daysOfWork = workers?.at(currentWorkerIndex)?.daysOfWork;

  let pastMonthDayCells: React.JSX.Element[] | undefined;
  let workDayCells: React.JSX.Element[] | undefined;
  
  if (daysOfWork) {
    const month = 5;

    const firstSunday = getFirstSundayOfMonth(2023, month).getDate();

    pastMonthDayCells = Array.from(
      iterRange(0, firstSunday),
      (day) => <DayCell>{(day + getNumOfDaysInMonth(month < 1 ? 11 : month - 1)) - firstSunday + 1}</DayCell>
    );

    workDayCells = Array.from(
      iterRange(0, daysOfWork.length),
      (day) => <WorkDayCell key={day} onClick={handleChangeWorkDay.bind(undefined, daysOfWork, day)} isWorkDay={daysOfWork.workOn(day)}>{day + 1}</WorkDayCell>
    );
  }

  return (
    <StageBody>
      <StageHeader>
        <label>Alterar dias de serviço</label>
        <HelpIcon>
          <div>
            <p>
              <ColoredText color="#06be00">Verde</ColoredText>: livre para extra;
            </p>
          </div>
        </HelpIcon>
      </StageHeader>
      <select onChange={handleChangeWorker}>
        {workers && workers.map((worker, i) => <option key={i} value={i}>{worker.config.name}</option>)}
      </select>
      <DayGrid>
        {pastMonthDayCells}
        {workDayCells}
      </DayGrid>
      <Footer>
        <input type="button" value='Salvar' />
        <input type="button" value='Finalizar' />
      </Footer>
    </StageBody>
  );
}

const StageHeader = styled.header`
  display: flex;
  gap: 1rem;
`;

interface ColoredTextProps {
  color: string;
}

const ColoredText = styled.label<ColoredTextProps>`
  color: ${(props) => props.color};
  font-weight: bold;
`;

const HelpIcon = styled.label`
  border-radius: 50%;
  border-width: 1px;
  border-color: #0004;
  border-style: solid;
  width: 1rem;
  height: 1rem;
  justify-content: center;
  align-items: center;
  display: flex;
  position: relative;
  cursor: pointer;

  &::before {
    content: '?';
  }

  &>* {
    position: absolute;
    background-color: #ebebeb;
    padding: .5rem;
    visibility: hidden;
    border-style: solid;
    width: max-content;
    border-width: 1px;
    border-color: #0004;
    box-shadow: -.2rem .2rem .4rem #0004;
    z-index: 2;
  }

  &:hover>* {
    visibility: visible;
    top: 70%;
    right: 70%;
  }
`;

const StageBody = styled.div`
  display: flex;
  gap: 1rem;
  flex-direction: column;
  align-items: center;
`;

const Footer = styled.footer`
  display: flex;
  gap: 1rem;
`;

const Button = styled.div`
  background-image: linear-gradient(40deg, #023807, #047204);
  color: #fff;
  padding: .2rem;
  border-radius: .3rem;
  
`;

const DayGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: .4rem;
  background-color: #cecece;
  padding: .4rem;

`;

interface DayCellProps {
  isWorkDay?: boolean;
}

function normalBackgroundColorFunction(props: DayCellProps) {
  return props.isWorkDay ? '#aaaaaa' : '#06bb00';
}

function hovererBackgroundColorFunction(props: DayCellProps) {
  return props.isWorkDay ? '#8a8a8a' : '#015200';
}

const shadowStyles = css`
  box-shadow: -.2rem .2rem .4rem #0003;
`;

const dayCellStyles = css`
  ${shadowStyles}
  width: 1.5rem;
  height: 1.5rem;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  border-color: #0002;
  border-width: 1px;
  border-style: solid;
`;

const DayCell = styled.div`
  ${dayCellStyles}
  background-color: #3d3d3d;
  opacity: .2;
`;

const WorkDayCell = styled.div<DayCellProps>`
  ${dayCellStyles}
  background-color: ${normalBackgroundColorFunction};
  cursor: pointer;

  &:hover {
    background-color: ${hovererBackgroundColorFunction};
  }
`;