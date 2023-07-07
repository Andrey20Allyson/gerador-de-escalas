import React, { useState } from "react";
import { ColoredText, Footer, HeaderLabel, HelpIcon, StageBody, StageHeader } from "./WorkerEditionStage.styles";
import { DaysOfWork, WorkerInfo } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";
import { SaveWorkersDaysOfWorkStatus } from "../../../app/api/status";
import { WorkDayGrid } from "../../components/WorkDayGrid";
import { useStage } from "../../contexts/stages";
import { toggleWorkDay } from "../../extra-duty-lib";
import { useLoadedData, useRerender } from "../../hooks";

function toNumber(value: string) {
  const number = +value;
  return isNaN(number) ? undefined : number;
}

export function WorkerEditionStage() {
  const { next, prev } = useStage();
  const [currentWorkerIndex, setCurrentWorkerIndex] = useState(0);
  const { data, saveData } = useLoadedData();
  const rerender = useRerender();

  const worker = data?.workers.at(currentWorkerIndex);
  const daysOfWork = worker?.daysOfWork;

  function handleChangeWorker(ev: React.ChangeEvent<HTMLSelectElement>) {
    const index = toNumber(ev.currentTarget.value);
    if (index === undefined) return alert(`Valor '${ev.currentTarget.value}' não pode ser convertido para número!`);

    setCurrentWorkerIndex(index);
  }

  function handleChangeWorkDay(daysOfWork: DaysOfWork, day: number) {
    toggleWorkDay(daysOfWork, day);

    rerender();
  }

  async function handleFinish() {
    const code = await saveData();
    if (code !== SaveWorkersDaysOfWorkStatus.OK) return alert(`Erro ao salvar alterações, código ${code}`);

    next();
  }

  return (
    <StageBody>
      <StageHeader>
        <HeaderLabel>Alterar dias de serviço</HeaderLabel>
        <HelpIcon>
          <div>
            <p><ColoredText color="#06be00">Verde</ColoredText> = Dias de extra</p>
          </div>
        </HelpIcon>
      </StageHeader>
      <select onChange={handleChangeWorker}>
        {data && data.workers.map(createWorkerOption)}
      </select>
      {data && daysOfWork && <WorkDayGrid year={data.year} month={data.month} daysOfWork={daysOfWork} onToggleDay={handleChangeWorkDay} />}
      <Footer>
        <input type="button" value='Voltar' onClick={prev} />
        <input type="button" value='Salvar' onClick={saveData} />
        <input type="button" value='Proximo' onClick={handleFinish} />
      </Footer>
    </StageBody>
  );
}

export function createWorkerOption(worker: WorkerInfo, index: number) {
  return <option key={index} value={index}>{worker.config.name}</option>;
}