import React from 'react';
import styled from 'styled-components';
import { FormProvider, FormProviderProps } from '../context';

export interface RootProps extends FormProviderProps { }

export function Root(props: RootProps) {
  return (
    <StyledRoot role='form'>
      <FormProvider {...props} />
    </StyledRoot>
  );
}

export const StyledRoot = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;