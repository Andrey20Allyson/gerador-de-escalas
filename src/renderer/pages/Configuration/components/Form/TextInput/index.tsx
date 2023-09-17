import React, { ChangeEvent } from 'react';
import styled from 'styled-components';
import { useFormController } from '../context';

export interface TextInputProps {
  title: string;
  name: string;
}

export function TextInput(props: TextInputProps) {
  const {
    title,
    name,
  } = props;

  const controller = useFormController();

  function handleChange(ev: ChangeEvent<HTMLInputElement>) {
    const value = ev.currentTarget.value;

    controller
      .field(name)
      .set(value);
  }

  return (
    <StyledTextInput>
      {title}
      <input className='text-input' onChange={handleChange} type="text" />
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