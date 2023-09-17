import React from 'react';
import styled from 'styled-components';
import { useFormController } from '../context';
import { PropsWithName, PropsWithTitle } from '../types';

export interface TextInputProps extends PropsWithName, PropsWithTitle { }

export function TextInput(props: TextInputProps) {
  const {
    title,
    name,
  } = props;

  const controller = useFormController();
  const field = controller.field(name);

  return (
    <StyledTextInput>
      {title}
      <input
        className='text-input'
        ref={field.createRefHandler()}
        onChange={field.createChangeHandler()}
        type="text" />
    </StyledTextInput>
  );
}

export const StyledTextInput = styled.label`
  display: flex;
  flex-direction: column;
  text-indent: .3rem;

  &>.text-input {
    background-color: #fafafa;
    border: 1px solid #0001;
    border-radius: .4rem;
  }
`;