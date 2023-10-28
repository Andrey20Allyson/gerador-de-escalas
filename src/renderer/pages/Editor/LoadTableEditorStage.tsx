import { AppError, api } from "@gde/renderer/api";
import { LoadTableFormData, LoadTableStage } from "@gde/renderer/components/LoadTableStage";
import { useStage } from "@gde/renderer/contexts/stages";
import { useLoading } from "@gde/renderer/hooks";
import useTableEditor from "@gde/renderer/hooks/useTableEditor";
import { StyledLinedBorder } from "@gde/renderer/pages/Generator/DataCollectStage.styles";
import { sleep } from "@gde/renderer/utils";
import React from "react";
import { Squares } from 'react-activity';

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
      <Squares color={`#15ff00${loading ? 'ff' : '00'}`} />
    </StyledLinedBorder>
  );
}