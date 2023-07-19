import React from "react";
import { LoadTableFormData, LoadTableStage } from "../../components/LoadTableStage";
import { api } from "../../api";
import { AppError } from "../../../app/api/app.base";
import useTableEditor from "../../hooks/useTableEditor";
import { useStage } from "../../contexts/stages";
import { StyledLinedBorder } from "../Generator/DataCollectStage.styles";
import { LoadSpinner } from "../../components/LoadSpinner";
import { useLoading } from "../../hooks";
import { sleep } from "../../utils";

export function LoadTableEditorStage() {
  const { next } = useStage();
  const { listen, loading } = useLoading();
  const tableResponse = useTableEditor();

  if (tableResponse.status === 'success') {
    next();
  }

  async function loadPreGenerateEditor(data: LoadTableFormData) {
    await sleep();

    const result = await api.editor.load({
      ordinaryTable: {
        filePath: data.ordinaryTable.filePath,
        sheetName: data.ordinaryTable.sheetName,
      },
      extraDutyTable: {
        filePath: data.tableToEdit.filePath,
        sheetName: data.tableToEdit.sheetName,
      },
    });
  
    if (!result.ok) {
      AppError.log(result.error);
      return false;
    }
  
    return true;
  }

  async function handleSubmit(data: LoadTableFormData) {
    const loadPreGenerateEditorPromise = loadPreGenerateEditor(data);
    
    return listen(loadPreGenerateEditorPromise);
  }

  return (
    <StyledLinedBorder>
      <LoadTableStage title="Escolha Escala à Editar" onSubmit={handleSubmit} />
      <LoadSpinner color="#00e7e7" visible={loading} spinnerWidth={5} size={20} />
    </StyledLinedBorder>
  );
}