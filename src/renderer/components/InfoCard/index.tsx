import React, { PropsWithChildren } from "react";
import { InfoCardDiv } from "./styles";
import { InfoCardState } from "src/renderer/hooks/useInfoCard";

export interface InfoCardProps extends PropsWithChildren {
  state: InfoCardState;
}

export function InfoCard({ state, children }: InfoCardProps) {
  const { exibitionRequested, isVisible } = state;

  return isVisible() ? (
    <InfoCardDiv className={!exibitionRequested ? "hiding" : ""}>
      {children}
    </InfoCardDiv>
  ) : null;
}
