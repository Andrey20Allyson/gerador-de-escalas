import React from "react";
import { LoadTableFormData, LoadTableStage } from "../../components/LoadTableStage";
import { isAppError, showAppError } from "../../utils/errors";


export function LoadTableViewerStage() {
  async function handleSubmit(data: LoadTableFormData) {
    const result = await window.api.loadViewer({
      ordinaryTable: {
        filePath: data.ordinaryTable.filePath,
        sheetName: data.ordinaryTable.sheetName,
      },
      extraDutyTable: {
        filePath: data.tableToEdit.filePath,
        sheetName: data.tableToEdit.sheetName,
      },
    });

    if (isAppError(result)) {
      showAppError(result);
      return false;
    }

    return true;
  }

  return <LoadTableStage title="Escolha uma escala para visualizar" onSubmit={handleSubmit} />;
}
