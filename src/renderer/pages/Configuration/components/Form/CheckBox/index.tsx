import React from "react";
import styled from "styled-components";
import { PropsWithName, PropsWithTitle } from "../types";
import { useFormController } from "../context";

export interface CheckBoxProps extends PropsWithName, PropsWithTitle { }

export function CheckBox(props: CheckBoxProps) {
  const {
    title,
    name,
  } = props;

  const controller = useFormController();
  const field = controller.field(name);

  const { handleChange, handleRef } = field.checkboxHandler();

  return (
    <StyledCheckBox>
      <label>{title}</label>
      <input
        type="checkbox"
        ref={handleRef}
        onChange={handleChange} />
    </StyledCheckBox>
  );
}

export const StyledCheckBox = styled.div`
  
`;