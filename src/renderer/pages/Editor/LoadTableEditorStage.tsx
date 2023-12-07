import { AppError, api } from "../../api";
import { LoadTableFormData, LoadTableStage } from "../../components/LoadTableStage";
import { useStage } from "../../contexts/stages";
import { useLoading, useTableData } from "../../hooks";
import { StyledLinedBorder } from "../../pages/Generator/DataCollectStage.styles";
import { TableEditorController } from "../../state/controllers/editor/table-editor";
import { sleep } from "../../utils";
import React from "react";
import { Squares } from 'react-activity';

export function LoadTableEditorStage() {
  const { next } = useStage();
  const { listen, loading } = useLoading();
  const tableResponse = useTableData();
  const tableLoader = TableEditorController.useEditorLoader();

  if (tableResponse.status === 'success') {
    tableLoader.load(tableResponse.data);
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