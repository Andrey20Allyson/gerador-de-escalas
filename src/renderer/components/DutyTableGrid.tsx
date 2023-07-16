
import React, { useState } from 'react';
import { DayViewer, TableViewer } from '../../app/api/table-visualization';
import { ElementList } from '../utils/react-iteration';
import { DayViewModal } from './DayViewModal';
import { StyledDayViewGrid } from './DutyTableGrid.styles';
import { DayView } from './DutyTableGrid.utils';

export interface DutyTableGridProps {
  table: TableViewer;
}

export function DutyTableGrid(props: DutyTableGridProps) {
  const { table } = props;
  const [selectedDay, setSelectedDay] = useState<DayViewer | undefined>(table.getDay(0));

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
    <StyledDayViewGrid>
      <ElementList
        Component={DayView}
        iter={table.iterDays()}
        communProps={{
          onSelect: day => setSelectedDay(day),
        }} />
      {selectedDay && (
        <DayViewModal
          onNext={handleNextDayView}
          onPrev={handlePrevDayView}
          onClose={handleCloseDayView}
          day={selectedDay} />
      )}
    </StyledDayViewGrid>
  );
}