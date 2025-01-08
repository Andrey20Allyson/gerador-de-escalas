import React, { PropsWithChildren } from "react";
import styled from "styled-components";
import { FormController, useFormController } from "../context";

export interface ButtonProps extends PropsWithChildren {
  onClick?: (controller: FormController) => void;
}

export function Button(props: ButtonProps) {
  const controller = useFormController();

  return (
    <StyledButton onClick={() => props.onClick?.(controller)}>
      {props.children}
    </StyledButton>
  );
}

export const StyledButton = styled.button`
  border: 1px solid #0003;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.3rem 0.7rem;
  transition: all 300ms;
  display: flex;
  gap: 0.3rem;
  align-items: center;

  &:hover {
    background-color: #fafafa;
    box-shadow: 0 0.2rem 0.3rem #0003;
  }

  &:active {
    box-shadow: none;
  }
`;
