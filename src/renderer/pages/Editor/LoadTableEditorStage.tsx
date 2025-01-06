import React from "react";
import { Squares } from "react-activity";
import { LoadTableStage } from "../../components/LoadTableStage";
import { StyledLinedBorder } from "../../pages/Generator/DataCollectStage.styles";
import { useLoadEditorStage } from "./LoadTableEditorStage.hooks";

export function LoadTableEditorStage() {
  const self = useLoadEditorStage();

  return (
    <StyledLinedBorder>
      <LoadTableStage
        title="Escolha Uma Planilha"
        onSubmit={self.handleSubmit}
      />
      <Squares color={`#15ff00${self.loading ? "ff" : "00"}`} />
    </StyledLinedBorder>
  );
}
