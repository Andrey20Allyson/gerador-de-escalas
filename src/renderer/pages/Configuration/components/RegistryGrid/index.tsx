import React, { PropsWithChildren } from 'react';
import { Scrollable } from '../Scrollable';
import { StyledRegistryGrid, StyledRegistryGridBody } from './styles';

export interface RegistryGridProps extends PropsWithChildren { }

export function RegistryGrid(props: RegistryGridProps) {
  const {
    children,
  } = props;

  return (
    <StyledRegistryGridBody>
      <Scrollable className="scrollable-container">
        <StyledRegistryGrid role="grid">
          {children}
        </StyledRegistryGrid>
      </Scrollable>
    </StyledRegistryGridBody>
  );
}