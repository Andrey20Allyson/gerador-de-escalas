import { DaysOfWork } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-table/parsers/days-of-work";
import { WorkTime } from '@andrey-allyson/escalas-automaticas/dist/extra-duty-table/parsers/work-time';
import { WorkerInfo } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-table/worker-info";
import { iterRange } from "@andrey-allyson/escalas-automaticas/dist/utils/iteration";
import { getNumOfDaysInMonth } from '@andrey-allyson/escalas-automaticas/dist/utils/month';
import React, { useEffect, useState } from "react";
import { LoadedData } from "../../app/api/channels";
import { ColoredText, DayCell, DayGrid, Footer, HelpIcon, StageBody, StageHeader, WorkDayCell } from "./WorkerEditionStage.styles";

function getFirstSundayOfMonth(year: number, month: number): Date {
  const firstDayOfMonth = new Date(year, month, 1);
  const dayOfWeek = firstDayOfMonth.getDay();
  const daysUntilSunday = (7 - dayOfWeek) % 7;
  const firstSundayOfMonth = new Date(year, month, 1 + daysUntilSunday);
  return firstSundayOfMonth;
}

export interface WorkerEditionStageProps {
  onSuccess?: () => void;
  onGoBack?: () => void;
}

function useRerender() {
  const [rerenderState, setRerenderState] = useState(false);

  function rerender() {
    setRerenderState(!rerenderState);
  }

  return rerender;
}

export function WorkerEditionStage(props: WorkerEditionStageProps) {
  const [data, setData] = useState<LoadedData>();
  const [currentWorkerIndex, setCurrentWorkerIndex] = useState(0);
  const rerender = useRerender();

  useEffect(() => {
    async function loadWorkers() {
      const data = await window.api.getLoadedData();

      if (!data) return;
      const { workers } = data;

      for (const worker of workers) {
        Object.setPrototypeOf(worker, WorkerInfo.prototype);
        Object.setPrototypeOf(worker.daysOfWork, DaysOfWork.prototype);
        Object.setPrototypeOf(worker.workTime, WorkTime.prototype);
      };

      setData(data);
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

  let pastMonthDayCells: React.JSX.Element[] | undefined;
  let workDayCells: React.JSX.Element[] | undefined;
  
  const daysOfWork = data?.workers.at(currentWorkerIndex)?.daysOfWork;

  if (data && daysOfWork) {
    const month = data.month;

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
        {data && data.workers.map((worker, i) => <option key={i} value={i}>{worker.config.name}</option>)}
      </select>
      <DayGrid>
        {pastMonthDayCells}
        {workDayCells}
      </DayGrid>
      <Footer>
        <input type="button" value='Voltar' onClick={props.onGoBack} />
        <input type="button" value='Salvar' />
        <input type="button" value='Finalizar' />
      </Footer>
    </StageBody>
  );
}