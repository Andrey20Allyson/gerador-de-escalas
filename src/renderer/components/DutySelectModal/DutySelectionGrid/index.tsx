import React from 'react';
import styled from 'styled-components';
import { DayEditor, DutyEditor, WorkerEditor } from '../../../../app/api/table-edition';
import { ElementList, IterProps } from '../../../utils/react-iteration';
import { dutyTitles } from '../../DutyTableGrid/utils';

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

  return (
    <StyledDayCard>
      Dia {day.index() + 1}
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
  box-shadow: -.1rem .1rem .2rem #0004 inset;
  background-color: #00000007;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  &>.duty-row {
    display: flex;
    gap: .3rem;

    &>.duty {
      border-radius: .3rem;
      font-size: .6rem;
      padding: .3rem;
      flex: 1;
      border: 1px solid #0004;
      text-align: center;
      user-select: none;
      transition: all 300ms;
      background-color: #0000;
      
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
    }
  }
`;

export interface DutySelectButtonProps {
  onDutySelected?: DayCardProps['onDutySelected'];
  worker: WorkerEditor;
}

export function DutySelectButton(props: IterProps<DutyEditor, DutySelectButtonProps>) {
  const { onDutySelected, worker } = props;
  const duty = props.entry;

  function handleSelectDuty() {
    if (onDutySelected) {
      onDutySelected(duty);
    }
  }

  const text = dutyTitles.at(duty.index());
  const workerHasDuty = worker.hasDuty(duty.address());

  const canSelect = !duty.isFull() && !worker.isFull();

  return (
    <button className={`duty${canSelect ? ' selectable' : ''}${workerHasDuty ? ' selected' : ''}`} onClick={handleSelectDuty}>
      {text}
    </button>
  );
}