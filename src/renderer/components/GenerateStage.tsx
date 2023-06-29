import React from "react";
import { GeneratorStatus } from "../../app/api/status";
import { saveFile } from "../utils/save-file";
import { GenerateStageBody } from "./GenerateStage.styles";
import { Footer, HeaderLabel } from "./WorkerEditionStage.styles";

export interface GenerateStageProps {
  onGoBack?: () => void;
}

export function GenerateStage(props: GenerateStageProps) {
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
        <input type="button" value='Voltar' onClick={props.onGoBack} />
        <input type="button" value='Gerar' onClick={handleProgramFinish} />
      </Footer>
    </GenerateStageBody>
  )
}