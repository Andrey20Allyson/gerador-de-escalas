import { DaysOfWork, WorkerInfo } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";
import React, { useState } from "react";
import { GeneratorStatus, SaveWorkersDaysOfWorkStatus } from "../../../app/api/status";
import { LoadSpinner } from "../../components/LoadSpinner";
import { WorkDayGrid } from "../../components/WorkDayGrid";
import { useStage } from "../../contexts/stages";
import { toggleWorkDay } from "../../extra-duty-lib";
import { useLoadedData, useRerender } from "../../hooks";
import { saveFile, sleep } from "../../utils";
import { ColoredText, Footer, HeaderLabel, HelpIcon, StageBody, StageHeader } from "./WorkerEditionStage.styles";

function toNumber(value: string) {
  const number = +value;
  return isNaN(number) ? undefined : number;
}

export function WorkerEditionStage() {
  const { prev } = useStage();
  const [currentWorkerIndex, setCurrentWorkerIndex] = useState(0);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);

    await sleep();

    const saveStatus = await saveData();
    if (saveStatus !== SaveWorkersDaysOfWorkStatus.OK) {
      setLoading(false);
      return alert(`Erro ao salvar alterações, '${SaveWorkersDaysOfWorkStatus[saveStatus]}'`);
    }

    // @ts-ignore
    const generationStatus = await window.api.generateWithLoaded();
    if (generationStatus !== GeneratorStatus.OK) {
      setLoading(false);
      return alert(`Erro ao gerar escala, '${GeneratorStatus[generationStatus]}'`);
    }

    // @ts-ignore
    const buffer = await window.api.getGeneratedArrayBuffer();
    if (!buffer) {
      return setLoading(false);
    }

    setLoading(false);

    saveFile('Escala.xlsx', buffer);
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
        <input type="button" value='Gerar' onClick={handleFinish} />
      </Footer>
      <LoadSpinner color="#00992e" visible={loading} spinnerWidth={3} size={15} />
    </StageBody>
  );
}

export function createWorkerOption(worker: WorkerInfo, index: number) {
  return <option key={index} value={index}>{worker.config.name}</option>;
}