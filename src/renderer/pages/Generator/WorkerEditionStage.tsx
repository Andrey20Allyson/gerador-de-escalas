import React, { useMemo, useState } from "react";
import { WorkerEditor } from "../../../app/api/table-generation/pre-generate-editor";
import { AppError, api } from "../../api";
import { LoadSpinner } from "../../components/LoadSpinner";
import { WorkDayGrid } from "../../components/WorkDayGrid";
import { useStage } from "../../contexts/stages";
import { usePreGenerateEditor, useRerender } from "../../hooks";
import { saveFile, sleep } from "../../utils";
import { ColoredText, Footer, HeaderLabel, HelpIcon, StageBody, StageHeader } from "./WorkerEditionStage.styles";

function toNumber(value: string) {
  const number = +value;
  return isNaN(number) ? undefined : number;
}

export function WorkerEditionStage() {
  const { prev } = useStage();
  const [currentWorkerID, setCurrentWorkerID] = useState(0);
  const [loading, setLoading] = useState(false);
  const editor = usePreGenerateEditor();
  const rerender = useRerender();
  const workers = useMemo(() => {
    return editor ? Array.from(editor.workers()) : [];
  }, [editor]);

  const worker = workers.at(currentWorkerID);

  function handleChangeWorker(ev: React.ChangeEvent<HTMLSelectElement>) {
    const index = toNumber(ev.currentTarget.value);
    if (index === undefined) return alert(`Valor '${ev.currentTarget.value}' não pode ser convertido para número!`);

    setCurrentWorkerID(index);
  }

  async function generate() {
    if (!editor) return;
  
    const saveResponse = await api.generator.preGenerateEditor.save(editor.data);
    if (!saveResponse.ok) return AppError.log(saveResponse.error);
  
    const generateResponse = await api.generator.generate();
    if (!generateResponse.ok) AppError.log(generateResponse.error);
    
    const serializeResponse = await api.generator.serialize();
    if (!serializeResponse.ok) return AppError.log(serializeResponse.error);
  
    saveFile('Escala.xlsx', serializeResponse.data);
  }

  async function handleFinish() {
    setLoading(true);
    
    await sleep(0);

    await generate();

    setLoading(false);
  }

  return (
    <StageBody>
      <StageHeader>
        <HeaderLabel>Alterar dias de serviço</HeaderLabel>
        <HelpIcon>
          <div>
            <p><ColoredText color="#06be00">Verde</ColoredText>: Dias disponíveis para trabalhar na extra.</p>
          </div>
        </HelpIcon>
      </StageHeader>
      <select onChange={handleChangeWorker}>
        {workers && workers.map(createWorkerOption)}
      </select>
      {worker && <WorkDayGrid worker={worker} />}
      <Footer>
        <input type="button" value='Voltar' onClick={prev} />
        <input type="button" value='Gerar' onClick={handleFinish} />
      </Footer>
      <LoadSpinner color="#00992e" visible={loading} spinnerWidth={3} size={15} />
    </StageBody>
  );
}

export function createWorkerOption(worker: WorkerEditor, index: number) {
  return <option key={index} value={index}>{worker.name()}</option>;
}