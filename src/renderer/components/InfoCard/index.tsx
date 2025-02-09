import React, { PropsWithChildren } from "react";
import { InfoCardDiv } from "./styles";
import { InfoCardState } from "src/renderer/hooks/useInfoCard";

export interface InfoCardProps extends PropsWithChildren {
  state: InfoCardState;
}

export function InfoCard({ state, children }: InfoCardProps) {
  const { hiding, isVisible } = state;

  return isVisible() ? (
    <InfoCardDiv className={hiding ? "hiding" : ""}>{children}</InfoCardDiv>
  ) : null;
}
