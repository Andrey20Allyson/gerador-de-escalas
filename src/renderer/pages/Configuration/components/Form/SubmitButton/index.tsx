import React from 'react';
import styled from 'styled-components';
import { useFormController } from '../context';

export interface SubmitButtonProps {
  title: string;
}

export function SubmitButton(props: SubmitButtonProps) {
  const { title } = props;

  const controller = useFormController();

  return (
    <StyledSubmitButton onSubmit={() => controller.submit()}>
      {title}
    </StyledSubmitButton>
  );
}

export const StyledSubmitButton = styled.button`
  
`;