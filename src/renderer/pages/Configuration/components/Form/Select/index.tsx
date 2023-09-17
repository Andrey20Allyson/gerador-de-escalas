import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';
import { useFormController } from '../context';
import { PropsWithName, PropsWithTitle } from '../types';

export interface SelectProps extends PropsWithChildren, PropsWithName, PropsWithTitle { }

export function Select(props: SelectProps) {
  const { children, name } = props;
  
  const constroller = useFormController();
  const field = constroller.field(name);

  return (
    <StyledSelect>
      <label>Gênero</label>
      <select ref={field.createRefHandler()}>
        {children}
      </select>
    </StyledSelect>
  );
}

export const StyledSelect = styled.div`
  display: flex;
  flex-direction: column;
  gap: .3rem;
  padding: .2rem;
  justify-content: start;

  &>select {
    height: min-content;
  }
`;