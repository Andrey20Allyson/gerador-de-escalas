import React, { useEffect, useState } from "react";
import { StyledLinedBorder, StyledLoaderForm } from "./DataCollectStage.styles";
import { useStage } from "src/renderer/contexts/stages";
import { Month } from "src/lib/structs";
import { useAppSelector } from "src/renderer/hooks";
import { currentTablePath } from "src/renderer/state/slices/table-editor-loader";
import { AppError, api } from "src/renderer/api";
import { TableEditorController } from "src/renderer/state/controllers/editor/table";

export function LoadOrdinaryInfoStage() {
  const stage = useStage();
  const path = useAppSelector(currentTablePath)!;
  const editorLoader = TableEditorController.useEditorLoader();
  const [sheetNames, setSheetNames] = useState<readonly string[]>([]);

  async function getSheetNames(path: string) {
    const getSheetNamesResult = await api.utils.getSheetNames(path);

    if (getSheetNamesResult.ok === false) {
      AppError.log(getSheetNamesResult.error);
      return;
    }

    setSheetNames(getSheetNamesResult.data);
  }

  useEffect(() => {
    getSheetNames(path);
  }, [path]);

  function currentMonthForInput() {
    const month = Month.now();

    const monthString = (month.index + 1).toString().padStart(2, "0");

    return `${month.year}-${monthString}`;
  }

  function parseMonthFromInput(text: string): [number, number] {
    const [yearString, monthString] = text.split("-");

    return [parseInt(yearString!), parseInt(monthString!) - 1];
  }

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();

    const data = new FormData(ev.currentTarget);

    const monthString = data.get("month") as string;
    const sheetName = data.get("sheet") as string;

    const [year, month] = parseMonthFromInput(monthString);

    const loadResult = await api.editor.loadOrdinary({
      path,
      year,
      month,
      sheetName,
    });

    if (loadResult.ok === false) {
      AppError.log(loadResult.error);
      return;
    }

    editorLoader.load(loadResult.data);

    stage.next();
  }

  function gotoPrev(ev: React.MouseEvent<HTMLAnchorElement>) {
    ev.preventDefault();

    stage.prev();
  }

  return (
    <StyledLinedBorder>
      <StyledLoaderForm onSubmit={onSubmit}>
        <h2>Parece que esse é um arquivo novo</h2>
        <p>Deseja alterar alguma configuração?</p>
        <label>Mês da Extra</label>
        <input
          name="month"
          type="month"
          defaultValue={currentMonthForInput()}
        ></input>
        <label>Nome da Aba</label>
        <select name="sheet">
          {sheetNames.map((sheet, index) => {
            return (
              <option key={index} value={sheet}>
                {sheet}
              </option>
            );
          })}
        </select>
        <input type="submit" value="Continuar" />
        <a onClick={gotoPrev}>Voltar</a>
      </StyledLoaderForm>
    </StyledLinedBorder>
  );
}
