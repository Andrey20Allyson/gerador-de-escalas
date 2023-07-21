
import React from 'react';
import { TableEditor } from '../../../app/api/table-edition';
import { ElementList } from '../../utils/react-iteration';
import { useDayEditionModal } from '../DayEditionModal';
import { StyledDayEditionGrid } from './styles';
import { DayView } from './utils';

export type PropsWithTableEditor<P = unknown> = P & {
  table: TableEditor;
};

export function DutyTableGrid(props: PropsWithTableEditor) {
  const modal = useDayEditionModal();
  const { table } = props;

  function openModal(day: number, duty: number) {
    modal.open({ table, dayIndex: day, dutyIndex: duty });
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