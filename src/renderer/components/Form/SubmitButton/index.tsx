import React, { PropsWithChildren } from 'react';
import { Button } from '../Button';
import { useFormController } from '../context';

export interface SubmitButtonProps extends PropsWithChildren { }

export function SubmitButton(props: SubmitButtonProps) {
  const { children } = props;

  const controller = useFormController();

  return (
    <Button onClick={() => controller.submit()}>
      {children}
    </Button>
  );
}