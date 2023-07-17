import React, { useState } from "react";
import { AppError, editor } from "../../api";
import { DutyTableGrid } from "../../components/DutyTableGrid";
import { useStage } from "../../contexts/stages";
import useTableViewer from "../../hooks/useTableViewer";
import { saveFile, sleep } from "../../utils";
import { Footer, StageBody } from "../Generator/WorkerEditionStage.styles";
import { LoadSpinner } from "../../components/LoadSpinner";

function useLoading() {
  const [loading, setLoading] = useState(false);

  async function listen<T>(promise: Promise<T>): Promise<T> {
    setLoading(true);

    await sleep(0);
    
    let result: Promise<T>;

    try {
      result = Promise.resolve(await promise);
    } catch (e) {
      result = Promise.reject(e);
    } finally {
      setLoading(false);
    }

    return result;
  }

  return { loading, listen };
}

export function EditTableStage() {
  const { prev } = useStage();
  const table = useTableViewer();
  const { loading, listen } = useLoading();

  async function createFile() {
    if (!table) return;
  
    const saveResponse = await editor.save(table.data);
    if (!saveResponse.ok) return AppError.log(saveResponse.error);
  
    const serializeResponse = await editor.serialize();
    if (!serializeResponse.ok) return AppError.log(serializeResponse.error);
  
    const buffer = serializeResponse.data;
  
    saveFile('Escala.xlsx', buffer);
  }

  async function handleSave() {
    const createFilePromise = createFile();
    
    listen(createFilePromise);
  }

  return (
    <StageBody>
      {table && <DutyTableGrid table={table} />}
      <Footer>
        <input type='button' onClick={prev} value='Voltar' />
        <input type='button' onClick={handleSave} value='Salvar' />
      </Footer>
      <LoadSpinner color="#00992e" visible={loading} spinnerWidth={3} size={15} />
    </StageBody>
  );
}