import React, { useState } from "react";
import Skeleton from "react-loading-skeleton";
import { AppError, editor } from "../../api";
import { DutyTableGrid } from "../../components/DutyTableGrid";
import { LoadSpinner } from "../../components/LoadSpinner";
import { useStage } from "../../contexts/stages";
import { saveFile, sleep } from "../../utils";
import { Footer, StageBody } from "../Generator/WorkerEditionStage.styles";
import { useLoading, useTableEditor } from "../../hooks";

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

  async function handlePrev() {
    await editor.clear();

    prev();
  }

  return (
    <StageBody>
      {tableResponse.status === 'loading'
        ? <Skeleton width={768} height={387}></Skeleton>
        : tableResponse.status === 'success'
          ? <DutyTableGrid table={tableResponse.editor} />
          : <p>{tableResponse.error.message}</p>}
      <Footer>
        <input type='button' onClick={handlePrev} value='Voltar' />
        <input type='button' onClick={handleSave} value='Salvar' />
      </Footer>
      <LoadSpinner color="#00992e" visible={loading} spinnerWidth={3} size={15} />
    </StageBody>
  );
}