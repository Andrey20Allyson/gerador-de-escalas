import React from "react";
import { GenerateStageBody } from "./GenerateStage.styles";
import { Footer, HeaderLabel } from "./WorkerEditionStage.styles";
import { GeneratorStatus } from "../../../app/api/status";
import { useStage } from "../../contexts/stages";
import { saveFile } from "../../utils";

export function GenerateStage() {
  const { prev } = useStage();

  async function handleProgramFinish() {
    const code = await window.api.generateWithLoaded();
    if (code !== GeneratorStatus.OK) return alert(`Erro ao gerar escala, código ${code}`);

    const buffer = await window.api.getGeneratedArrayBuffer();
    if (!buffer) return;

    saveFile('Escala.xlsx', buffer);
  }

  return (
    <GenerateStageBody>
      <HeaderLabel>Gerar escala</HeaderLabel>
      <Footer>
        <input type="button" value='Voltar' onClick={prev} />
        <input type="button" value='Gerar' onClick={handleProgramFinish} />
      </Footer>
    </GenerateStageBody>
  )
}