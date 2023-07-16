import React from "react";
import { StageLoadBar, StageProvider, StageRouter } from "../../contexts/stages";
import { LoadTableFormData, LoadTableStage } from "../../components/LoadTableStage";
import { EditTableStage } from "./EditTableStage";
import { AppError, api } from "../../api";

function EditorLoadTableStage() {
  async function handleSubmit(data: LoadTableFormData) {
    
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

  return <LoadTableStage title="Escolha uma escala para editar" onSubmit={handleSubmit} />
}

export default function Editor() {
  return (
    <StageProvider>
      <StageRouter stages={[
        EditorLoadTableStage,
        EditTableStage,
      ]} />
      <StageLoadBar />
    </StageProvider>
  )
}