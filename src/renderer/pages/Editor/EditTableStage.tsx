import React, { useState } from "react";
import { AppError, editor } from "../../api";
import { DutyTableGrid } from "../../components/DutyTableGrid";
import { useStage } from "../../contexts/stages";
import useTableEditor from "../../hooks/useTableEditor";
import { saveFile, sleep } from "../../utils";
import { Footer, StageBody } from "../Generator/WorkerEditionStage.styles";
import { LoadSpinner } from "../../components/LoadSpinner";
import { TableEditor } from "../../../app/api/table-edition";
import Skeleton from "react-loading-skeleton";

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
  const { loading, listen } = useLoading();
  const tableResponse = useTableEditor();
  const { prev } = useStage();

  async function createFile() {
    if (tableResponse.status !== 'success') return;
    const table = tableResponse.editor;

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
      {tableResponse.status === 'loading'
        ? <Skeleton width={768} height={387}></Skeleton>
        : tableResponse.status === 'success'
          ? <DutyTableGrid table={tableResponse.editor} />
          : <p>{tableResponse.error.message}</p>}
      <Footer>
        <input type='button' onClick={prev} value='Voltar' />
        <input type='button' onClick={handleSave} value='Salvar' />
      </Footer>
      <LoadSpinner color="#00992e" visible={loading} spinnerWidth={3} size={15} />
    </StageBody>
  );
}