import React, { PropsWithChildren } from "react";
import { InfoCardDiv } from "./styles";

export interface InfoCardProps extends PropsWithChildren {}

export function InfoCard({ children }: InfoCardProps) {
  return <InfoCardDiv>{children}</InfoCardDiv>;
}
