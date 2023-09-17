import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';
import { useFormController } from '../context';

export interface SubmitButtonProps extends PropsWithChildren { }

export function SubmitButton(props: SubmitButtonProps) {
  const { children } = props;

  const controller = useFormController();

  return (
    <StyledSubmitButton onClick={() => controller.submit()}>
      {children}
    </StyledSubmitButton>
  );
}

export const StyledSubmitButton = styled.button`
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