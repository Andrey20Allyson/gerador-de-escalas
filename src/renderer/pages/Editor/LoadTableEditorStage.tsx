import React, { FormEvent } from "react";
import { StyledLinedBorder, StyledLoaderForm } from "./DataCollectStage.styles";
import { AppError, DeserializationErrorCode, api } from "src/renderer/api";
import { useStage } from "src/renderer/contexts/stages";
import { useAppDispatch } from "src/renderer/hooks";
import { editorLoaderActions } from "src/renderer/state/slices/table-editor-loader";
import { TableEditorController } from "src/renderer/state/controllers/editor/table";

export function LoadTableEditorStage() {
  const stage = useStage();
  const dispatch = useAppDispatch();
  const editorLoader = TableEditorController.useEditorLoader();

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();

    const data = new FormData(ev.currentTarget);

    const file = data.get("input-path") as File;

    if (file.path === "") {
      return AppError.log(AppError.create("File is required"));
    }

    const loadResult = await api.editor.load(file.path);

    dispatch(editorLoaderActions.setPath(file.path));

    if (loadResult.ok === false) {
      if (
        loadResult.error.code === DeserializationErrorCode.INEXISTENT_METADATA
      ) {
        stage.next();
        return;
      }

      AppError.log(loadResult.error);
      return;
    }

    editorLoader.load(loadResult.data);

    stage.navigate(2);
  }

  return (
    <StyledLinedBorder>
      <StyledLoaderForm onSubmit={onSubmit}>
        <label>Abrir Arquivo</label>
        <input type="file" name="input-path" />
        <input type="submit" value="Carregar"></input>
      </StyledLoaderForm>
    </StyledLinedBorder>
  );
}
