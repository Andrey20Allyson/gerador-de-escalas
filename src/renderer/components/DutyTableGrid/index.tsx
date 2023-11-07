import { useDayEditionModal } from '@gde/renderer/components/DayEditionModal';
import { EditorContext } from '@gde/renderer/components/EditorTypeSelect/context';
import { firstMondayFromYearAndMonth, iterRange } from '@gde/renderer/utils';
import { ElementList } from '@gde/renderer/utils/react-iteration';
import React from 'react';
import { StyledDayEditionGrid } from './styles';
import { DayView } from './utils';

export function DutyTableGrid() {
  const modal = useDayEditionModal();
  const table = EditorContext.useEditorOrThrow();

  function openModal(day: number, duty: number) {
    modal.open({ table, dayIndex: day, dutyIndex: duty });
  }

  const firstMonday = firstMondayFromYearAndMonth(table.data.year, table.data.month);
  const firstSunday = (firstMonday + 7 - 1) % 7;

  return (
    <StyledDayEditionGrid>
      <p>Domingo</p>
      <p>Segunda</p>
      <p>Terça</p>
      <p>Quarta</p>
      <p>Quinta</p>
      <p>Sexta</p>
      <p>Sabado</p>
      <ElementList
        Component={() => <span></span>}
        iter={iterRange(0, 7 - firstSunday)} />
      <ElementList
        Component={DayView}
        iter={table.iterDays()}
        communProps={{
          onSelect: openModal,
        }} />
    </StyledDayEditionGrid>
  );
}