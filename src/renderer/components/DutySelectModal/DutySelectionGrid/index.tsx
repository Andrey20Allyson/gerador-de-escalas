import { DayEditor, DutyEditor, WorkerEditor } from '../../../../app/api/table-edition';
import { dutyTitles } from '../../../components/DutyTableGrid/utils';
import { getWeekDayLabel } from '../../../utils';
import { ElementList, IterProps } from '../../../utils/react-iteration';
import React from 'react';
import { BsPeopleFill } from 'react-icons/bs';
import styled from 'styled-components';

export interface DutySelectionGridProps {
  worker: WorkerEditor;
  onDutySelected?: (duty: DutyEditor) => void;
}

export function DutySelectionGrid(props: DutySelectionGridProps) {
  const { worker, onDutySelected } = props;
  const table = worker.table;

  return (
    <StyledDutySelectionGrid>
      <ElementList Component={DayCard} communProps={{ onDutySelected, worker }} iter={table.iterDays()} />
    </StyledDutySelectionGrid>
  );
}

const StyledDutySelectionGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  height: min-content;
  gap: .4rem;
  padding: .5rem;
`;

export interface DayCardProps {
  onDutySelected?: DutySelectionGridProps['onDutySelected'];
  worker: WorkerEditor;
}

export function DayCard(props: IterProps<DayEditor, DayCardProps>) {
  const { onDutySelected, worker } = props;
  const day = props.entry;

  const weekDayLabel = getWeekDayLabel(day.weekDayIndex());

  return (
    <StyledDayCard>
      Dia {day.index() + 1} - {weekDayLabel}
      <span className='duty-row'>
        <ElementList Component={DutySelectButton} communProps={{ onDutySelected, worker }} iter={day.iterDuties()} />
      </span>
    </StyledDayCard>
  );
}

export const StyledDayCard = styled.span`
  border: 1px solid #0005;
  border-radius: .5rem;
  padding: .25rem;
  box-shadow: -.1rem .1rem .2rem #0004;
  background-color: #ffffff14;
  font-size: .8rem;
  display: flex;
  font-weight: bold;
  flex-direction: column;
  align-items: stretch;
  text-align: center;

  &>.duty-row {
    display: flex;
    gap: .3rem;
  }
`;

export interface DutySelectButtonProps {
  onDutySelected?: DayCardProps['onDutySelected'];
  worker: WorkerEditor;
}

export function DutySelectButton(props: IterProps<DutyEditor, DutySelectButtonProps>) {
  const { onDutySelected, worker } = props;
  const duty = props.entry;

  const text = dutyTitles.at(duty.index());
  const selected = worker.hasDuty(duty.address());

  const canSelect = duty.canAddWorker(worker);

  function handleSelectDuty() {
    if (selected || canSelect) {
      onDutySelected?.(duty);
    }
  }

  return (
    <StyledDutySelectButton className={`${canSelect ? ' selectable' : ''}${selected ? ' selected' : ''}`} onClick={handleSelectDuty}>
      {text}
      <span className={`worker-quantity-display${duty.numOfWorkers() < 2 ? ' low-quantity' : ''}`}>
        {duty.numOfWorkers()}
        <BsPeopleFill />
      </span>
    </StyledDutySelectButton>
  );
}

const StyledDutySelectButton = styled.button`
  border-radius: .3rem;
  font-size: .6rem;
  padding: .15rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: .2rem;
  flex: 1;
  border: 1px solid #0004;
  text-align: center;
  user-select: none;
  transition: all 300ms;
  background-color: #0000;
  font-weight: bold;

  &>.worker-quantity-display {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: .2rem;

    &.low-quantity {
      color: #e21111;
    }
  }
  
  &.selectable {
    background-color: #4fca632d;
    cursor: pointer;

    &:hover {
      background-color: #4fca6367;
    }
  }
  
  &.selected {
    background-color: #4fca63;
    cursor: pointer;

    &:hover {
      background-color: #4fca6394
    }
  }
`;