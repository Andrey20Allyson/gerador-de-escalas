
import React, { useState } from 'react';
import { TableEditor, DayEditor } from '../../../app/api/table-edition';
import { ElementList } from '../../utils/react-iteration';
import { DayEditionModal } from '../DayEditionModal';
import { StyledDayEditionGrid } from './styles';
import { DayView } from './utils';

export interface DutyTableGridProps {
  table: TableEditor;
}

export function DutyTableGrid(props: DutyTableGridProps) {
  const { table } = props;
  const [selectedDay, setSelectedDay] = useState<DayEditor>();

  function handleNextDayView() {
    if (!selectedDay) return;

    const nextIndex = (selectedDay.data.index + 1) % table.numOfDays();

    const nextDay = table.getDay(nextIndex);

    setSelectedDay(nextDay);
  }

  function handlePrevDayView() {
    if (!selectedDay) return;

    const prevIndex = selectedDay.data.index - 1;
    const normalizedPrevIndex = (prevIndex < 0 ? table.numOfDays() + prevIndex : prevIndex) % table.numOfDays();

    const prevDay = table.getDay(normalizedPrevIndex);

    setSelectedDay(prevDay);
  }

  function handleCloseDayView() {
    setSelectedDay(undefined);
  }

  return (
    <StyledDayEditionGrid>
      <ElementList
        Component={DayView}
        iter={table.iterDays()}
        communProps={{
          onSelect: day => setSelectedDay(day),
        }} />
      {selectedDay && (
        <DayEditionModal
          onNext={handleNextDayView}
          onPrev={handlePrevDayView}
          onClose={handleCloseDayView}
          day={selectedDay} />
      )}
    </StyledDayEditionGrid>
  );
}