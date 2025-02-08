import React from "react";
import { InfoCardDiv } from "./styles";

export interface InfoCardProps {
  description: string;
}

export function InfoCard({ description }: InfoCardProps) {
  return <InfoCardDiv>{description}</InfoCardDiv>;
}
