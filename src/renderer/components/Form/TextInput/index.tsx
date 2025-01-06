import React from "react";
import styled from "styled-components";
import { useFormController } from "../context";
import { PropsWithName, PropsWithTitle } from "../types";

export interface TextInputProps extends PropsWithName, PropsWithTitle {}

export function TextInput(props: TextInputProps) {
  const { title, name } = props;

  const controller = useFormController();
  const field = controller.field(name);
  const error = field.error();

  const { handleChange, handleRef } = field.inputHandler();

  return (
    <StyledTextInput>
      {title}
      <input
        className="text-input"
        ref={handleRef}
        onChange={handleChange}
        type="text"
      />
      <small className="warning">{error}</small>
    </StyledTextInput>
  );
}

export const StyledTextInput = styled.label`
  display: flex;
  flex-direction: column;
  text-indent: 0.3rem;

  & > .text-input {
    background-color: #fafafa;
    border: 1px solid #0001;
    border-radius: 0.4rem;
  }

  & > .warning {
    color: #bd0000;
    text-overflow: ellipsis;
    overflow-x: hidden;
    white-space: nowrap;
  }
`;
