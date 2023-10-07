import React, { PropsWithChildren } from "react";
import styled from "styled-components";

export interface ButtonProps extends PropsWithChildren {
  onClick?: () => void;
}

export function Button(props: ButtonProps) {
  return (
    <StyledButton>
      {props.children}
    </StyledButton>
  );
}

export const StyledButton = styled.button`
  border: 1px solid #0003;
  cursor: pointer;
  font-size: 1rem;
  padding: .3rem .7rem;
  transition: all 300ms;
  display: flex;
  gap: .3rem;
  align-items: center;

  &:hover {
    background-color: #fafafa;
    box-shadow: 0 .2rem .3rem #0003;
  }

  &:active {
    box-shadow: none;
  }
`;