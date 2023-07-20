
import React, { PropsWithChildren, useState } from 'react';
import { TableEditor, DayEditor } from '../../../app/api/table-edition';
import { ElementList } from '../../utils/react-iteration';
import { DayEditionModal } from '../DayEditionModal';
import { StyledDayEditionGrid } from './styles';
import { DayView } from './utils';
import { useEditionModal } from '../../contexts/duty-edition-modal';

export type PropsWithTableEditor<P = unknown> = P & {
  table: TableEditor;
};

export function DutyTableGrid(props: PropsWithTableEditor) {
  const modal = useEditionModal();
  const { table } = props;

  function openModal(day: DayEditor) {
    modal.open(table, { day: day.index() });
  }

  return (
    <StyledDayEditionGrid>
      <ElementList
        Component={DayView}
        iter={table.iterDays()}
        communProps={{
          onSelect: openModal,
        }} />
    </StyledDayEditionGrid>
  );
}