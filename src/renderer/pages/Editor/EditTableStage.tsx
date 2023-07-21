import React, { useRef } from "react";
import { TableEditor } from "../../../app/api/table-edition";
import { AppError, editor } from "../../api";
import { EditorTypeSelect } from "../../components/EditorTypeSelect";
import { LoadSpinner } from "../../components/LoadSpinner";
import { useStage } from "../../contexts/stages";
import { useLoading } from "../../hooks";
import { saveFile } from "../../utils";
import { Footer, StageBody } from "../Generator/WorkerEditionStage.styles";
import { DayEditionModalProvider } from "../../components/DayEditionModal";

export function EditTableStage() {
  const { loading, listen } = useLoading();
  const { prev } = useStage();
  const tableRef = useRef<TableEditor>(null);

  async function createFile() {
    const table = tableRef.current;
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

  async function handlePrev() {
    await editor.clear();

    prev();
  }

  return (
    <DayEditionModalProvider>
      <StageBody>
        <EditorTypeSelect tableRef={tableRef} />
        <Footer>
          <input type='button' onClick={handlePrev} value='Voltar' />
          <input type='button' onClick={handleSave} value='Salvar' />
        </Footer>
        <LoadSpinner color="#00992e" visible={loading} spinnerWidth={3} size={15} />
      </StageBody>
    </DayEditionModalProvider>
  );
}