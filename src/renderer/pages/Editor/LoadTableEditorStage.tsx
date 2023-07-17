import React from "react";
import { LoadTableFormData, LoadTableStage } from "../../components/LoadTableStage";
import { api } from "../../api";
import { AppError } from "../../../app/api/app.base";

export function LoadTableEditorStage() {
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

  return <LoadTableStage title="Escolha uma escala para visualizar" onSubmit={handleSubmit} />;
}
