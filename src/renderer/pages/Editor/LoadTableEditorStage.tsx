import React from "react";
import { LoadTableFormData, LoadTableStage } from "../../components/LoadTableStage";
import { api } from "../../api";
import { AppError } from "../../../app/api/app.base";
import useTableEditor from "../../hooks/useTableEditor";
import { useStage } from "../../contexts/stages";
import { StyledLinedBorder } from "../Generator/DataCollectStage.styles";
import { useLoading } from "../../hooks";
import { sleep } from "../../utils";
import { Spinner, Squares } from 'react-activity';

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