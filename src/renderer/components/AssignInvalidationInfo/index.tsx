import React from "react";
import { AssignmentInvalidation } from "src/renderer/state/controllers/editor/rules/rule";
import { AssignInvalidationInfoBox } from "./styles";
import { BsExclamationTriangle } from "react-icons/bs";

export interface AssignInvalidationInfoProps {
  invalidation: AssignmentInvalidation;
}

export function AssignInvalidationInfo(props: AssignInvalidationInfoProps) {
  return (
    <AssignInvalidationInfoBox>
      <BsExclamationTriangle />
      {props.invalidation.message}
    </AssignInvalidationInfoBox>
  );
}
