import React, { PropsWithChildren } from "react";
import styled from "styled-components";
import { useFormController } from "../context";
import { PropsWithName, PropsWithTitle } from "../types";

export interface SelectProps
  extends PropsWithChildren,
    PropsWithName,
    PropsWithTitle {}

export function Select(props: SelectProps) {
  const { children, name, title } = props;

  const constroller = useFormController();
  const field = constroller.field(name);

  const { handleChange, handleRef } = field.inputHandler();

  return (
    <StyledSelect>
      <label>{title}</label>
      <select onChange={handleChange} ref={handleRef}>
        {children}
      </select>
    </StyledSelect>
  );
}

export const StyledSelect = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.2rem;
  justify-content: start;

  & > select {
    height: min-content;
  }
`;
